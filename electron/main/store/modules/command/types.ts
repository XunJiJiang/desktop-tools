import { type WebContents } from 'electron'

/** [mark] [command] [token1] [token2] ... */
export interface CommandNode {
  /** 类型(枚举) */
  type: string
  /** 标识 */
  mark: string
  /** 指令 */
  command: string | undefined
  /** token数组 */
  tokens: string[]
}

export type Comment = import('@/types/command.d.ts').Comment

export type CommandCallbackEvent = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reply: (channel: string, ...args: any[]) => void
  getTitle: WebContents['getTitle']
  focus: WebContents['focus']
  isFocused: WebContents['isFocused']
  send: WebContents['send']
}

export type CommandEvent = {
  reply: CommandCallbackEvent['reply']
  sender: WebContents
}

export type CommandCallback = (
  event: CommandCallbackEvent,
  node: CommandNode
) => void
export type FuzzyCommandCallback = (
  event: CommandCallbackEvent,
  node: CommandNode
) => Comment[] | Promise<Comment[]>

export const BASE_CALLBACK: symbol = Symbol('base callback')

/**
 * [command]: [callback, comment]
 */
export type CommandCallbacks = Record<
  string,
  [CommandCallback, FuzzyCommandCallback]
> & {
  [BASE_CALLBACK]: [CommandCallback, FuzzyCommandCallback]
}
