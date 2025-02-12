// 先尝试读取配置文件, 没有则将默认配置写入配置文件
// 监听配置文件的变化, 有变化则重新读取配置文件

import { resourcesPath } from '@ele/utils/resourcesPath'
import { app, ipcMain, webContents } from 'electron'
import { readFile, writeFile } from 'node:fs'
import { join } from 'node:path'
import { singleRun } from '@/utils/singleRun'

type Config = import('@/types/settings').Settings

/** 基础配置路径 */
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

const readConfig = async () => {
  return new Promise<string>((resolve) => {
    readFile(configPath, 'utf-8', (err, data) => {
      if (err) {
        console.error('Error reading config file:', err)
        resolve('{}')
      }
      resolve(data)
    })
  })
}

export const updateConfigFile = (setConfig: (config: Config) => Config) => {
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

let config: Config
const useConfig = singleRun(
  (
    args: { onUpdated: (config: Config) => void } = {
      onUpdated: () => {}
    }
  ) => {
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
      return await readConfig()
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

    return {
      updateWebviewConfig(setConfig: (config: Config) => Config) {
        const _config = setConfig(config)
        const run = updateConfigFile(() => _config)
        run()
        const windows = webContents.getAllWebContents()
        windows.forEach((w) => {
          w.send('config:global:update', config)
        })
      },
      async getConfig(): Promise<Config> {
        return (config = JSON.parse(await readConfig()))
      }
    }
  }
)

export default useConfig
