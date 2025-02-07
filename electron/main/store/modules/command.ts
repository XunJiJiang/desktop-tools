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

import { ipcMain, type IpcMainInvokeEvent, type WebContents } from 'electron'
import { singleRun } from '@ele/utils/singleRun'
import { getValue } from '@ele/utils/getValue'
import useI18n from '@ele/ipc/handle/i18n'
import useConfig from '@ele/ipc/handle/config'
import useMenu from '@ele/ipc/handle/menu'

export const COMMAND_TYPE: Record<string, string> = {
  FILE: 'file',
  // GLOBAL: 'global',
  // WORKSPACE_TEXT: 'workspace text',
  INTERNAL: 'internal'
}

/** [mark] [command] [token1] [token2] ... */
export interface CommandNode {
  /** 类型(枚举) */
  type: string
  /** 标识 */
  mark: string
  /** 指令 */
  command: string
  /** token数组 */
  tokens: string[]
}

type Comment = import('@/types/command.d.ts').Comment

type CommandCallbackEvent = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reply: (channel: string, ...args: any[]) => void
  getTitle: WebContents['getTitle']
  focus: WebContents['focus']
  isFocused: WebContents['isFocused']
  send: WebContents['send']
}

type CommandEvent = {
  reply: CommandCallbackEvent['reply']
  sender: WebContents
}

type CommandCallback = (event: CommandCallbackEvent, node: CommandNode) => void
type FuzzyCommandCallback = (
  event: CommandCallbackEvent,
  node: CommandNode
) => Comment[] | Promise<Comment[]>

/**
 * [command]: [callback, comment]
 */
type CommandCallbacks = Record<string, [CommandCallback, string]> & {
  [BASE_CALLBACK]: [CommandCallback, string]
  [FUZZY_CALLBACK]: [FuzzyCommandCallback, string]
}

const BASE_CALLBACK: symbol = Symbol('base callback')
const FUZZY_CALLBACK: symbol = Symbol('fuzzy callback')

/**
 * 指令类型和对应的标识, 例如: GLOBAL(>)
 * type 为 INTERNAL 时, 不使用指令解析器, 因此不需要标识
 */
const COMMAND_MARK = new Map<string, [string, CommandCallbacks]>()

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
 * @param fuzzyCallback 模糊指令回调 当没有对应的 command 时触发
 * @param opt.cover 是否覆盖已存在的指令
 */
const createCommandRegister = (
  key: string,
  type: string,
  mark: string,
  callback: CommandCallback = () => {},
  fuzzyCallback: FuzzyCommandCallback = () => [],
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
    [BASE_CALLBACK]: [callback, ''],
    [FUZZY_CALLBACK]: [fuzzyCallback, '']
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
     * @param comment 指令注释 或 注释的 i18n key
     */
    add(command: string, callback: CommandCallback, comment: string) {
      if (!cover && callbacks[command]) {
        console.warn(`指令标识 ${command} 重复注册`)
        return () => {
          console.warn(`对应标识 ${command} 的指令注册失败, 无法删除`)
        }
      }
      let hasDelete = false
      callbacks[command] = [callback, comment]
      /**
       * 删除指令
       * 对于不允许覆盖的指令, 仅删除一次
       * 对于允许覆盖的指令, 每次删除, 即使已经被其他次调用的add覆盖
       */
      return () => {
        if (cover) {
          if (callbacks[command]) {
            delete callbacks[command]
          }
        } else {
          if (!hasDelete && callbacks[command]) {
            hasDelete = true
            delete callbacks[command]
          }
        }
      }
    }
  }
}

/** 初始化 > 和 % 标识指令 */
const initCommandRegister = () => {
  const { updateMenu } = useMenu()
  const global = createCommandRegister(
    'GLOBAL',
    'global',
    '>',
    (_, node) => {
      console.warn('GLOBAL command', node)
    },
    () => [],
    {
      cover: false
    }
  )
  global?.add(
    'test',
    (win, node) => {
      console.log('GLOBAL test', node)
    },
    'test'
  )
  global?.add(
    't',
    (win, node) => {
      console.log('GLOBAL text', node)
    },
    't'
  )
  global?.add(
    'autoSave',
    () => {
      const { updateWebviewConfig } = useConfig()
      updateWebviewConfig((config) => {
        const oldSaveConfig = config.menu?.file?.autoSave ?? false
        const newSaveConfig = !oldSaveConfig
        config.menu = config.menu ?? {}
        config.menu.file = config.menu.file ?? {}
        config.menu.file.autoSave = newSaveConfig
        return config
      })
      updateMenu()
    },
    'title.menu.file.items.autoSave'
  )
  global?.add(
    'autoLineBreak',
    () => {
      const { updateWebviewConfig } = useConfig()
      updateWebviewConfig((config) => {
        const oldLineBreakConfig = config.menu?.view?.autoLineBreak ?? false
        const newLineBreakConfig = !oldLineBreakConfig
        config.menu = config.menu ?? {}
        config.menu.view = config.menu.view ?? {}
        config.menu.view.autoLineBreak = newLineBreakConfig
        return config
      })
      updateMenu()
    },
    'title.menu.view.items.autoLineBreak'
  )

  createCommandRegister(
    'WORKSPACE_TEXT',
    'workspace text',
    '%',
    (_, node) => {
      console.warn('WORKSPACE_TEXT command', node)
    },
    async () => [],
    {
      cover: false
    }
  )
  return {
    global
  }
}

/** 详细解析顶部搜索可用的指令, 返回指令节点 */
const parseCommand = (fullCommand: string): [CommandNode, CommandCallback] => {
  const [command, command2, ...tokens] = fullCommand
    .split(' ')
    .filter((item) => item !== '')
  // 用户输入的 标识和第一个token 有空格时
  if (COMMAND_MARK.has(command)) {
    const [type, callback] = COMMAND_MARK.get(command) ?? []
    console.log('command', type, callback)
    if (type && callback) {
      return [
        {
          type,
          mark: command,
          command: command2,
          tokens: [...tokens]
        },
        callback[command2][0] ?? callback[BASE_CALLBACK][0]
      ]
    }
  }

  // 用户输入的 标识和第一个token 没有空格时
  const mark = Array.from(MARK_LIST).find((item) => command?.startsWith(item))
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
        callback[_command][0] ?? callback[BASE_CALLBACK][0]
      ]
    }
  }

  // 认为是文件指令
  return [
    {
      type: COMMAND_TYPE.FILE,
      mark: '',
      command: command ?? '',
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
  event: CommandEvent
) => {
  const commandEvent: CommandCallbackEvent = {
    reply: event.reply,
    getTitle: event.sender.getTitle,
    focus: event.sender.focus,
    isFocused: event.sender.isFocused,
    send: event.sender.send
  }
  callback(commandEvent, commandNode)
}

/** 解析运行指令 */
const parseAndRun = (command: string, event: CommandEvent) => {
  const [commandNode, callback] = parseCommand(command)
  run(commandNode, callback, event)
}

/** 模糊解析指令(获取对应mark的语法上的commands, 而不检测是否存在, mark需要存在) */
const fuzzyParseCommand = async (
  fullCommand: string,
  event: IpcMainInvokeEvent
): Promise<[string, Comment[]]> => {
  const [command, command2] = fullCommand
    .split(' ')
    .filter((item) => item !== '')
  if (COMMAND_MARK.has(command)) {
    const [, callbacks] = COMMAND_MARK.get(command)!

    const getFuzzyComments = callbacks[
      FUZZY_CALLBACK
    ][0] as FuzzyCommandCallback
    const comments = await getFuzzyComments(
      {
        reply: event.sender.send,
        getTitle: event.sender.getTitle,
        focus: event.sender.focus,
        isFocused: event.sender.isFocused,
        send: event.sender.send
      },
      {
        type: COMMAND_TYPE.GLOBAL,
        mark: command,
        command: command2,
        tokens: []
      }
    )
    if (comments.length > 0) return [command, comments]

    const possibleCommands = Object.keys(callbacks).filter(
      (key: string | symbol) =>
        typeof key === 'string' && key.includes(command2)
    )
    // 仅当指令为空时, 返回所有指令
    // 如果指令不为空, 且没有找到指令, 则返回空数组
    if (possibleCommands.length === 0 && !command2) {
      possibleCommands.push(
        ...Object.keys(callbacks).filter(
          (key: string | symbol) => typeof key === 'string'
        )
      )
    }
    return [
      command,
      possibleCommands.map((key) => {
        const lang = useI18n().getLanguage()
        const comment = callbacks[key as keyof typeof callbacks][1]
        if (lang) {
          return {
            command: key,
            comment: getValue(lang, comment, comment)
          }
        } else {
          return {
            command: key,
            comment
          }
        }
      })
    ]
  }
  const mark = Array.from(MARK_LIST).find((item) => command?.startsWith(item))
  if (mark && COMMAND_MARK.has(mark)) {
    const [, callbacks] = COMMAND_MARK.get(mark)!

    const getFuzzyComments = callbacks[
      FUZZY_CALLBACK
    ][0] as FuzzyCommandCallback
    const comments = await getFuzzyComments(
      {
        reply: () => {},
        getTitle: event.sender.getTitle,
        focus: event.sender.focus,
        isFocused: event.sender.isFocused,
        send: event.sender.send
      },
      {
        type: COMMAND_TYPE.GLOBAL,
        mark: command,
        command: command2,
        tokens: []
      }
    )
    if (comments.length > 0) return [command, comments]

    const possibleCommands = Object.keys(callbacks).filter(
      (key: string | symbol) =>
        typeof key === 'string' && key.includes(command.slice(mark.length))
    )
    return [
      mark,
      possibleCommands.map((key) => {
        const lang = useI18n().getLanguage()
        const comment = callbacks[key as keyof typeof callbacks][1]
        if (lang) {
          return {
            command: key,
            comment: getValue(lang, comment, comment)
          }
        } else {
          return {
            command: key,
            comment
          }
        }
      })
    ]
  }

  // TODO: 针对%指令, 需要查找工作区文本并返回
  // TODO: 认为是文件指令, 此处查找工作区文件, 返回相对路径
  return [
    'file',
    [
      {
        command: 'file',
        comment: 'file'
      },
      {
        command: 'file2',
        comment: 'file2'
      }
    ]
  ]
}

const useCommand = singleRun(() => {
  initCommandRegister()

  ipcMain.on('command:parseAndRun', (event, command: string) => {
    parseAndRun(command, event)
  })

  ipcMain.handle('command:fuzzyParse', (event, command: string) => {
    return fuzzyParseCommand(command, event)
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
