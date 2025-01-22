/* eslint-disable @typescript-eslint/no-explicit-any */
import { reactive, watch } from 'vue'
import defaultConfig from '@apps/assets/config/default.json'

type ConfigValue = string | number | boolean | object | null

type DeepPartial<T> = T extends object
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : T

type UpdateConfig<T, P extends string> = P extends '[update:all]'
  ? T
  : P extends `${infer K}.${infer R}`
    ? T extends { [key in K]: infer V }
      ? UpdateConfig<V, R>
      : T
    : T extends { [key in P]: infer V }
      ? V
      : T

export type ConfigHandler<T = any> = {
  value: DeepPartial<T>
  update: <P extends string>(path: P, value: UpdateConfig<T, P>) => void
  on: <P extends string>(
    key: P,
    callback: (config: UpdateConfig<T, P>) => void
  ) => void
  remove: <T extends ConfigValue>(
    key: `${string}` | '[update:all]',
    callback: (config: T) => void
  ) => void
  close: () => void
}

interface ResolvePath {
  (path: string): string[]
  (path: string[]): string
}

const resolvePath = ((path) => {
  if (typeof path === 'string') {
    return path.split('.')
  } else {
    return path.join('.')
  }
}) as ResolvePath

const hasChange = (a: any, b: any) => {
  if (typeof a !== typeof b) return true
  return JSON.stringify(a) !== JSON.stringify(b)
}

const getValue = (obj: any, path: string) => {
  const pathArray = resolvePath(path)
  let current = obj
  for (let i = 0; i < pathArray.length; i++) {
    current = current[pathArray[i]]
    if (current === undefined) return undefined
  }
  return current
}

/**
 * 创建配置加载器
 * @param configPath 配置文件路径
 * @param delay 写入配置文件的延迟时间
 * @returns
 */
export const createConfigLoader = async <T = any>(
  configPath?: string,
  configId?: string,
  delay = 1000
) => {
  return await loadConfig<T>(
    configPath ??
      (await window.ipcRenderer.invoke(
        'path:join',
        await window.ipcRenderer.invoke('path:get', 'userData'),
        'config'
      )),
    configId ?? 'config.json',
    delay,
    configPath === void 0
  )
}

const loadConfig = async <T>(
  appConfigPath: string,
  configId: string,
  delay: number,
  isGlobal: boolean = false
): Promise<ConfigHandler<T>> => {
  let config
  const appFullConfigId = await window.ipcRenderer.invoke(
    'path:join',
    appConfigPath,
    configId
  )
  if (await window.ipcRenderer.invoke('fs:exists', appConfigPath)) {
    config = reactive(
      JSON.parse(
        await window.ipcRenderer.invoke('fs:readfile', appFullConfigId, {
          encoding: 'utf-8'
        })
      )
    )
  } else {
    await window.ipcRenderer.invoke('fs:mkdir', appConfigPath, {
      recursive: true
    })
    window.ipcRenderer.invoke(
      'fs:writefile',
      appFullConfigId,
      JSON.stringify(isGlobal ? defaultConfig : {}, null, 2),
      {
        encoding: 'utf-8'
      }
    )
    config = reactive(isGlobal ? defaultConfig : {})
  }

  const eventMap = new Map<string, Set<(config: any) => void>>()
  const updateAllCallbacks = new Set<(config: any) => void>()

  let timeout: number | null = null

  let oldConfig = JSON.stringify(config)

  const distribute = (v: typeof config) => {
    const ov = JSON.parse(oldConfig)
    oldConfig = JSON.stringify(v)
    /** 变化了的路径和对应的新值 */
    const map = new Map<string, any>()
    /** 变化了的路径和全部父路径 */
    const set = new Set<string>()
    for (const [key, callbacks] of [...eventMap.entries()].sort(
      (a, b) => b[0].split('.').length - a[0].split('.').length
    )) {
      const cv = getValue(v, key)
      if (set.has(key)) {
        callbacks.forEach((callback) => {
          callback(cv)
        })
        continue
      }
      if (hasChange(cv, getValue(ov, key))) {
        map.set(key, cv)
        const pathArray = resolvePath(key)
        for (let i = 0; i < pathArray.length; i++) {
          set.add(pathArray.slice(0, i + 1).join('.'))
        }
        callbacks.forEach((callback) => {
          callback(cv)
        })
        continue
      }
    }
    updateAllCallbacks.forEach((callback) => {
      callback(v)
    })
    return map
  }

  const value = JSON.parse(JSON.stringify(config))

  watch(
    config,
    (v) => {
      result.value = JSON.parse(JSON.stringify(v))
      distribute(v)
    },
    {
      deep: true
    }
  )

  const updateConfigFile = (c: typeof config) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => {
      window.ipcRenderer.invoke(
        'fs:writefile',
        appFullConfigId,
        JSON.stringify(c, null, 2)
      )
      timeout = null
    }, delay)
  }

  const handles = () => {
    if (timeout)
      window.ipcRenderer.invoke(
        'fs:writefile',
        appFullConfigId,
        JSON.stringify(config, null, 2)
      )
  }

  window.ipcRenderer.on('app:close', handles)

  const result = {
    value,
    update<P extends string>(
      path: P,
      value: P extends '[update:all]'
        ? Record<string, ConfigValue>
        : ConfigValue
    ) {
      if (path === '[update:all]') {
        for (const key in value as T) {
          config[key] = JSON.parse(JSON.stringify((value as T)[key]))
        }
        return
      }
      const pathArray = resolvePath(path)
      let current = config
      for (let i = 0; i < pathArray.length - 1; i++) {
        current = current[pathArray[i]] ?? (current[pathArray[i]] = {})
      }
      current[pathArray[pathArray.length - 1]] = value
    },
    on<T extends ConfigValue>(
      key: `${string}` | '[update:all]',
      callback: (config: T) => void
    ) {
      if (key === '[update:all]') updateAllCallbacks.add(callback)
      else
        eventMap.set(
          key,
          eventMap.has(key)
            ? eventMap.get(key)!.add(callback)
            : new Set([callback])
        )
    },
    remove<T extends ConfigValue>(
      path: `${string}` | '[update:all]',
      callback: (config: T) => void
    ) {
      if (path === '[update:all]') updateAllCallbacks.delete(callback)
      else eventMap.get(path)?.delete(callback)
    },
    close() {
      handles()
      window.ipcRenderer.off('app:close', handles)
    }
  } as ConfigHandler<T>

  result.on<typeof config>('[update:all]', updateConfigFile)

  return result
}

export type GlobalConfig = {
  language: null | 'zh' | 'en' | 'ja' | 'tw'
  theme: `${string}:${string}`
  'bg-transparency': false | number
  'title-bar': {
    style: 'windows' | 'macos'
  }
  workspace: {
    path: null | string
  }
}

/**
 * @ value 配置内容, 非响应式
 * @ update 更新配置
 * @ on 监听指定配置变化
 * @ remove 移除监听
 */
const config = createConfigLoader<GlobalConfig>()

export default config
