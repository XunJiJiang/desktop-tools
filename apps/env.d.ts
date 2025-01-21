/* eslint-disable @typescript-eslint/no-explicit-any */
/// <reference types="vite/client" />

interface Window {
  ipcRenderer: {
    on: (channel: string, listener: (...args: any[]) => void) => void
    off: (channel: string, listener: (...args: any[]) => void) => void
    send: (channel: string, ...args: any[]) => void
    invoke: (channel: string, ...args: any[]) => Promise<any>
  }
}
