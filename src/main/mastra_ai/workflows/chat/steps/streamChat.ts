import { createStep } from '@mastra/core/workflows'
import { z } from 'zod'
import { getAgent, getWC } from '~/main/mastra_ai'
import { WorkflowRuntime } from '~/main/mastra_ai/runtime'

export const DefaultInputSchema = z.object({
  option: z.object({
    message: z.string(),
  }),
})
/**
 * 聊天流式输出 Step
 */
export default createStep({
  id: 'streamChat',
  description: '使用 chatAgent 进行流式对话',
  inputSchema: DefaultInputSchema,
  outputSchema: z.object({
    end: z.boolean(),
  }),
  execute: async ({ inputData }) => {
    const { option } = inputData
    const { message } = option
    const MAX_RETRY = WorkflowRuntime.MAX_RETRY
    const agent = getAgent('chatAgent')
    const wc = getWC()

    if (!agent) {
      throw new Error('Chat agent not found')
    }

    const chat = async (): Promise<void> => {
      let streamError: Error | null = null
      const result = await agent.stream(message, {
        providerOptions: {
          'zhipuai': { thinking: { type: 'disabled' } },
          'kimi-for-coding': { thinking: { type: 'disabled' } },
          'openai': { reasoning: { enabled: true }, thinking: { type: 'disabled' } },
          'openrouter': { reasoning: { enabled: true }, thinking: { type: 'disabled' } },
        },
        onFinish: () => {
          wc?.send('llm:finished')
        },
        onChunk: (chunk: any) => {
          wc?.send('llm:streaming', chunk)
        },
        onAbort: () => {
          wc?.send('llm:abort')
        },
        onError: ({ error }) => {
          streamError = error instanceof Error ? error : new Error(String(error))
        },
      })
      if (streamError) {
        throw streamError
      }
      await result.getFullOutput()
    }

    let lastError: unknown = null
    let retryCount = 0

    while (retryCount < MAX_RETRY) {
      try {
        await chat()
        return { end: true }
      }
      catch (error) {
        lastError = error
        retryCount++

        if (retryCount < MAX_RETRY) {
          // 发送重试提示
          wc?.send('llm:streaming', {
            type: 'text-delta',
            payload: {
              id: `retry-${Date.now()}`,
              text: `\n[对话出错，正在重试 ${retryCount}/${MAX_RETRY}]\n`,
            },
          })
        }
      }
    }

    // 所有重试失败
    wc?.send('llm:error', lastError)
    wc?.send('llm:abort')
    throw new Error(`Chat failed after ${MAX_RETRY} retries: ${lastError instanceof Error ? lastError.message : 'Unknown error'}`)
  },
})
