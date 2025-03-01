import { singleRun } from '@/utils/singleRun'
import { ipcMain, screen, BrowserWindow } from 'electron'

const useCursor = singleRun(async () => {
  ipcMain.handle('cursor:getPosition', (event) => {
    const { x, y } = screen.getCursorScreenPoint()
    const {
      width,
      height,
      x: winX,
      y: winY
    } = BrowserWindow.fromWebContents(event.sender)?.getBounds() ?? {
      width: 0,
      height: 0,
      x: 0,
      y: 0
    }
    return {
      x: x - winX,
      y: y - winY,
      inWindow:
        x >= winX && x <= winX + width && y >= winY && y <= winY + height
    }
  })
})

export default useCursor
