import type { WebContents } from 'electron'

export type Id = string | null

export default class {
  private currentWc: WebContents | null = null
  private abortController: AbortController | null = null
  private abortFunction: (() => void) | null = null
  constructor(options?: { wc?: WebContents }) {
    if (options?.wc) {
      this.currentWc = options.wc
    }
  }

  setCurrentWc(wc: WebContents): void {
    this.currentWc = wc
  }

  getCurrentWc(): WebContents | null {
    return this.currentWc
  }

  clearCurrentWc(): void {
    this.currentWc = null
  }

  newAbortController() {
    this.abortController = new AbortController()
  }

  get signal(): AbortSignal | undefined {
    return this.abortController?.signal
  }

  abortEventListener(fn: () => void) {
    this.abortFunction = fn
  }

  abortWorkflow() {
    if (this.abortController) {
      this.abortController.abort()
      this.abortController = null
    }
    this?.abortFunction?.()
    this.currentWc?.send('llm:abort')
  }
}
