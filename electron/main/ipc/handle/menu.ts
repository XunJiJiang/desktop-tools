import { createWinMenu } from '@ele/menu/template'
import useWindowStore from '@ele/store/modules/windows'
import { ipcMain } from 'electron'
import { singleRun } from '@ele/utils/singleRun'

type Lang = import('@/types/language').Lang

const { wins } = useWindowStore()

const useMenu = singleRun(() => {
  let menu: Electron.MenuItemConstructorOptions[] | null = null

  ipcMain.handle('menu:get', () => {
    return menu ?? []
  })

  return {
    /** 持久化菜单(用于windows等系统上的前端菜单显示), 向前端发送菜单变动事件 */
    updateMenu: (lang: Lang) => {
      menu = createWinMenu(lang)
      wins.forEach((_, fullWin) => {
        fullWin.webContents.send('menu:update', menu)
      })
    }
  }
})

export default useMenu
