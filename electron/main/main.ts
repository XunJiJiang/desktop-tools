import { app, BrowserWindow, ipcMain } from 'electron'
// import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import useIpc from './ipc'

// const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST

const wins: Map<BrowserWindow, Set<BrowserWindow>> = new Map()

function createWindow(label: string) {
  const win = new BrowserWindow({
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      height: 34
    },
    width: 1024,
    height: 768,
    minWidth: 400,
    minHeight: 270,
    backgroundColor: '#00000000',
    transparent: true,
    icon: path.join(process.env.VITE_PUBLIC, 'vite.svg'),
    webPreferences: {
      preload: path.join(MAIN_DIST, 'preload.mjs')
    }
  })

  wins.set(win, new Set())

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString())
  })

  win.on('close', () => {
    win.webContents.send('window:close')
  })

  win.on('closed', () => {
    const childrenWins = wins.get(win)
    childrenWins?.forEach((childWin) => {
      childWin.close()
    })
    wins.delete(win)
  })

  win.on('focus', () => {
    win.webContents.send('window:focus')
  })

  win.on('blur', () => {
    win.webContents.send('window:blur')
  })

  if (VITE_DEV_SERVER_URL) {
    const url = new URL('apps/' + label + '/index.html', VITE_DEV_SERVER_URL)
    win.loadURL(url.toString())
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, label, 'index.html'))
  }

  return win
}

// 当所有窗口都关闭时退出（macOS 除外）
// 在 macOS 上，应用程序及其菜单栏通常会保持活动状态
// 直到用户使用 Cmd + Q 明确退出
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    wins.clear()
  }
})

app.on('activate', () => {
  // 在 OS X 上，当单击停靠图标且没有打开其他窗口时，通常会在应用中重新创建一个窗口。
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow('full-viewport')
  }
})

app
  .whenReady()
  .then(() => createWindow('full-viewport'))
  .then(useIpc)
  .then(() => {
    ipcMain.handle('window:new', async (_event, label: string) => {
      const win = createWindow(label)

      return {
        status: 'ok',
        data: {
          label: label,
          id: win.id
        }
      }
    })
  })
