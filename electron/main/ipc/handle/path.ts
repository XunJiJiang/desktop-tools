import { app, ipcMain } from 'electron'
import { join } from 'node:path'

const usePath = () => {
  ipcMain.handle(
    'path:get',
    async (
      _,
      name:
        | 'home'
        | 'appData'
        | 'userData'
        | 'sessionData'
        | 'temp'
        | 'exe'
        | 'module'
        | 'desktop'
        | 'documents'
        | 'downloads'
        | 'music'
        | 'pictures'
        | 'videos'
        | 'recent'
        | 'logs'
        | 'crashDumps',
      paths?: string[]
    ) => {
      const path = app.getPath(name)
      if (paths?.length) {
        return join(path, ...paths)
      }
      return path
    }
  )

  ipcMain.handle('path:join', async (_, ...paths: string[]) => {
    return join(...paths)
  })
}

export default usePath
