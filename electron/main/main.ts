import { app, BrowserWindow, ipcMain } from 'electron'
// import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'node:fs'
import useIpc from './ipc'
import { updateConfigFile } from './ipc/handle/config'

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

const wins: Map<Electron.WebContents, Set<Electron.WebContents>> = new Map()

const fullWebContentsWorkspaces: Map<Electron.WebContents, string> = new Map()

app.setName('Desktop Tools')

function createWindow(
  label: string,
  {
    isMainViewportOnly = false,
    parentWebContents
  }: {
    isMainViewportOnly?: boolean
    parentWebContents?: Electron.WebContents
  } = {}
) {
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
    },
    parent:
      isMainViewportOnly &&
      parentWebContents &&
      BrowserWindow.fromWebContents(parentWebContents)
        ? BrowserWindow.fromWebContents(parentWebContents)!
        : void 0
  })

  win.webContents.openDevTools({
    mode: 'detach',
    activate: false
  })

  if (!isMainViewportOnly) {
    wins.set(win.webContents, new Set())
    fullWebContentsWorkspaces.set(win.webContents, '[workspace:temp]')
  } else {
    if (parentWebContents) {
      const childrenWins = wins.get(parentWebContents)
      childrenWins?.add(win.webContents)

      win.on('close', () => {
        console.log('main 关闭')
        childrenWins?.delete(win.webContents)
      })
    }
  }

  win.on('close', () => {
    const isLastFullViewport = !isMainViewportOnly && wins.size === 1
    win.webContents.send('window:close', {
      isLastFullViewport
    })
    if (isLastFullViewport) {
      const run = updateConfigFile((c) => {
        if (c && c.workspace) {
          c.workspace.path =
            fullWebContentsWorkspaces.get(win.webContents) || ''
        }
        return c
      })
      win.on('closed', () => {
        run()
      })
    }
    if (!isMainViewportOnly) {
      wins.delete(win.webContents)
      fullWebContentsWorkspaces.delete(win.webContents)
    }
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
    win.loadFile(path.join(RENDERER_DIST, 'apps', label, 'index.html'))
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
  } else {
    // 清理 workspace/__temp__ 目录
    const tempDir = path.join(
      app.getPath('userData'),
      'config',
      'workspace',
      '__temp__'
    )
    fs.rmdir(tempDir, { recursive: true }, () => {})
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
  .then(useIpc)
  .then(() => createWindow('full-viewport'))
  .then(() => {
    ipcMain.handle('window:new', async (event, label: string) => {
      const eventLabel = event.sender.getURL()
      const isMainViewportOnly =
        eventLabel.includes('full-viewport') && label === 'main-viewport-only'
      const win = createWindow(label, {
        isMainViewportOnly,
        parentWebContents: isMainViewportOnly ? event.sender : undefined
      })

      return {
        status: 'ok',
        data: {
          label: label,
          id: win.id
        }
      }
    })

    ipcMain.on('workspace:change', (e, path: string) => {
      fullWebContentsWorkspaces.set(e.sender, path)
    })
  })
