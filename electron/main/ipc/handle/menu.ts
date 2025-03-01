import { createWinMenu } from '@ele/menu/template'
import useWindowStore from '@ele/store/modules/windows'
import { BrowserWindow, ipcMain, Menu } from 'electron'
import { singleRun } from '@/utils/singleRun'
import useI18n from '@ele/ipc/handle/i18n'
import useCommand from '@ele/store/modules/command'
import useConfig from './config'

type Lang = import('@/types/language').Lang

const { wins } = useWindowStore()

export type MenuItem = {
  label: string
  type?:
    | 'normal'
    | 'separator'
    | 'submenu'
    | 'checkbox'
    | 'radio'
    | 'remaining'
    | 'all remaining'
  submenu?: MenuItem[]
  command?: string
}

const createMenuPopup = (items: MenuItem[]) => {
  function deepMenu(
    _menus: MenuItem[]
  ): Parameters<typeof Menu.buildFromTemplate>[0] {
    return _menus.map((item) => {
      const _command = item.command
      return {
        ...item,
        click: (_, win) => {
          if (
            _command &&
            win &&
            win instanceof BrowserWindow &&
            win.webContents.getURL().includes('full-viewport')
          ) {
            const command = useCommand()
            command.parseAndRun(_command, {
              reply: win.webContents.send.bind(win.webContents),
              sender: win.webContents
            })
          }
        }
      } as Electron.MenuItemConstructorOptions
    })
  }

  Menu.buildFromTemplate(deepMenu(items)).popup()
}

const useMenu = singleRun(() => {
  let menu: Electron.MenuItemConstructorOptions[] | null = null

  ipcMain.handle('menu:get', () => {
    return menu ?? []
  })

  // TODO
  ipcMain.on(
    'menu:context',
    (
      _,
      data: {
        items: MenuItem[]
      }
    ) => {
      createMenuPopup(data.items)
    }
  )

  return {
    /** 持久化菜单(用于windows等系统上的前端菜单显示), 向前端发送菜单变动事件 */
    updateAppMenu: async (_lang?: Lang) => {
      const lang = _lang ?? (await useI18n().getLanguage(false))
      // INFO: 此处禁止使用 useConfig().updateWebviewConfig 方法
      // updateWebviewConfig 内触发了 updateMenu
      const { getConfig } = useConfig()
      menu = createWinMenu(lang, await getConfig())
      wins.forEach((_, fullWin) => {
        fullWin?.webContents.send('menu:update', menu)
      })
    }
  }
})

export default useMenu
