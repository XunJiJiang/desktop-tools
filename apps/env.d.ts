/* eslint-disable @typescript-eslint/no-explicit-any */
/// <reference types="vite/client" />

type UnListen = () => void

interface Window {
  ipcRenderer: {
    on: (channel: string, listener: (...args: any[]) => void) => UnListen
    off: (channel: string, listener: (...args: any[]) => void) => void
    send: (channel: string, ...args: any[]) => void
    invoke: (channel: string, ...args: any[]) => Promise<any>
    getPathForFile: (file: File) => string
  }
}
