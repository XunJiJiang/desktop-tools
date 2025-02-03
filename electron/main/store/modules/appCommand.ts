// 基础指令包括
// 1. 查找工作区文件指令, 文件路径, 不需要注册
//   查找相对于当前目录工作区的文件路径, 例如: ./src/index.ts
// 2. 全局搜索框的 > 开头的指令, 需要注册, 例如: > open
//   > 后的第一个单词为指令名称, 之后的单词为token
//   允许扩展注册指令
// 3. 搜索工作区文本的指令, 不需要注册
//   % 后的第一个单词为搜索内容
// 4. 内部指令, 由内部注册, 不使用指令解析器, 直接触发
//    触发内部功能, 例如: 菜单项

import { BrowserWindow, ipcMain } from 'electron'
import { singleRun } from '@ele/utils/singleRun'

export const COMMAND_TYPE: Record<string, string> = {
  FILE: 'file',
  GLOBAL: 'global',
  WORKSPACE_TEXT: 'workspace text',
  INTERNAL: 'internal'
}

export interface CommandNode {
  /** 类型(枚举) */
  type: string
  /** 标识 */
  mark: string
  /** 指令key */
  command: string
  /** token数组 */
  tokens: string[]
}

type CommandCallback = (win: BrowserWindow, node: CommandNode) => void

type CommandCallbacks = Record<string | typeof BASE_CALLBACK, CommandCallback>

const BASE_CALLBACK = Symbol('base callback')

/**
 * 指令类型和对应的标识, 例如: GLOBAL(>)
 * type 为 INTERNAL 时, 不使用指令解析器, 因此不需要标识
 */
const COMMAND_MARK = new Map<string, [string, CommandCallbacks]>([
  [
    '>',
    [
      COMMAND_TYPE.GLOBAL,
      {
        test: (win, node) => {
          console.log('GLOBAL text', node)
        },
        [BASE_CALLBACK]: (win, node) => {
          console.error('GLOBAL BASE_CALLBACK', node)
        }
      }
    ]
  ],
  [
    '%',
    [
      COMMAND_TYPE.WORKSPACE_TEXT,
      {
        test: (win, node) => {
          console.log('WORKSPACE_TEXT test', node)
        },
        [BASE_CALLBACK]: (win, node) => {
          console.error('WORKSPACE_TEXT BASE_CALLBACK', node)
        }
      }
    ]
  ]
])

/** 从类型到标识 */
const TYPE_MARK = new Map<string, string>(
  Array.from(COMMAND_MARK).map(([mark, [type]]) => [type, mark])
)

/** 标识列表 */
const MARK_LIST = new Set<string>(COMMAND_MARK.keys())

/** 标识列表排序(从长到短) */
const sortMarkList = () => {
  const list = Array.from(MARK_LIST).sort((a, b) => b.length - a.length)
  MARK_LIST.clear()
  list.forEach((item) => MARK_LIST.add(item))
}

/**
 * 创建指令注册
 * @param key 指令类型键 COMMAND_MARK[key]
 * @param type 指令类型 COMMAND_TYPE[key] -> type
 * @param mark 指令标识 [mark] command
 * @param callback 基础指令回调 当没有对应的 command 时触发
 * @param cover 是否允许覆盖已有的指令
 */
const createCommandRegister = (
  key: string,
  type: string,
  mark: string,
  callback: CommandCallback = () => {},
  {
    cover = false
  }: {
    cover?: boolean
  } = {}
) => {
  if (COMMAND_TYPE[key] && COMMAND_TYPE[key] !== type) {
    console.error(`指令类型 ${key} 重复注册`)
    return
  }
  if (COMMAND_MARK.has(mark)) {
    console.error(`指令标识 ${mark} 重复注册`)
    return
  }
  COMMAND_TYPE[key] = type
  const callbacks: CommandCallbacks = {
    [BASE_CALLBACK]: callback
  }
  COMMAND_MARK.set(mark, [type, callbacks])
  TYPE_MARK.set(type, mark)
  MARK_LIST.add(mark)
  sortMarkList()

  return {
    /**
     * 添加指令
     * @param command 指令
     * @param callback 指令回调
     */
    addCommand: (command: string, callback: CommandCallback) => {
      if (!cover && COMMAND_MARK.has(command)) {
        console.warn(`指令标识 ${command} 重复注册`)
        return
      }
      callbacks[command] = callback
    }
  }
}

/** 解析顶部搜索可用的指令, 返回指令节点 */
const parseCommand = (fullCommand: string): [CommandNode, CommandCallback] => {
  const [command, command2, ...tokens] = fullCommand
    .split(' ')
    .filter((item) => item !== '')
  // 用户输入的 标识和第一个token 有空格时
  if (COMMAND_MARK.has(command)) {
    const [type, callback] = COMMAND_MARK.get(command) ?? []
    if (type && callback)
      return [
        {
          type,
          mark: command,
          command: command2,
          tokens: [...tokens]
        },
        callback[command2] ?? callback[BASE_CALLBACK]
      ]
  }

  // 用户输入的 标识和第一个token 没有空格时
  const mark = Array.from(MARK_LIST).find((item) => command.startsWith(item))
  if (mark) {
    const [type, callback] = COMMAND_MARK.get(mark) ?? []
    if (type && callback) {
      const _command = command.slice(mark.length)
      return [
        {
          type,
          mark,
          command: _command,
          tokens
        },
        callback[_command] ?? callback[BASE_CALLBACK]
      ]
    }
  }

  // 认为是文件指令
  return [
    {
      type: COMMAND_TYPE.FILE,
      mark: '',
      command: command,
      tokens: typeof command2 === 'undefined' ? tokens : [command2, ...tokens]
    },
    // TODO: 此处应该是一个查找文件的函数
    (win, node) => {
      console.log('查找文件', node)
    }
  ]
}

/** 运行指令 */
const run = (
  commandNode: CommandNode,
  callback: CommandCallback,
  win: BrowserWindow
) => {
  callback(win, commandNode)
}

/** 解析运行指令 */
const parseAndRun = (command: string, win: BrowserWindow) => {
  const [commandNode, callback] = parseCommand(command)
  run(commandNode, callback, win)
}

const useCommand = singleRun(() => {
  ipcMain.handle('command:parseAndRun', (event, command: string) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (!win) return
    parseAndRun(command, win)
  })

  return {
    /** 创建指令注册 */
    createCommandRegister,
    /** 解析顶部搜索可用的指令, 返回指令节点 */
    resolveCommand: parseCommand,
    /** 运行指令 */
    run,
    /** 解析运行指令 */
    parseAndRun
  }
})

export default useCommand
