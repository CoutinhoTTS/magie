/// <reference types="electron" />

import type { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      invoke: <T = any>(channel: string, ...args: unknown[]) => Promise<T>
    }
  }
}

export {}
