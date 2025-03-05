/* eslint-disable @typescript-eslint/no-explicit-any */
/// <reference types="vite/client" />

type CommentType = import('@/types/command').Comment
type MenuItem = import('@/types/menu').MenuItem
type PathName = import('@/types/path').PathName
type QueryParam = import('@/types/sqlite').QueryParam
type InsertParam = import('@/types/sqlite').InsertParam
type UpdateParam = import('@/types/sqlite').UpdateParam
type DeleteParam = import('@/types/sqlite').DeleteParam

declare interface Window {
  ipcRenderer
}

declare const ipcRenderer: {
  on: (...args: any[]) => Ipc.UnListen
  off: (...args: any[]) => void
  send: (...args: any[]) => void
  invoke: (...args: any[]) => Promise<any>
  getPathForFile: (...args: any[]) => any
}

declare namespace Ipc {
  export type on = Listener<Ipc.UnListen>
  export type off = Listener<void>
  export type send = Send
  export type invoke = Invoke
  export type getPathForFile = (file: File) => string
  export type UnListen = () => void
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
  ): Ipc.UnListen

  (
    channel: 'menu:update',
    listener: (event: IpcRendererEvent, menu: any) => void
  ): Ipc.UnListen

  (
    channel: 'msg:create:top',
    listener: (
      event: IpcRendererEvent,
      data: {
        message: string
        type: 'success' | 'danger' | 'warning' | 'info'
      }
    ) => void
  ): UnListen

  /**
   * 收到此消息时, 将打开或更新搜索框, 将value作为初始值, items 作为下方加载的选项
   * 若已经打开, 则仅更新 items
   * 此接口可能会变动
   */
  (
    channel: 'search:load',
    listener: (
      event: IpcRendererEvent,
      data: {
        value: string
      }
    ) => void
  ): UnListen
  (
    channel: 'search:updateItems',
    listener: (
      event: IpcRendererEvent,
      data: {
        items: (CommentType & {
          data: any
        })[]
      }
    ) => void
  ): UnListen

  (
    channel: 'language:change',
    listener: (event: IpcRendererEvent, lang: string) => void
  ): UnListen
}

interface Send {
  (channel: 'config:global:update', config: object): void

  (channel: 'workspace:change', path: string): void

  (channel: 'command:parseAndRun', fullCommand: string): void

  (
    channel: 'menu:context',
    data: {
      items: MenuItem[]
    }
  ): void

  (
    channel: 'app-region:drag',
    position: {
      x: number
      y: number
    }
  ): void
  (channel: 'app-region:drop'): void
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

  (
    channel: 'command:fuzzyParse',
    fullCommand: string
  ): Promise<[string, import('@/types/command.d.ts').Comment[]][]>

  (channel: 'cursor:getPosition'): Promise<{
    x: number
    y: number
    inWindow: boolean
  }>
}
