export type Lang = {
  title: {
    search: {
      value: string
    }
    menu: {
      appMenu: {
        value: string
        items: {
          about: string
          update: string
          preferences: {
            value: string
            items: {
              settings: string
              keyboards: string
              themes: string
              languages: string
            }
          }
          services: string
          hide: string
          hideOthers: string
          unhide: string
          quit: string
        }
      }
      file: {
        value: string
        items: {
          newWindow: string
          newWindowByConfig: string
          open: string
          openFolder: string
          openWorkspaceByConfig: string
          openRecentWorkspace: {
            value: string
            items: {
              more: string
              clear: string
            }
          }
          save: string
          saveAs: string
          saveAll: string
          saveWorkspaceAs: string
          share: {
            value: string
            items: null
          }
          autoSave: string
          closeWorkspace: string
          closeWindow: string
        }
      }
      edit: {
        value: string
        items: {
          undo: string
          redo: string
          cut: string
          copy: string
          paste: string
          find: string
          replace: string
          findInFiles: string
          replaceInFiles: string
        }
      }
      selection: {
        value: string
        items: {
          selectAll: string
          copyOneLineUp: string
          copyOneLineDown: string
          moveOneLineUp: string
          moveOneLineDown: string
          addCursorUp: string
          addCursorDown: string
        }
      }
      view: {
        value: string
        items: {
          commandPalette: string
          openView: string
          appearance: {
            value: string
            items: {
              primarySidebar: string
              auxiliarySidebar: string
              statusBar: string
              panel: string
              thumbnail: string
            }
          }
          autoLineBreak: string
        }
      }
      go: {
        value: string
        items: {
          back: string
          forward: string
          lastEditLocation: string
          switchTab: {
            value: string
            items: {
              previous: string
              next: string
            }
          }
          goToFile: string
          goToRowColumn: string
        }
      }
      terminal: {
        value: string
        items: {
          newTerminal: string
          clearTerminal: string
          runTask: string
          runSelectedText: string
          killTask: string
        }
      }
      window: {
        value: string
        items: {
          minimize: string
          zoom: string
          bringAllToFront: string
        }
      }
      help: {
        value: string
        items: {
          search: string
          showAllCommands: string
          documentation: string
          releaseNotes: string
          reportIssue: string
          featureRequests: string
          viewLicense: string
          privacyStatement: string
          toggleDevTools: string
          about: string
          checkForUpdates: string
        }
      }
    }
  }
}
