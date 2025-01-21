/* eslint-disable @typescript-eslint/no-explicit-any */
import { ipcMain } from 'electron'
import fs from 'node:fs'
import { join } from 'node:path'

// const exposeList = [
//   'exists',
//   'stat',
//   'readdir',
//   'readFile',
//   'writeFile',
//   'mkdir',
//   'rmdir',
//   'unlink',
//   'rename'
// ] as const

const useFs = () => {
  ipcMain.handle('fs:exists', async (_, path: fs.PathLike) =>
    fs.existsSync(path)
  )
  ipcMain.handle('fs:stat', async (_, path: fs.PathLike, opts?: any) =>
    fs.statSync(path, opts)
  )
  ipcMain.handle('fs:readdir', async (_, path: fs.PathLike, opts?: any) =>
    fs.readdirSync(path, opts)
  )
  ipcMain.handle('fs:readFile', async (_, path: fs.PathLike, opts?: any) =>
    fs.readFileSync(path, opts)
  )
  ipcMain.handle(
    'fs:writeFile',
    async (_, path: fs.PathLike, data: any, opts?: any) =>
      fs.writeFileSync(path, data, opts)
  )
  ipcMain.handle('fs:mkdir', async (_, path: fs.PathLike, opts?: any) =>
    fs.mkdirSync(path, opts)
  )
  ipcMain.handle('fs:rmdir', async (_, path: fs.PathLike, opts?: any) =>
    fs.rmdirSync(path, opts)
  )
  ipcMain.handle('fs:unlink', async (_, path: fs.PathLike) =>
    fs.unlinkSync(path)
  )
  ipcMain.handle(
    'fs:rename',
    async (_, oldPath: fs.PathLike, newPath: fs.PathLike) =>
      fs.renameSync(oldPath, newPath)
  )
  ipcMain.handle('fs:resources', async (_, path: string) => {
    const p = join(process.resourcesPath, path)
    return fs.readFileSync(p, {
      encoding: 'utf-8'
    })
  })
}

export default useFs
