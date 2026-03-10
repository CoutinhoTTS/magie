/* eslint-disable no-console */
import type { Run, Workflow, WorkflowStreamEvent } from '@mastra/core/workflows'
import type { WebContents } from 'electron'
import type { WorkflowID } from '../workflows'
import type ContextRuntime from './contextRuntime'
import util from 'node:util'
import { getWorkflowById } from '../workflows'

export type Id = string | null
type Context = ContextRuntime | null

// Workflow 返回结果类型映射
interface WorkflowResultMap {
  'gateway-workflow': { nextWorkflowId: string }
  'chat-workflow': { response: string }
  'page-workflow': {
    requirements: string
    patch: Array<{
      prop: string
      oldValue: any
      newValue: any
      reason?: string
    }>
    summary: string
  }
}

export default class {
  private context: Context = null
  private currentWorkflow: Workflow | null = null
  // private currentWorkflowId: WorkflowID | null = null
  private currentRunId: Id = null
  private currentSuspendedStepId: Id = null
  private activeRuns = new Map<string, Run>()
  private unsubscribers = new WeakMap<Run, () => void>()
  private wc: WebContents | null = null
  static MAX_RETRY = 3
  constructor(option: {
    context: Context
  }) {
    const { context } = option
    this.context = context
    this.context?.abortEventListener(this.abortWorkflow)
    this.wc = this.context?.getCurrentWc() ?? null
  }

  run(parmas: {
    id?: WorkflowID
    option: any
  }) {
    return this.setCurrentWorkflow(parmas?.id || 'gateway-workflow', parmas.option)
  }

  async setCurrentWorkflow<T extends WorkflowID>(id: T, option: any) {
    this.currentWorkflow = getWorkflowById(id) as Workflow | null
    if (!this.currentWorkflow) {
      console.error(`Workflow ${id} not found`)
      return
    }
    const run = await this.currentWorkflow.createRun()
    this.currentRunId = run.runId
    this.activeRuns.set(this.currentRunId, run)
    this.watchWorkflow(run)
    // console.log('唯一匹配:', util.inspect(option, { depth: null, colors: true }))
    const result = await run.start({
      inputData: { option: structuredClone(option) },
    })
    // console.log('唯二匹配:', util.inspect(option, { depth: null, colors: true }))

    if (result?.status === 'success') {
      const _result = result.result as WorkflowResultMap[T]
      if ('nextWorkflowId' in _result && _result.nextWorkflowId) {
        const validWorkflowIds: WorkflowID[] = ['chat-workflow', 'gateway-workflow', 'page-workflow']
        if (validWorkflowIds.includes(_result.nextWorkflowId as WorkflowID)) {
          this.setCurrentWorkflow(_result?.nextWorkflowId as WorkflowID, option)
        }
      }
    }
  }

  private watchWorkflow(run: Run) {
    const unsubscribe = run.watch((event: WorkflowStreamEvent) => {
      if (event.type === 'workflow-finish' || event.type === 'workflow-canceled') {
        this.clearWatch(run)
      }

      if (event.type === 'workflow-step-suspended') {
        this.currentSuspendedStepId = event.payload.id
        const suspendPayload = event.payload.suspendPayload as any

        // 根据暂停类型发送不同事件
        if (['confirm_modify'].includes(suspendPayload?.type)) {
          // 修改确认事件 - 包含新旧值用于 diff
          this.wc = this.wc ?? this.context?.getCurrentWc() ?? null
          this.wc?.send('workflow:confirm_modify', {
            runId: this.currentRunId,
            stepId: event.payload.id,
            patch: suspendPayload.patch,
            summary: suspendPayload.summary,
          })
        }
        if (['select_property'].includes(suspendPayload?.type)) {
          console.log('唯一匹配:', util.inspect(suspendPayload, { depth: null, colors: true }))
        }
      }
    })

    this.unsubscribers.set(run, unsubscribe)
  }

  private clearWatch(run: Run) {
    const unsubscribe = this.unsubscribers.get(run)
    if (unsubscribe) {
      unsubscribe()
      this.unsubscribers.delete(run)
    }
  }

  setCurrentRunId(id: Id) {
    this.currentRunId = id
  }

  getCurrentRunId() {
    return this.currentRunId
  }

  setCurrentSuspendedStepId(id: Id) {
    this.currentSuspendedStepId = id
  }

  getCurrentSuspendedStepId() {
    return this.currentSuspendedStepId
  }

  abortWorkflow() {
    if (this.currentRunId) {
      const run = this.activeRuns.get(this.currentRunId)
      if (run) {
        run.cancel()
        this.clearWatch(run)
        this.activeRuns.delete(this.currentRunId)
      }
      this.currentRunId = null
      this.context?.clearCurrentWc?.()
    }
  }

  async resumeWorkflow(runId: string, resumeData: any): Promise<any> {
    console.log('runId====>', runId)
    console.log('resumeData====>', resumeData)
    const run = this.activeRuns.get(runId)
    if (!run) {
      throw new Error(`No active workflow run found: ${runId}`)
    }

    const result = await run.resume({
      resumeData,
      step: this.currentSuspendedStepId || 'modifyProperty',
    })

    this.currentSuspendedStepId = null

    return result
  }

  async cancelWorkflow(runId: string): Promise<{ success: boolean }> {
    const run = this.activeRuns.get(runId)
    if (!run) {
      throw new Error(`No active workflow run found: ${runId}`)
    }

    await run.cancel()
    this.activeRuns.delete(runId)
    return { success: true }
  }
}
