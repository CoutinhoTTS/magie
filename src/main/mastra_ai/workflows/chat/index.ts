import { createWorkflow } from '@mastra/core/workflows'
import { z } from 'zod'
import streamChatStep from './steps/streamChat'

/**
 * 普通聊天工作流
 * 封装 handleAgentChat 逻辑为工作流
 */
export const chatWorkflow = createWorkflow({
  id: 'chat-workflow',
  inputSchema: z.object({
    option: z.object({
      message: z.string(),
    }),
  }),
  outputSchema: z.object({
    end: z.boolean(),
  }),
})
  .then(streamChatStep)
  .commit()
