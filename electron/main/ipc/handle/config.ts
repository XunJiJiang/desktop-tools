// 先尝试读取配置文件, 没有则将默认配置写入配置文件
// 监听配置文件的变化, 有变化则重新读取配置文件

import { resourcesPath } from '@ele/utils/resourcesPath'
import { app, ipcMain, webContents } from 'electron'
import { readFile, writeFile } from 'node:fs'
import { join } from 'node:path'

type Config = import('../../../../types/settings').Settings

const defPath = join(resourcesPath(), 'default', 'config.json')

const configPath = join(app.getPath('userData'), 'config', 'config.json')

const writeDefaultConfig = async () => {
  return new Promise<string>((resolve, reject) => {
    readFile(defPath, 'utf-8', (err, data) => {
      if (err) {
        console.error('Error reading default config file:', err)
      }
      writeFile(configPath, data, 'utf-8', (err) => {
        if (err) {
          console.error('Error writing default config file:', err)
          reject(err)
        } else resolve(data)
      })
    })
  })
}

export const updateConfigFile = (
  setConfig: (config: Config) => Config
) => {
  const _config = setConfig(config)
  return () => {
    return new Promise<void>((resolve, reject) => {
      writeFile(
        configPath,
        JSON.stringify(_config, null, 2),
        'utf-8',
        (err) => {
          if (err) {
            console.error('Error writing config file:', err)
            reject(err)
          } else resolve()
        }
      )
    })
  }
}

let config: object
const useConfig = (args: { onUpdated: (config: Config) => void }) => {
  readFile(configPath, 'utf-8', async (err, data) => {
    if (err) {
      const _config = await writeDefaultConfig()
      config = JSON.parse(_config)
    }
    config = JSON.parse(data)
  })

  ipcMain.handle('config:update:file', async (_, config) => {
    const run = updateConfigFile(() => config)
    return await run()
  })

  ipcMain.handle('config:default', async () => {
    return new Promise<string>(async (resolve) => {
      readFile(defPath, 'utf-8', (err, data) => {
        if (err) {
          console.error('Error reading default config file:', err)
        }
        resolve(data)
      })
    })
  })

  ipcMain.on('config:global:update', async (e, _config: Config) => {
    config = _config
    args.onUpdated(config)

    const windows = webContents
      .getAllWebContents()
      .filter((w) => w.id !== e.sender.id)

    windows.forEach((w) => {
      w.send('config:global:update', config)
    })
  })
}

export default useConfig
