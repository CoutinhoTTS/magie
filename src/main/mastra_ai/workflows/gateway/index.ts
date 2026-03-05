import { createWorkflow } from '@mastra/core/workflows'
import { z } from 'zod'
import detectIntentStep from './steps/detectIntent'

/**
 * Gateway 工作流 - 统一入口
 *
 * 流程:
 * 1. detectIntent: 检测用户意图
 * 2. routeWorkflow: 根据意图决定路由
 *
 * 注意：子工作流的调用由 workflow-handler.ts 处理
 * 这里只负责意图检测和路由决策
 */
export const gatewayWorkflow = createWorkflow({
  id: 'gateway-workflow',
  inputSchema: z.object({
    option: z.object({
      message: z.string(),
    }),
  }),
  outputSchema: z.object({
    nextWorkflowId: z.string(),
  }),
})
  .then(detectIntentStep)
  .commit()
