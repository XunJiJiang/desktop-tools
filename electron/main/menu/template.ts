import { app, BrowserWindow, Menu } from 'electron'
import { getValue } from '@ele/utils/getValue'

const isMac = process.platform === 'darwin'

type Lang = import('@/types/language').Lang

const createMenuTemplate = (lang: Lang) =>
  [
    // macOS 应用程序
    ...((isMac
      ? [
          {
            role: 'appMenu',
            label: app.getName(),
            submenu: [
              { type: 'separator' },
              {
                role: 'about',
                label: `${getValue(lang, 'title.menu.appMenu.items.about', 'About')} ${app.getName()}`
              },
              {
                label: getValue(
                  lang,
                  'title.menu.appMenu.items.update',
                  'Check for updates'
                )
              },
              { type: 'separator' },
              {
                label: getValue(
                  lang,
                  'title.menu.appMenu.items.preferences.value',
                  'Preferences'
                ),
                submenu: [
                  {
                    label: getValue(
                      lang,
                      'title.menu.appMenu.items.preferences.items.settings',
                      'Settings'
                    ),
                    accelerator: isMac ? 'Cmd+,' : 'Ctrl+,'
                  },
                  {
                    label: getValue(
                      lang,
                      'title.menu.appMenu.items.preferences.items.keyboards',
                      'Keyboard shortcuts'
                    )
                  },
                  {
                    label: getValue(
                      lang,
                      'title.menu.appMenu.items.preferences.items.themes',
                      'Themes'
                    )
                  },
                  {
                    label: getValue(
                      lang,
                      'title.menu.appMenu.items.preferences.items.languages',
                      'Languages'
                    )
                  }
                ]
              },
              { type: 'separator' },
              {
                role: 'services',
                label: getValue(
                  lang,
                  'title.menu.appMenu.items.services',
                  'Services'
                )
              },
              { type: 'separator' },
              {
                role: 'hide',
                label: getValue(lang, 'title.menu.appMenu.items.hide', 'Hide')
              },
              {
                role: 'hideOthers',
                label: getValue(
                  lang,
                  'title.menu.appMenu.items.hideOthers',
                  'Hide Others'
                )
              },
              {
                role: 'unhide',
                label: getValue(
                  lang,
                  'title.menu.appMenu.items.unhide',
                  'Show All'
                )
              },
              { type: 'separator' },
              {
                role: 'quit',
                label: getValue(lang, 'title.menu.appMenu.items.quit', 'Quit')
              }
            ]
          }
        ]
      : []) as Electron.MenuItemConstructorOptions[]),
    // 文件
    {
      label: getValue(lang, 'title.menu.file.value', 'File'),
      submenu: [
        {
          label: getValue(
            lang,
            'title.menu.file.items.newWindow',
            'New Window'
          ),
          accelerator: isMac ? 'Cmd+Shift+N' : 'Ctrl+Shift+N'
        },
        {
          label: getValue(
            lang,
            'title.menu.file.items.newWindowByConfig',
            'New Window from Config'
          )
        },
        { type: 'separator' },
        {
          label: getValue(lang, 'title.menu.file.items.open', 'Open'),
          accelerator: isMac ? 'Cmd+O' : 'Ctrl+O'
        },
        {
          label: getValue(
            lang,
            'title.menu.file.items.openFolder',
            'Open Folder'
          )
        },
        {
          label: getValue(
            lang,
            'title.menu.file.items.openWorkspaceByConfig',
            'Open Workspace from Config'
          )
        },
        {
          label: getValue(
            lang,
            'title.menu.file.items.openRecentWorkspace.value',
            'Open Recent Workspace'
          ),
          submenu: [
            // TODO: 持久化历史工作区, 此处从持久化数据中读取, 最多显示10个
            { type: 'separator' },
            {
              label: getValue(
                lang,
                'title.menu.file.items.openRecentWorkspace.items.more',
                'More...'
              )
            },
            {
              label: getValue(
                lang,
                'title.menu.file.items.openRecentWorkspace.items.clear',
                'Clear'
              )
            }
          ]
        },
        { type: 'separator' },
        {
          label: getValue(lang, 'title.menu.file.items.save', 'Save'),
          accelerator: isMac ? 'Cmd+S' : 'Ctrl+S'
        },
        {
          label: getValue(lang, 'title.menu.file.items.saveAs', 'Save As...'),
          accelerator: isMac ? 'Cmd+Shift+S' : 'Ctrl+Shift+S'
        },
        {
          label: getValue(lang, 'title.menu.file.items.saveAll', 'Save All'),
          accelerator: isMac ? 'Cmd+Alt+S' : 'Ctrl+Alt+S'
        },
        {
          label: getValue(
            lang,
            'title.menu.file.items.saveWorkspaceAs',
            'Save Workspace As...'
          )
        },
        { type: 'separator' },
        {
          label: getValue(lang, 'title.menu.file.items.share.value', 'Share'),
          submenu: [
            // TODO: 共享子菜单
          ]
        },
        { type: 'separator' },
        {
          label: getValue(lang, 'title.menu.file.items.autoSave', 'Auto Save')
        },
        { type: 'separator' },
        {
          label: getValue(
            lang,
            'title.menu.file.items.closeWorkspace',
            'Close Workspace'
          )
        },
        {
          label: getValue(
            lang,
            'title.menu.file.items.closeWindow',
            'Close Window'
          ),
          accelerator: isMac ? 'Cmd+Shift+W' : 'Ctrl+Shift+W'
        }
      ]
    },
    // 编辑
    {
      role: 'editMenu',
      label: getValue(lang, 'title.menu.edit.value', 'Edit'),
      submenu: [
        {
          role: 'undo',
          label: getValue(lang, 'title.menu.edit.items.undo', 'Undo'),
          accelerator: isMac ? 'Cmd+Z' : 'Ctrl+Z'
        },
        {
          role: 'redo',
          label: getValue(lang, 'title.menu.edit.items.redo', 'Redo'),
          accelerator: isMac ? 'Cmd+Shift+Z' : 'Ctrl+Y'
        },
        { type: 'separator' },
        {
          role: 'cut',
          label: getValue(lang, 'title.menu.edit.items.cut', 'Cut'),
          accelerator: isMac ? 'Cmd+X' : 'Ctrl+X'
        },
        {
          role: 'copy',
          label: getValue(lang, 'title.menu.edit.items.copy', 'Copy'),
          accelerator: isMac ? 'Cmd+C' : 'Ctrl+C'
        },
        {
          role: 'paste',
          label: getValue(lang, 'title.menu.edit.items.paste', 'Paste'),
          accelerator: isMac ? 'Cmd+V' : 'Ctrl+V'
        },
        { type: 'separator' },
        {
          label: getValue(lang, 'title.menu.edit.items.find', 'Find'),
          accelerator: isMac ? 'Cmd+F' : 'Ctrl+F'
        },
        {
          label: getValue(lang, 'title.menu.edit.items.replace', 'Replace'),
          accelerator: isMac ? 'Cmd+Alt+F' : 'Ctrl+Alt+F'
        },
        {
          label: getValue(
            lang,
            'title.menu.edit.items.findInFiles',
            'Find in Files'
          ),
          accelerator: isMac ? 'Cmd+Shift+F' : 'Ctrl+Shift+F'
        },
        {
          label: getValue(
            lang,
            'title.menu.edit.items.replaceInFiles',
            'Replace in Files'
          ),
          accelerator: isMac ? 'Cmd+Shift+H' : 'Ctrl+Shift+H'
        }
      ]
    },
    // 选择
    {
      label: getValue(lang, 'title.menu.selection.value', 'Selection'),
      submenu: [
        {
          label: getValue(
            lang,
            'title.menu.selection.items.selectAll',
            'Select All'
          ),
          accelerator: isMac ? 'Cmd+A' : 'Ctrl+A'
        },
        { type: 'separator' },
        {
          label: getValue(
            lang,
            'title.menu.selection.items.copyOneLineUp',
            'Copy Line Up'
          ),
          accelerator: isMac ? 'Cmd+Alt+Up' : 'Ctrl+Alt+Up'
        },
        {
          label: getValue(
            lang,
            'title.menu.selection.items.copyOneLineDown',
            'Copy Line Down'
          ),
          accelerator: isMac ? 'Cmd+Alt+Down' : 'Ctrl+Alt+Down'
        },
        {
          label: getValue(
            lang,
            'title.menu.selection.items.moveOneLineUp',
            'Move Line Up'
          ),
          accelerator: isMac ? 'Alt+Up' : 'Alt+Up'
        },
        {
          label: getValue(
            lang,
            'title.menu.selection.items.moveOneLineDown',
            'Move Line Down'
          ),
          accelerator: isMac ? 'Alt+Down' : 'Alt+Down'
        },
        { type: 'separator' },
        {
          label: getValue(
            lang,
            'title.menu.selection.items.addCursorUp',
            'Add Cursor Up'
          ),
          accelerator: isMac ? 'Cmd+Alt+Up' : 'Ctrl+Alt+Up'
        },
        {
          label: getValue(
            lang,
            'title.menu.selection.items.addCursorDown',
            'Add Cursor Down'
          ),
          accelerator: isMac ? 'Cmd+Alt+Down' : 'Ctrl+Alt+Down'
        }
      ]
    },
    // 查看
    {
      label: getValue(lang, 'title.menu.view.value', 'View'),
      submenu: [
        {
          label: getValue(
            lang,
            'title.menu.view.items.commandPalette',
            'Command Palette...'
          ),
          accelerator: isMac ? 'Cmd+Shift+P' : 'Ctrl+Shift+P'
        },
        {
          label: getValue(
            lang,
            'title.menu.view.items.openView',
            'Open View...'
          )
        },
        { type: 'separator' },
        {
          label: getValue(
            lang,
            'title.menu.view.items.appearance.value',
            'Appearance'
          ),
          submenu: [
            {
              label: getValue(
                lang,
                'title.menu.view.items.appearance.items.primarySidebar',
                'Primary Sidebar'
              ),
              accelerator: isMac ? 'Cmd+B' : 'Ctrl+B'
            },
            {
              label: getValue(
                lang,
                'title.menu.view.items.appearance.items.auxiliarySidebar',
                'Auxiliary Sidebar'
              ),
              accelerator: isMac ? 'Cmd+Alt+B' : 'Ctrl+Alt+B'
            },
            {
              label: getValue(
                lang,
                'title.menu.view.items.appearance.items.statusBar',
                'Status Bar'
              )
            },
            {
              label: getValue(
                lang,
                'title.menu.view.items.appearance.items.panel',
                'Panel'
              ),
              accelerator: isMac ? 'Cmd+J' : 'Ctrl+J'
            },
            { type: 'separator' },
            {
              label: getValue(
                lang,
                'title.menu.view.items.appearance.items.thumbnail',
                'Thumbnail'
              )
            }
          ]
        },
        {
          label: getValue(
            lang,
            'title.menu.view.items.autoLineBreak',
            'Auto Line Break'
          ),
          accelerator: 'Alt+Z'
        }
      ]
    },
    // 转到
    {
      label: getValue(lang, 'title.menu.go.value', 'Go'),
      submenu: [
        {
          label: getValue(lang, 'title.menu.go.items.back', 'Back'),
          accelerator: isMac ? 'Ctrl+-' : 'Alt+Left'
        },
        {
          label: getValue(lang, 'title.menu.go.items.forward', 'Forward'),
          accelerator: isMac ? 'Ctrl+Shift+-' : 'Alt+Right'
        },
        {
          label: getValue(
            lang,
            'title.menu.go.items.lastEditLocation',
            'Last Edit Location'
          )
        },
        { type: 'separator' },
        {
          label: getValue(
            lang,
            'title.menu.go.items.switchTab.value',
            'Switch Tab'
          ),
          // TODO: 验证此处 win 平台的快捷键是否正确
          submenu: [
            {
              label: getValue(
                lang,
                'title.menu.go.items.switchTab.items.previous',
                'Previous'
              ),
              accelerator: isMac ? 'Cmd+Alt+Left' : 'Ctrl+Shift+Tab'
            },
            {
              label: getValue(
                lang,
                'title.menu.go.items.switchTab.items.next',
                'Next'
              ),
              accelerator: isMac ? 'Cmd+Alt+Right' : 'Ctrl+Tab'
            }
          ]
        },
        { type: 'separator' },
        {
          label: getValue(lang, 'title.menu.go.items.goToFile', 'Go to File')
        },
        {
          label: getValue(
            lang,
            'title.menu.go.items.goToRowColumn',
            'Go to Row/Column'
          ),
          accelerator: 'Alt+G'
        }
      ]
    },
    // 终端
    {
      label: getValue(lang, 'title.menu.terminal.value', 'Terminal'),
      submenu: [
        {
          label: getValue(
            lang,
            'title.menu.terminal.items.newTerminal',
            'New Terminal'
          ),
          accelerator: 'Ctrl+Shift+`'
        },
        {
          label: getValue(
            lang,
            'title.menu.terminal.items.clearTerminal',
            'Clear Terminal'
          )
        },
        { type: 'separator' },
        {
          label: getValue(
            lang,
            'title.menu.terminal.items.runTask',
            'Run Task...'
          )
        },
        {
          label: getValue(
            lang,
            'title.menu.terminal.items.runSelectedText',
            'Run Selected Text'
          )
        },
        { type: 'separator' },
        {
          label: getValue(
            lang,
            'title.menu.terminal.items.killTask',
            'Kill Task'
          )
        }
      ]
    },
    // macOS 窗口
    ...((isMac
      ? [
          {
            role: 'windowMenu',
            label: getValue(lang, 'title.menu.window.value', 'Window'),
            submenu: [
              {
                role: 'minimize',
                label: getValue(
                  lang,
                  'title.menu.window.items.minimize',
                  'Minimize'
                )
              },
              {
                role: 'zoom',
                label: getValue(lang, 'title.menu.window.items.zoom', 'Zoom')
              },
              { type: 'separator' },
              {
                role: 'front',
                label: getValue(
                  lang,
                  'title.menu.window.items.bringAllToFront',
                  'Bring All to Front'
                )
              }
            ]
          }
        ]
      : []) as Electron.MenuItemConstructorOptions[]),
    // 帮助
    {
      role: 'help',
      label: getValue(lang, 'title.menu.help.value', 'Help'),
      submenu: [
        {
          label: getValue(lang, 'title.menu.help.items.search', 'Search'),
          accelerator: isMac ? 'Cmd+P' : 'Ctrl+P'
        },
        { type: 'separator' },
        {
          label: getValue(
            lang,
            'title.menu.help.items.showAllCommands',
            'Show All Commands'
          )
        },
        {
          label: getValue(
            lang,
            'title.menu.help.items.documentation',
            'Documentation'
          )
        },
        {
          label: getValue(
            lang,
            'title.menu.help.items.releaseNotes',
            'Release Notes'
          )
        },
        { type: 'separator' },
        {
          label: getValue(
            lang,
            'title.menu.help.items.reportIssue',
            'Report Issue'
          )
        },
        {
          label: getValue(
            lang,
            'title.menu.help.items.featureRequests',
            'Feature Requests'
          )
        },
        { type: 'separator' },
        {
          label: getValue(
            lang,
            'title.menu.help.items.viewLicense',
            'View License'
          )
        },
        {
          label: getValue(
            lang,
            'title.menu.help.items.privacyStatement',
            'Privacy Statement'
          )
        },
        { type: 'separator' },
        {
          label: getValue(
            lang,
            'title.menu.help.items.toggleDevTools',
            'Toggle Developer Tools'
          ),
          accelerator: process.env.NODE_ENV === 'development' ? 'F12' : '',
          click: (_, focusedWindow) => {
            if (focusedWindow && focusedWindow instanceof BrowserWindow) {
              focusedWindow.webContents.toggleDevTools()
            }
          }
        },
        ...((!isMac
          ? []
          : [
              { type: 'separator' },
              {
                label: `${getValue(lang, 'title.menu.help.items.about', 'About')} ${app.getName()}`
              },
              {
                label: getValue(
                  lang,
                  'title.menu.help.items.checkForUpdates',
                  'Check for Updates'
                )
              }
            ]) as Electron.MenuItemConstructorOptions[])
      ]
    }
  ] as Electron.MenuItemConstructorOptions[]

/**
 * 创建应用程序菜单
 */
export const createAppMenu = (lang: Lang) =>
  Menu.buildFromTemplate(createMenuTemplate(lang))

/**
 * 创建应用程序菜单(基于createMenuTemplate, 排除函数属性)
 * 用于非 macOS 创建应用程序菜单
 */
export const createWinMenu = (lang: Lang) => {
  const menu = createMenuTemplate(lang)
  function filterFunc(
    menu: Electron.MenuItemConstructorOptions[]
  ): Electron.MenuItemConstructorOptions[] {
    return menu.map((item: Electron.MenuItemConstructorOptions) => {
      if (item.submenu) {
        item.submenu = filterFunc(
          item.submenu as Electron.MenuItemConstructorOptions[]
        )
      }
      for (const key in item) {
        if (
          typeof item[key as keyof Electron.MenuItemConstructorOptions] ===
          'function'
        ) {
          delete item[key as keyof Electron.MenuItemConstructorOptions]
        }
      }
      return item
    })
  }
  return filterFunc(menu)
}
