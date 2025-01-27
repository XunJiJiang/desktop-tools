import { app, ipcMain } from 'electron'
import { join } from 'node:path'

export type PathName = import('../../../../types/path').PathName;

const usePath = () => {
  ipcMain.handle('path:get', async (_, name: PathName, paths?: string[]) => {
    const path = app.getPath(name)
    if (paths?.length) {
      return join(path, ...paths)
    }
    return path
  })

  ipcMain.handle('path:join', async (_, ...paths: string[]) => {
    return join(...paths)
  })
}

export default usePath
