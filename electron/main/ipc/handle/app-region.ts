import { singleRun } from '@/utils/singleRun'
import { BrowserWindow, ipcMain, screen } from 'electron'

const useAppRegion = singleRun(() => {
  let draggingWin: BrowserWindow | null = null
  let dragRunning: boolean = false
  /** 鼠标点击位置和窗口左上角的相对距离 */
  const dragOffset: { x: number; y: number } = { x: 0, y: 0 }
  /** 上一次的鼠标位置 */
  const mousePosition: { x: number; y: number } = { x: 0, y: 0 }

  let timer: NodeJS.Timeout | null = null

  const run = () => {
    console.log('run')
    if (dragRunning && draggingWin) {
      const cursorPosition = screen.getCursorScreenPoint()
      const x = cursorPosition.x - dragOffset.x
      const y = cursorPosition.y - dragOffset.y
      draggingWin.setPosition(x, y, false)
      mousePosition.x = cursorPosition.x
      mousePosition.y = cursorPosition.y
    }
  }

  ipcMain.on(
    'app-region:drag',
    (
      e,
      {
        x,
        y
      }: {
        x: number
        y: number
      }
    ) => {
      const win = BrowserWindow.fromWebContents(e.sender)
      if (win) {
        console.log('app-region:drag', x, y)
        if (!draggingWin) {
          draggingWin = win
          dragRunning = true
          dragOffset.x = x
          dragOffset.y = y
          mousePosition.x = screen.getCursorScreenPoint().x
          mousePosition.y = screen.getCursorScreenPoint().y
          timer = setInterval(run, 16)
        }
      }
    }
  )

  ipcMain.on('app-region:drop', (e) => {
    const win = BrowserWindow.fromWebContents(e.sender)
    if (win) {
      draggingWin = null
      dragRunning = false
      dragOffset.x = 0
      dragOffset.y = 0
    }
    if (timer) {
      clearInterval(timer)
      timer = null
    }
  })
})

export default useAppRegion
