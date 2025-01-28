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

/** Map<[完整窗口], Set<[仅主窗口]>> */
const wins: Map<BrowserWindow, Set<BrowserWindow>> = new Map()

/** Map<[完整窗口], [workspace config path]> */
const fullWinWorkspaces: Map<BrowserWindow, string> = new Map()
/**
 * Map<[workspace config path], [完整窗口]>
 * 当某个 win 没有打开工作区而是 [workspace:temp] 时,
 * 不会记录到 workspaceFullWins 中
 */
const workspaceFullWins: Map<string, BrowserWindow> = new Map()

ipcMain.handle('workspace:hasOpened', (_, path: string) => {
  return workspaceFullWins.has(path)
})

ipcMain.handle('workspace:focus', (_, path: string) => {
  const win = workspaceFullWins.get(path)
  if (win) {
    win.focus()
    return true
  }
  return false
})

app.setName('Desktop Tools')

function createWindow(
  label: string,
  {
    isMainViewportOnly = false,
    parentBrowserWindow: parentWebContents
  }: {
    isMainViewportOnly?: boolean
    parentBrowserWindow?: BrowserWindow | null
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
    }
  })

  win.webContents.openDevTools({
    mode: 'detach',
    activate: false
  })

  if (!isMainViewportOnly) {
    // 对完整视口窗口
    wins.set(win, new Set())
    fullWinWorkspaces.set(win, '[workspace:temp]')
  } else {
    // 对仅主视口窗口
    if (parentWebContents) {
      const childrenWins = wins.get(parentWebContents)
      childrenWins?.add(win)

      const close = () => {
        win.close()
      }

      // 当子窗口关闭时, 移除子窗口
      // 避免父窗口关闭时重复关闭子窗口
      win.on('close', () => {
        childrenWins?.delete(win)
        parentWebContents.off('close', close)
      })

      // 当父窗口关闭时, 关闭子窗口
      parentWebContents.on('close', close)
    }
  }

  // 对完整视口窗口
  // 当关闭时, 如果为最后一个完整视口窗口, 则更新配置文件中的 workspace.path
  if (!isMainViewportOnly) {
    win.on('close', () => {
      const isLastFullViewport = wins.size === 1
      win.webContents.send('window:close', {
        isLastFullViewport
      })
      const workspaceConfigPath = fullWinWorkspaces.get(win) || ''
      if (isLastFullViewport) {
        const run = updateConfigFile((c) => {
          if (c && c.workspace) {
            c.workspace.path = workspaceConfigPath
          }
          return c
        })
        win.on('closed', () => {
          run()
        })
      }

      wins.delete(win)
      fullWinWorkspaces.delete(win)
      if (workspaceConfigPath && workspaceConfigPath !== '[workspace:temp]') {
        workspaceFullWins.delete(workspaceConfigPath)
      }
    })
  }

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
        parentBrowserWindow: isMainViewportOnly
          ? BrowserWindow.fromWebContents(event.sender)
          : void 0
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
      const win = BrowserWindow.fromWebContents(e.sender)
      if (!win) {
        console.error('Error: workspace:change, win 是 undefined')
        return
      }
      const oldPath = fullWinWorkspaces.get(win) || ''
      fullWinWorkspaces.set(win, path)
      if (oldPath) {
        workspaceFullWins.delete(oldPath)
      }
      if (path !== '[workspace:temp]') {
        workspaceFullWins.set(path, win)
      }
    })
  })
