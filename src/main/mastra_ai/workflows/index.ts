import type { Workflow } from '@mastra/core/workflows'

import { chatWorkflow } from './chat'
import { gatewayWorkflow } from './gateway'
import { pageWorkflow } from './page'

export { chatWorkflow, gatewayWorkflow }

// Workflow ID 类型
export type WorkflowID = 'chat-workflow' | 'gateway-workflow' | 'page-workflow'

// Workflow ID 到类型的映射
export interface WorkflowTypeMap {
  'gateway-workflow': typeof gatewayWorkflow
  'chat-workflow': typeof chatWorkflow
  'page-workflow': typeof pageWorkflow
}

// 类型安全的 getWorkflowById 包装函数
export function getWorkflowById<T extends WorkflowID>(
  id: T,
): WorkflowTypeMap[T] | undefined {
  const workflowMap: Record<WorkflowID, Workflow> = {
    'gateway-workflow': gatewayWorkflow,
    'chat-workflow': chatWorkflow,
    'page-workflow': pageWorkflow,
  }
  return workflowMap[id] as WorkflowTypeMap[T] | undefined
}
