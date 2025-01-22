/* eslint-disable @typescript-eslint/no-explicit-any */
import { ipcMain } from 'electron'
import fs from 'node:fs'
import { join } from 'node:path'

const resourcesPath = () =>
  process.env['VITE_DEV_SERVER_URL']
    ? process.env.APP_ROOT
    : process.resourcesPath

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
  ipcMain.handle('fs:exists', async (_, path: fs.PathLike) => {
    return new Promise<boolean>((resolve) => {
      fs.access(path, fs.constants.F_OK, (err) => {
        resolve(!err)
      })
    })
  })
  ipcMain.handle('fs:stat', async (_, path: fs.PathLike, opts?: any) => {
    return new Promise((resolve, reject) => {
      fs.stat(path, opts, (err, stats) => {
        if (err) {
          reject(err)
        } else {
          resolve({
            ...stats,
            isDirectory: stats.isDirectory(),
            isFile: stats.isFile(),
            isBlockDevice: stats.isBlockDevice(),
            isCharacterDevice: stats.isCharacterDevice(),
            isFIFO: stats.isFIFO(),
            isSocket: stats.isSocket(),
            isSymbolicLink: stats.isSymbolicLink()
          })
        }
      })
    })
  })
  ipcMain.handle('fs:readfile', async (_, path: fs.PathLike, opts?: any) => {
    return new Promise((resolve, reject) => {
      fs.readFile(path, opts, (err, data) => {
        if (err) {
          reject(err)
        } else {
          resolve(data)
        }
      })
    })
  })
  ipcMain.handle(
    'fs:writefile',
    async (_, path: fs.PathLike, data: any, opts?: any) => {
      return new Promise<void>((resolve, reject) => {
        fs.writeFile(path, data, opts, (err) => {
          if (err) {
            reject(err)
          } else {
            resolve()
          }
        })
      })
    }
  )
  ipcMain.handle('fs:mkdir', async (_, path: fs.PathLike, opts?: any) => {
    return new Promise<void>((resolve, reject) => {
      fs.mkdir(path, opts, (err) => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })
  })
  ipcMain.handle('fs:rmdir', async (_, path: fs.PathLike, opts?: any) => {
    return new Promise<void>((resolve, reject) => {
      fs.rmdir(path, opts, (err) => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })
  })
  ipcMain.handle('fs:unlink', async (_, path: fs.PathLike) => {
    return new Promise<void>((resolve, reject) => {
      fs.unlink(path, (err) => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })
  })
  ipcMain.handle(
    'fs:rename',
    async (_, oldPath: fs.PathLike, newPath: fs.PathLike) => {
      return new Promise<void>((resolve, reject) => {
        fs.rename(oldPath, newPath, (err) => {
          if (err) {
            reject(err)
          } else {
            resolve()
          }
        })
      })
    }
  )
  ipcMain.handle('fs:resources', async (_, paths: string[]) => {
    const p = join(resourcesPath(), 'resources', ...paths)
    return new Promise((resolve, reject) => {
      fs.readFile(p, { encoding: 'utf-8' }, (err, data) => {
        if (err) {
          reject(err)
        } else {
          resolve(data)
        }
      })
    })
  })
}

export default useFs
