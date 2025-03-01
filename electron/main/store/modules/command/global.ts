import { BrowserWindow } from 'electron'
import type { CommandCallback, FuzzyCommandCallback } from './types'

export const language: CommandCallback = async (win, node) => {
  win.reply('language:change', node.tokens[0])
}

const other: CommandCallback = async (win, node) => {
  if (node.command === 'search') {
    if (node.tokens[0] === 'open') {
      win.reply('search:load', {
        value: ''
      })
    }
  } else if (node.command === 'toggleDevTools') {
    if (node.tokens[0] === 'switch') {
      const focusWin = BrowserWindow.getFocusedWindow()
      focusWin?.webContents.toggleDevTools()
    }
  }
}

export const command: CommandCallback = (win, node) => {
  switch (node.command) {
    case 'language':
      language(win, node)
      break
    default:
      other(win, node)
      break
  }
}

export const fuzzyCommand: FuzzyCommandCallback = (_, node) => {
  const command =
    node.mark +
    (node.command
      ? ' ' +
        node.command +
        (node.tokens?.length > 0 ? ' ' + node.tokens.join(' ') : '')
      : '')
  console.log('fuzzyCommand', command, node.tokens)
  return [
    {
      command: '> language zh-CN',
      comment: '切换语言为中文'
    },
    {
      command: '> language en-US',
      comment: 'switch language to English'
    }
  ].filter((item) => item.command.includes(command))
}

export default {
  command,
  fuzzyCommand,
  language
}
