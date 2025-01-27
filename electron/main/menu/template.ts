import { app, Menu } from 'electron'
import { getValue } from '@ele/utils/getValue'

const isMac = process.platform === 'darwin'

type Lang = import('../../../types/language').Lang

export const createAppMenu = (lang: Lang) =>
  Menu.buildFromTemplate([
    ...((isMac
      ? [
          {
            role: 'appMenu',
            label: app.getName(),
            submenu: [
              { type: 'separator' },
              {
                role: 'about',
                label: getValue(lang, 'title.menu.appMenu.items.about', 'About')
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
        },
        { type: 'separator' },
        {
          label: getValue(lang, 'title.menu.edit.items.autoFill', 'Auto Fill')
        },
        {
          label: getValue(
            lang,
            'title.menu.edit.items.dictation',
            'Start Dictation'
          )
        },
        {
          label: getValue(
            lang,
            'title.menu.edit.items.emoticonsSymbols',
            'Emoticons & Symbols'
          )
        }
      ]
    },
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
    {
      label: getValue(lang, 'title.menu.go.value', 'Go')
    },
    {
      label: getValue(lang, 'title.menu.terminal.value', 'Terminal')
    },
    {
      role: 'windowMenu',
      label: getValue(lang, 'title.menu.window.value', 'Window')
    },
    {
      role: 'help',
      label: getValue(lang, 'title.menu.help.value', 'Help')
    }
  ])
