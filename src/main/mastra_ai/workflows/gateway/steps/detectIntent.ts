import { createStep } from '@mastra/core/workflows'
import { z } from 'zod'
import { getAgent, getWC } from '~/main/mastra_ai'
import { WorkflowRuntime } from '~/main/mastra_ai/runtime'

export const DefaultInputSchema = z.object({
  option: z.object({
    message: z.string(),
  }),
})

// 意图检测输出 Schema
export const detectIntentOutputSchema = z.object({
  nextWorkflowId: z.enum(['chat-workflow', 'page-workflow']),
})

export type DetectIntentOutput = z.infer<typeof detectIntentOutputSchema>

export default createStep({
  id: 'detectIntent',
  description: '检测用户消息意图，决定路由到哪个子工作流',
  inputSchema: DefaultInputSchema,
  outputSchema: detectIntentOutputSchema,
  execute: async ({ inputData }) => {
    const { option } = inputData
    const { message } = option
    const MAX_RETRY = WorkflowRuntime.MAX_RETRY
    const agent = getAgent()
    const classifierAgent = getAgent('intentClassifierAgent')
    if (!classifierAgent || !agent) {
      throw new Error('Agent not found')
    }
    const wc = getWC()
    const classifyIntent = async (): Promise<{ workflowId: 'chat-workflow' | 'page-workflow' }> => {
      let streamError: Error | null = null
      const result = await classifierAgent.stream(message, {
        providerOptions: {
          'zhipuai': { thinking: { type: 'disabled' } },
          'kimi-for-coding': { thinking: { type: 'disabled' } },
          'openai': { reasoning: { enabled: true }, thinking: { type: 'disabled' } },
          'openrouter': { reasoning: { enabled: true }, thinking: { type: 'disabled' } },
        },
        onError: ({ error }) => {
          streamError = error instanceof Error ? error : new Error(String(error))
        },
      })
      if (streamError) {
        throw streamError
      }
      const full = await result.getFullOutput()
      let jsonStr = full.text.trim()
      if (jsonStr.includes('```')) {
        jsonStr = jsonStr.replace(/```json?\n?/g, '').replace(/```/g, '').trim()
      }
      const parsed = JSON.parse(jsonStr) as { workflowId: 'chat-workflow' | 'page-workflow', reason?: string }
      if (!['chat-workflow', 'page-workflow'].includes(parsed.workflowId)) {
        throw new Error(`Invalid workflowId: ${parsed.workflowId}`)
      }
      return { workflowId: parsed.workflowId }
    }

    let lastError: unknown = null
    let retryCount = 0
    while (retryCount < MAX_RETRY) {
      try {
        const result = await classifyIntent()
        return { nextWorkflowId: result.workflowId }
      }
      catch (error) {
        lastError = error
        retryCount++
      }
    }

    wc?.send('llm:error', lastError)
    wc?.send('llm:abort')
    wc?.send('llm:finished')
    throw new Error(`Intent detection failed after ${MAX_RETRY} retries: ${lastError instanceof Error ? lastError.message : 'Unknown error'}`)
  },
})
