import { app, BrowserWindow, ipcMain } from 'electron'
// import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'node:fs'
import useIpc from './ipc'
import { updateConfigFile } from './ipc/handle/config'
import useWindowStore from './store/modules/windows'
import useCommand from './store/modules/command'

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

export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST

const { wins, fullWinWorkspaces, workspaceFullWins } = useWindowStore()

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
    ...(process.platform !== 'darwin'
      ? {
          titleBarOverlay: {
            height: 34,
            color: '#fff0',
            symbolColor: '#fff'
          },
          // transparent: true,
          // backgroundColor: '#24242400'
          // 窗口透明会导致失去圆角, 但vscode等应用可以实现透明窗口且保持圆角
          backgroundColor: '#242424'
          // backgroundMaterial: 'acrylic' // Windows 11 窗口亚克力效果
          // 窗口在最大化时失去效果的问题: 变黑并失去圆角
          // 这个问题在以下 pr 中提及并缓解, 但我认为这个问题还是存在(v34.2.0)
          // https://github.com/electron/electron/pull/45456
          // 一个有效的解决方案是不使用原生控件, 在自定义控件的最大化时, 使用win.setBounds()来模拟最大化
          // 但会丢失原生窗口的一些特性, 如窗口拖动区域最大化, 窗口最大化时的动画效果
        }
      : {
          backgroundColor: '#24242400',
          vibrancy: 'fullscreen-ui' // MacOS 窗口明亮效果
        }),
    trafficLightPosition: { x: 9, y: 9 },
    width: 1024,
    height: 768,
    minWidth: 400,
    minHeight: 270,
    icon: path.join(process.env.VITE_PUBLIC, 'vite.svg'),
    webPreferences: {
      preload: path.join(MAIN_DIST, 'preload.mjs')
    }
  })

  // TODO: 测试能不能监听右键事件
  // 在 Windows 上, 右键可拖拽区域会弹出系统菜单
  // 通过 hookWindowMessage(278) 拦截右键事件, 防止弹出系统菜单
  win.hookWindowMessage?.(278, () => {
    win.setEnabled(false) //窗口禁用
    setTimeout(() => {
      win.setEnabled(true) //窗口启用
    }, 100)
    return true
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
  .then(() => {
    useCommand()
    useIpc()
  })
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

    ipcMain.on('window:set-title', (e, title: string) => {
      const win = BrowserWindow.fromWebContents(e.sender)
      if (win) {
        win.setTitle(title)
      }
    })
  })
