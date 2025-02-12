import { createWinMenu } from '@ele/menu/template'
import useWindowStore from '@ele/store/modules/windows'
import { ipcMain } from 'electron'
import { singleRun } from '@/utils/singleRun'
import useConfig from './config'
import useI18n from '@ele/ipc/handle/i18n'

type Lang = import('@/types/language').Lang

const { wins } = useWindowStore()

const useMenu = singleRun(() => {
  let menu: Electron.MenuItemConstructorOptions[] | null = null

  ipcMain.handle('menu:get', () => {
    return menu ?? []
  })

  return {
    /** 持久化菜单(用于windows等系统上的前端菜单显示), 向前端发送菜单变动事件 */
    updateMenu: async (_lang?: Lang) => {
      const lang = _lang ?? (await useI18n().getLanguage(false))
      // INFO: 此处禁止使用 updateWebviewConfig 方法
      // updateWebviewConfig 内触发了 updateMenu
      const { getConfig } = useConfig()
      menu = createWinMenu(lang, await getConfig())
      wins.forEach((_, fullWin) => {
        fullWin.webContents.send('menu:update', menu)
      })
    }
  }
})

export default useMenu
