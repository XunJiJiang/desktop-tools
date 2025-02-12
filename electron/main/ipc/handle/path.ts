import { app, ipcMain } from 'electron'
import { join } from 'node:path'
import { singleRun } from '@/utils/singleRun'

export type PathName = import('@/types/path').PathName

const usePath = singleRun(() => {
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
})

export default usePath
