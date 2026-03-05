import type { TextDeltaChunk } from '~/types'
import { randomUUID } from 'node:crypto'
import { createStep } from '@mastra/core/workflows'
import { z } from 'zod'
import { getWC } from '~/main/mastra_ai'

export const DefaultInputSchema = z.object({
  option: z.object({
    message: z.string(),
    currentProperty: z.any(),
  }),
})
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

export default createStep({
  id: 'checkCurrentProperty',
  description: '检测是否有选中的组件信息',
  inputSchema: DefaultInputSchema,
  outputSchema: z.object({
    currentProperty: z.any(),
    message: z.string(),
  }),
  execute: async ({ inputData, bail }) => {
    const { option } = inputData
    const wc = getWC()
    // 检查是否有 currentProperty
    if (!option?.currentProperty) {
      const message = '请先选择需要修改的组件。'
      // 发送消息到渲染进程
      wc?.send('llm:streaming', createTextChunk(message))
      wc?.send('llm:finished')

      // 使用 bail 提前结束工作流
      return bail()
    }
    return {
      currentProperty: structuredClone(option?.currentProperty),
      message: option?.message,
    }
  },
})
