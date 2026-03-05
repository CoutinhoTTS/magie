import type * as agents from './agents'
import type { AgentRuntimeType, ContextRuntimeType } from '~/main/mastra_ai/runtime'
import { ipcMain } from 'electron'
import { AgentRuntime, ContextRuntime, WorkflowRuntime } from '~/main/mastra_ai/runtime'

let _wc: ContextRuntimeType | null = null
let _agent: AgentRuntimeType | null = null

export function getWC() {
  return _wc?.getCurrentWc()
}

export function getAgent(): AgentRuntimeType | undefined
export function getAgent(key: keyof typeof agents): ReturnType<AgentRuntimeType['getAgent']> | undefined
export function getAgent(key?: keyof typeof agents) {
  if (key) {
    return _agent?.getAgent(key)
  }
  return _agent ?? undefined
}

export function init_mastra() {
  const context = new ContextRuntime()
  _wc = context
  const agent = new AgentRuntime(context)
  _agent = agent
  const workflowRuntime = new WorkflowRuntime({
    context,
  })
  context.newAbortController()

  // 启动对话 - 统一入口
  ipcMain.handle('agent_chat', async (event, option) => {
    const wc = event.sender
    context.setCurrentWc(wc)
    if (option === false) {
      context.abortWorkflow()
      wc.send('llm:abort')
      return
    }
    agent.setModel()
    workflowRuntime.run({
      option,
    })
  })

  // 恢复工作流
  ipcMain.handle('workflow:resume', async (_event, { runId, resumeData }) => {
    return await workflowRuntime.resumeWorkflow(runId, resumeData)
  })
}
