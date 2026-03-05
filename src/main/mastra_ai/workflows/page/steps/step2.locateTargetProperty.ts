import type { PropertyConfigItem } from '~/shared/propertyConfigs'
import util from 'node:util'
import { createStep } from '@mastra/core/workflows'
import Fuse from 'fuse.js'
import { z } from 'zod'
import { getAgent, getWC } from '~/main/mastra_ai'
import { WorkflowRuntime } from '~/main/mastra_ai/runtime'
import { getPropertyConfig } from '~/shared/propertyConfigs'

/**
 * 输入 Schema
 */
export const locateTargetPropertyInputSchema = z.object({
  currentProperty: z.any().describe('当前选中的组件属性信息'),
  message: z.string(),
})

/**
 * 输出 Schema
 */
export const locateTargetPropertyOutputSchema = z.object({
  targetProperty: z.any().describe('定位到的目标属性信息'),
  currentProperty: z.any(),
  message: z.string(),
})

export type LocateTargetPropertyOutput = z.infer<typeof locateTargetPropertyOutputSchema>

/**
 * 可编辑字段索引项
 */
interface EditableIndexItem {
  path: string // 属性路径，如 "props.cardTab[0].label"
  preview: string // 值预览
  type: string // 值类型
  label?: string // 从 propertyConfig 获取，如 "Tab名称"
  description?: string // 从 propertyConfig 获取，如 "当Tab只有一个的时候默认是不显示的"
  configPath?: string // 匹配到的配置路径，如 "cardTab.label"
  tagName?: string // 组件 tagName
}

/**
 * 扁平化 propertyConfig，处理嵌套 children 和点号路径
 */
function flattenPropertyConfig(
  config: PropertyConfigItem[],
  basePath = '',
): Map<string, PropertyConfigItem> {
  const result = new Map<string, PropertyConfigItem>()

  for (const item of config) {
    const fullPath = basePath ? `${basePath}.${item.prop}` : item.prop
    result.set(fullPath, item)

    if (item.children?.length) {
      const childMap = flattenPropertyConfig(item.children, item.prop)
      for (const [childPath, childConfig] of childMap) {
        result.set(childPath, childConfig)
      }
    }
  }

  return result
}

/**
 * 匹配路径到配置项
 * 例如 "props.cardTab[0].label" 匹配 "cardTab.label"
 */
function matchPathToConfig(
  path: string,
  configMap: Map<string, PropertyConfigItem>,
): { config: PropertyConfigItem | null, configPath: string } {
  // 移除数组索引: cardTab[0].label -> cardTab.label
  const normalizedPath = path.replace(/\[\d+\]/g, '')

  // 尝试直接匹配
  if (configMap.has(normalizedPath)) {
    return { config: configMap.get(normalizedPath)!, configPath: normalizedPath }
  }

  // 尝试移除 "props." 前缀
  const withoutProps = normalizedPath.replace(/^props\./, '')
  if (configMap.has(withoutProps)) {
    return { config: configMap.get(withoutProps)!, configPath: withoutProps }
  }

  // 尝试匹配嵌套路径的后缀
  const segments = withoutProps.split('.')
  for (let i = 1; i < segments.length; i++) {
    const partialPath = segments.slice(i).join('.')
    if (configMap.has(partialPath)) {
      return { config: configMap.get(partialPath)!, configPath: partialPath }
    }
  }

  return { config: null, configPath: '' }
}

/**
 * IndexBuilder - 递归扫描 JSON 构建可编辑字段索引
 * 数组路径格式: props.cardTab[0].label
 * 支持嵌套组件的 propertyConfig 查找
 */
function buildEditableIndex(obj: any, basePath = '', rootTagName?: string): EditableIndexItem[] {
  const results: EditableIndexItem[] = []

  function walk(node: any, path: string, parentTagName?: string) {
    if (!node || typeof node !== 'object')
      return

    // 检查当前节点的 tagName（支持嵌套组件）
    const nodeTagName = node.tagName || parentTagName

    // 动态获取当前组件的 propertyConfig
    const nodeConfig = nodeTagName ? getPropertyConfig(nodeTagName) : undefined
    const configMap = nodeConfig ? flattenPropertyConfig(nodeConfig) : new Map()

    for (const [key, value] of Object.entries(node)) {
      // 跳过内部属性
      if (key === 'tagName' || key === 'tagId' || key === 'id' || key === 'children') {
        continue
      }

      const currentPath = path ? `${path}.${key}` : key

      // 收集基础类型字段
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        const { config, configPath } = matchPathToConfig(currentPath, configMap)
        results.push({
          path: currentPath,
          preview: String(value).slice(0, 30),
          type: typeof value,
          label: config?.label,
          description: config?.description,
          configPath: configPath || undefined,
          tagName: nodeTagName,
        })
      }

      // 递归处理对象和数组
      if (typeof value === 'object' && value !== null) {
        if (Array.isArray(value)) {
          value.forEach((item, idx) => {
            if (item && typeof item === 'object') {
              // 检查数组项是否有自己的 tagName（嵌套组件）
              const itemTagName = item.tagName || nodeTagName
              walk(item, `${currentPath}[${idx}]`, itemTagName)
            }
          })
        }
        else {
          // 如果子对象有自己的 tagName，使用它的 propertyConfig
          const childTagName = (value as any).tagName || nodeTagName
          walk(value, currentPath, childTagName)
        }
      }
    }
  }

  walk(obj, basePath, rootTagName)
  return results
}

/**
 * 解析 Agent 返回的 JSON
 */
function parseAgentResult(text: string): { target: string[], action: string, indexHint: number | 'last' | null } | null {
  try {
    let jsonStr = text.trim()

    // 移除可能的 markdown 代码块标记
    if (jsonStr.includes('```')) {
      // 匹配 ```json 或 ``` 开头，以及结尾的 ```
      jsonStr = jsonStr
        .replace(/```(?:json)?\s*/gi, '') // 移除开头的 ```json 或 ```（包括可能的空白）
        .replace(/```\s*$/g, '') // 移除结尾的 ```
        .trim()
    }

    const parsed = JSON.parse(jsonStr)

    return {
      target: parsed.target || [],
      action: parsed.action || 'modify',
      indexHint: parsed.indexHint ?? null,
    }
  }
  catch (error) {
    console.error('step2: 解析 Agent 结果失败', error)
    return null
  }
}

/**
 * 使用 Fuse.js 进行综合匹配
 * 对目标关键词进行组合匹配，匹配同时包含多个关键词的路径权重更高
 * 只返回最优解
 */
function fuzzyMatchBest(index: EditableIndexItem[], targetKeywords: string[]): EditableIndexItem | null {
  const fuse = new Fuse(index, {
    keys: [
      { name: 'path', weight: 0.2 },
      { name: 'preview', weight: 0.2 },
      { name: 'label', weight: 0.4 }, // label 权重最高
      { name: 'description', weight: 0.2 }, // description 提供额外上下文
    ],
    threshold: 0.4,
    includeScore: true,
    findAllMatches: true,
  })

  // 对每个关键词进行搜索，收集所有匹配
  const pathScores = new Map<string, { item: EditableIndexItem, matchCount: number, totalScore: number }>()

  for (const keyword of targetKeywords) {
    const results = fuse.search(keyword)
    for (const result of results) {
      const path = result.item.path
      const score = result.score || 0

      if (!pathScores.has(path)) {
        pathScores.set(path, {
          item: result.item,
          matchCount: 0,
          totalScore: 0,
        })
      }

      const existing = pathScores.get(path)!
      existing.matchCount += 1
      existing.totalScore += score
    }
  }

  if (pathScores.size === 0) {
    return null
  }

  // 计算综合分数，取最优解
  const bestResult = Array.from(pathScores.values())
    .map((entry) => {
      // 综合分数 = (关键词总数 - 匹配数) * 权重 + 平均分数
      // 匹配更多关键词的结果排名更高
      const keywordCoverage = (targetKeywords.length - entry.matchCount) / targetKeywords.length
      const avgScore = entry.totalScore / entry.matchCount
      const combinedScore = keywordCoverage * 0.5 + avgScore * 0.5

      return {
        item: entry.item,
        matchCount: entry.matchCount,
        combinedScore,
      }
    })
    .sort((a, b) => {
      // 先按匹配数量降序，再按综合分数升序
      if (a.matchCount !== b.matchCount) {
        return b.matchCount - a.matchCount
      }
      return a.combinedScore - b.combinedScore
    })[0]

  return bestResult?.item || null
}

export default createStep({
  id: 'locateTargetProperty',
  description: '使用 Agent 提取关键词 + Fuse.js 模糊匹配定位属性，只返回最优解',
  inputSchema: locateTargetPropertyInputSchema,
  outputSchema: locateTargetPropertyOutputSchema,
  execute: async ({ inputData, bail }) => {
    const { currentProperty, message } = inputData
    const userInput = message || ''
    const MAX_RETRY = WorkflowRuntime.MAX_RETRY

    if (!userInput) {
      console.error('无用户输入')
      return bail()
    }

    // Step 1: 构建可编辑字段索引（传入 tagName 以支持 propertyConfig 匹配）
    const rootTagName = currentProperty?.tagName
    const index = buildEditableIndex(currentProperty, '', rootTagName)

    console.error('可编辑字段索引数量:', index.length)

    if (index.length === 0) {
      console.error('无可编辑字段')
      return bail()
    }

    // Step 2: 调用 Agent Stream 提取关键词
    const agent = getAgent('keywordExtractorAgent')
    const wc = getWC()

    if (!agent) {
      throw new Error('Agent not found')
    }

    const locateTarget = async (): Promise<{ path: string, currentValue: string, type: string, action: string }> => {
      let streamError: Error | null = null

      const stream = await agent.stream(userInput, {
        onChunk: (chunk: any) => {
          wc?.send('llm:streaming', chunk)
        },
        onError: ({ error }: { error: any }) => {
          streamError = error instanceof Error ? error : new Error(String(error))
        },
      })

      const full = await stream.getFullOutput()

      if (streamError) {
        throw streamError
      }

      console.error('Agent 原始返回:', full.text)
      const extracted = parseAgentResult(full.text)

      if (!extracted || extracted.target.length === 0) {
        throw new Error('Agent 无法提取目标关键词')
      }

      console.error('提取的目标:', extracted.target)
      console.error('行为:', extracted.action)
      console.error('序数提示:', extracted.indexHint)

      // Step 3: 使用 Fuse.js 综合匹配，只取最优解
      const bestMatch = fuzzyMatchBest(index, extracted.target)

      console.error('最优匹配:', util.inspect(bestMatch, { depth: null, colors: true }))

      if (!bestMatch) {
        throw new Error('无匹配结果')
      }

      return {
        path: bestMatch.path,
        currentValue: bestMatch.preview,
        type: bestMatch.type,
        action: extracted.action,
      }
    }

    let lastError: unknown = null
    let retryCount = 0

    while (retryCount < MAX_RETRY) {
      try {
        const result = await locateTarget()

        console.error('step2 返回结果:', util.inspect(result, { depth: null, colors: true }))

        return {
          targetProperty: result,
          currentProperty,
          message,
        }
      }
      catch (error) {
        lastError = error
        retryCount++
      }
    }

    wc?.send('llm:error', lastError)
    wc?.send('llm:abort')
    wc?.send('llm:finished')
    throw new Error(`Locate target failed after ${MAX_RETRY} retries: ${lastError instanceof Error ? lastError.message : 'Unknown error'}`)
  },
})
