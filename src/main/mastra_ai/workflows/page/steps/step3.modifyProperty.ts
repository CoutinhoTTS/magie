import type { TextDeltaChunk } from '~/types'
import { randomUUID } from 'node:crypto'
import { createStep } from '@mastra/core/workflows'
import { z } from 'zod'
import { getAgent, getWC } from '~/main/mastra_ai'
import { buildModifyPrompt } from '~/main/mastra_ai/prompts'

/**
 * 输入 Schema
 */
export const modifyPropertyInputSchema = z.object({
  targetProperty: z.any().describe('来自 step2 的目标属性信息'),
  currentProperty: z.any(),
  message: z.string(),
})

/**
 * 输出 Schema
 */
export const modifyPropertyOutputSchema = z.object({
  requirements: z.string(),
  patch: z.array(z.object({
    prop: z.string(),
    oldValue: z.any(),
    newValue: z.any(),
    reason: z.string().optional(),
  })),
  summary: z.string(),
  confirmed: z.boolean().optional(),
})

/**
 * 暂停 Schema - 向前端抛出选择
 */
export const modifyPropertySuspendSchema = z.object({
  type: z.literal('confirm_modify'),
  patch: z.array(z.any()),
  summary: z.string(),
})

/**
 * 恢复 Schema - 接收前端确认
 */
export const modifyPropertyResumeSchema = z.object({
  confirmed: z.boolean(),
})

export type ModifyPropertyOutput = z.infer<typeof modifyPropertyOutputSchema>

/**
 * 创建模拟的 text-delta chunk
 */
function createTextChunk(text: string, runId?: string): TextDeltaChunk {
  return {
    type: 'text-delta',
    runId: runId || randomUUID(),
    payload: {
      id: `text-${randomUUID()}`,
      text,
    },
  }
}

/**
 * 解析 Agent 返回的结果
 */
function parseAgentResult(text: string): { changes: any[], summary: string } {
  try {
    let jsonStr = text.trim()

    // 移除可能的 markdown 代码块标记
    if (jsonStr.includes('```')) {
      jsonStr = jsonStr.replace(/```json?\n?/g, '').replace(/```/g, '').trim()
    }

    const parsed = JSON.parse(jsonStr)

    return {
      changes: parsed.changes || [],
      summary: parsed.summary || '修改完成',
    }
  }
  catch (error) {
    console.error('step3: 解析 Agent 结果失败', error)
    return {
      changes: [],
      summary: '解析失败，请重试',
    }
  }
}

export default createStep({
  id: 'modifyProperty',
  description: '使用 Agent Stream 分析用户需求并生成修改方案',
  inputSchema: modifyPropertyInputSchema,
  outputSchema: modifyPropertyOutputSchema,
  suspendSchema: modifyPropertySuspendSchema,
  resumeSchema: modifyPropertyResumeSchema,
  execute: async ({ inputData, suspend, resumeData }) => {
    // 从 step2 获取数据
    const { targetProperty, message } = inputData

    // 获取 wc 和 agent
    const wc = getWC()
    const agent = getAgent('pageAgent')

    if (!agent) {
      throw new Error('Agent not found')
    }

    // 如果有 resumeData，说明是用户确认后恢复
    if (resumeData) {
      if (!resumeData.confirmed) {
        wc?.send('llm:streaming', createTextChunk('已取消修改'))
        wc?.send('llm:finished')
        return {
          requirements: '用户取消修改',
          patch: [],
          summary: '已取消',
          confirmed: false,
        }
      }

      wc?.send('llm:streaming', createTextChunk('修改已应用'))
      wc?.send('llm:finished')
      return {
        requirements: '用户已确认',
        patch: [],
        summary: '修改已应用',
        confirmed: true,
      }
    }

    // 用于存储解析结果
    let parsedChanges: any[] = []
    let parsedSummary: string = ''

    // 构建 prompt，只传入目标属性信息，不传完整 JSON
    const prompt = buildModifyPrompt(message, targetProperty)
    const stream = await agent.stream(prompt, {
      onChunk: (chunk: any) => {
        wc?.send('llm:streaming', chunk)
      },
      onFinish: async (result: any) => {
        // 解析结果
        const parsed = parseAgentResult(result.text)
        parsedChanges = parsed.changes
        parsedSummary = parsed.summary

        // 如果没有变更，直接返回 summary，不暂停
        if (!parsedChanges || parsedChanges.length === 0) {
          wc?.send('llm:streaming', createTextChunk(parsedSummary))
          wc?.send('llm:finished')
          return
        }

        // 有变更，暂停工作流，向前端抛出选择确认
        await suspend({
          type: 'confirm_modify',
          patch: parsedChanges,
          summary: parsedSummary,
        })
      },
      onError: ({ error }: { error: any }) => {
        console.error('step3: Stream 错误', error)
        wc?.send('llm:error', error)
        wc?.send('llm:abort')
        wc?.send('llm:finished')
      },
    })
    await stream.getFullOutput()

    // 如果没有变更，直接返回结果
    if (parsedChanges.length === 0) {
      return {
        requirements: '',
        patch: [],
        summary: parsedSummary,
      }
    }

    return {
      requirements: '',
      patch: [],
      summary: parsedSummary,
    }
  },
})
