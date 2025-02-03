/* eslint-disable @typescript-eslint/no-explicit-any */
/// <reference types="vite/client" />

type PathName = import('@/types/path').PathName
type QueryParam = import('@/types/sqlite').QueryParam
type InsertParam = import('@/types/sqlite').InsertParam
type UpdateParam = import('@/types/sqlite').UpdateParam
type DeleteParam = import('@/types/sqlite').DeleteParam

type UnListen = () => void

declare interface Window {
  ipcRenderer
}

declare const ipcRenderer: {
  on: (...args: any[]) => UnListen
  off: (...args: any[]) => void
  send: (...args: any[]) => void
  invoke: (...args: any[]) => Promise<any>
  getPathForFile: (...args: any[]) => any
}

declare namespace Ipc {
  export type on = Listener<UnListen>
  export type off = Listener<void>
  export type send = Send
  export type invoke = Invoke
  export type getPathForFile = (file: File) => string
}

type EasyMenu = {
  label?: string
  accelerator?: string
  submenu?: EasyMenu[]
}[]

interface Listener<UnListen = void> {
  (
    channel: 'window:close',
    listener: (event: IpcRendererEvent, config: any) => void
  ): UnListen
  (channel: 'window:focus', listener: () => void): UnListen
  (channel: 'window:blur', listener: () => void): UnListen

  (
    channel: 'config:global:update',
    listener: (
      event: IpcRendererEvent,
      config: import('@/types/settings').Settings
    ) => void
  ): UnListen

  (
    channel: 'menu:update',
    listener: (event: IpcRendererEvent, menu: any) => void
  ): UnListen
}

interface Send {
  (channel: 'config:global:update', config: object): void

  (channel: 'workspace:change', path: string): void
}

type PathLike = string | Buffer<ArrayBufferLike> | URL

type Lang = import('@/types/language').Lang

interface Invoke {
  (channel: 'sq:open'): Promise<void>
  (channel: 'sq:close'): Promise<void>
  (channel: 'sq:query', param: QueryParam): Promise<any[]>
  (
    channel: 'sq:insert',
    param: InsertParam
  ): Promise<StatementResultingChanges | void>
  (
    channel: 'sq:update',
    param: UpdateParam
  ): Promise<StatementResultingChanges | void>
  (
    channel: 'sq:delete',
    param: DeleteParam
  ): Promise<StatementResultingChanges | void>
  (channel: 'sq:state'): Promise<'open' | 'close'>

  (channel: 'fs:exists', path: PathLike): Promise<boolean>
  (
    channel: 'fs:stat',
    path: PathLike,
    opts?: any
  ): Promise<
    Omit<
      | 'isDirectory'
      | 'isFile'
      | 'isBlockDevice'
      | 'isCharacterDevice'
      | 'isFIFO'
      | 'isSocket'
      | 'isSymbolicLink',
      import('fs').Stats
    > & {
      isDirectory: boolean
      isFile: boolean
      isBlockDevice: boolean
      isCharacterDevice: boolean
      isFIFO: boolean
      isSocket: boolean
      isSymbolicLink: boolean
    }
  >
  <OPT = any>(
    channel: 'fs:readfile',
    path: PathLike,
    opts?: OPT
  ): Promise<
    OPT extends { encoding: 'utf-8' } ? string : Buffer<ArrayBufferLike>
  >
  (
    channel: 'fs:writefile',
    path: PathLike,
    data: any,
    opts?: any
  ): Promise<void>
  (channel: 'fs:mkdir', path: PathLike, opts?: any): Promise<void>
  (channel: 'fs:rmdir', path: PathLike, opts?: any): Promise<void>
  (channel: 'fs:readdir', path: PathLike, opts?: any): Promise<string[]>
  (channel: 'fs:unlink', path: PathLike): Promise<void>
  (channel: 'fs:rename', oldPath: PathLike, newPath: PathLike): Promise<void>
  (channel: 'fs:resources', paths: string[]): Promise<string>

  (channel: 'path:get', name: PathName, paths?: string[]): Promise<string>
  (channel: 'path:join', ...paths: string[]): Promise<string>

  (channel: 'i18n:available'): Promise<string[]>
  (channel: 'i18n:load', lang: string): Promise<object>

  (channel: 'window:new', label: string): Promise<{ status: 'ok'; data: any }>
  (channel: 'window:webContent:id'): Promise<number>

  (channel: 'config:default'): Promise<string>
  (channel: 'config:update:file', config: object): Promise<any>

  (channel: 'i18n:available'): Promise<string[]>
  (channel: 'i18n:load', lang: string): Promise<Lang>

  (channel: 'workspace:hasOpened', path: string): Promise<boolean>
  (channel: 'workspace:focus', path: string): Promise<boolean>

  (channel: 'menu:get'): Promise<EasyMenu>

  <T = void>(channel: 'command:parseAndRun', node: CommandNode): Promise<T>
}
