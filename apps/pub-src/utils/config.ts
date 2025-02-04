/* eslint-disable @typescript-eslint/no-explicit-any */
import { reactive, watch } from 'vue'
import ipc from '@apps/utils/ipc'
import type { DeepPartial } from '@/types/utils/DeepPartial'

type ConfigValue = string | number | boolean | object | null

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

type Opt = {
  /** 仅当由当前视图触发的配置变化触发 */
  onConfigChange?: (config: any) => void
  isGlobal?: boolean
}

/**
 * 创建配置加载器
 * @param configPath 配置文件路径
 * @param configId 配置文件id
 * @param delay 写入配置文件的延迟时间
 * @param opt 配置项
 * @returns
 */
export const createConfigLoader = async <T = any>(
  configPath: string,
  configId?: string,
  delay = 1000,
  opt?: Opt
) => {
  return await loadConfig<T>(configPath, configId ?? 'config.json', delay, opt)
}

const loadConfig = async <T>(
  appConfigPath: string,
  configId: string,
  delay: number,
  opt: Opt = {}
): Promise<ConfigHandler<T>> => {
  const { onConfigChange = () => {}, isGlobal = false } = opt
  /** 当前视图是否触发config变化, 仅当为true时触发onConfigChange和修改配置文件 */
  let isCurrentViewChange = false
  let config
  const appFullConfigId = await ipc.invoke('path:join', appConfigPath, configId)
  if (await ipc.invoke('fs:exists', appFullConfigId)) {
    config = reactive(
      JSON.parse(
        await ipc.invoke('fs:readfile', appFullConfigId, {
          encoding: 'utf-8'
        })
      )
    )
  } else {
    const defaultConfig = isGlobal
      ? JSON.parse(await ipc.invoke('config:default'))
      : {}
    await ipc.invoke('fs:mkdir', appConfigPath, {
      recursive: true
    })
    ipc.invoke(
      'fs:writefile',
      appFullConfigId,
      JSON.stringify(defaultConfig, null, 2),
      {
        encoding: 'utf-8'
      }
    )
    onConfigChange(config)
    isCurrentViewChange = false
    config = reactive(defaultConfig)
  }

  const eventMap = new Map<string, Set<(config: any) => void>>()
  const updateAllCallbacks = new Set<(config: any) => void>()

  let timeout: number | null = null

  let oldConfig = JSON.stringify(config)

  const distribute = (v: typeof config) => {
    const ov = oldConfig ? JSON.parse(oldConfig) : {}
    oldConfig = JSON.stringify(v)
    /** 变化了的路径和对应的新值 */
    const map = new Map<string, any>()
    /** 变化了的路径和全部父路径 */
    const set = new Set<string>()
    for (const [key, callbacks] of [...eventMap.entries()].sort(
      (a, b) => b[0].split('.').length - a[0].split('.').length
    )) {
      const cv = getValue(v, key)
      // set 包含当前路径, 说明当前路径的子路径存在变化, 直接触发回调
      if (set.has(key)) {
        callbacks.forEach((callback) => {
          callback(cv)
        })
        continue
      }
      if (hasChange(cv, getValue(ov, key))) {
        // 当前路径的值发生变化
        map.set(key, cv)
        const pathArray = resolvePath(key)
        // 将当前路径的全部父路径加入 set
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
      if (!v) return
      result.value = JSON.parse(JSON.stringify(v))
      distribute(v)
    },
    {
      deep: true
    }
  )

  const updateConfigFile = (c: typeof config) => {
    if (!isCurrentViewChange) {
      return
    }
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => {
      ipc.invoke('fs:writefile', appFullConfigId, JSON.stringify(c, null, 2))
      onConfigChange(config)
      isCurrentViewChange = false
      timeout = null
    }, delay)
  }

  const handles = async () => {
    if (!isCurrentViewChange) {
      return
    }
    const value = {
      config: JSON.parse(JSON.stringify(config))
    }
    if (timeout) {
      ipc.invoke(
        'fs:writefile',
        appFullConfigId,
        JSON.stringify(value.config, null, 2)
      )
      onConfigChange(value.config)
      isCurrentViewChange = false
    }
  }

  const configUpdate = (e: Event | null, c: typeof config) => {
    if (e && !isGlobal) {
      return
    }

    for (const key in c as T) {
      const _val = (c as T)[key]
      config[key] = _val ? JSON.parse(JSON.stringify((c as T)[key])) : _val
    }
  }

  ipc.on('window:close', handles)
  ipc.on('config:global:update', configUpdate)

  const result = {
    value,
    update<P extends string>(
      path: P,
      value: P extends '[update:all]'
        ? Record<string, ConfigValue>
        : ConfigValue
    ) {
      isCurrentViewChange = true
      if (path === '[update:all]') {
        configUpdate(null, value as T)
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
      ipc.off('window:close', handles)
      ipc.off('config:global:update', configUpdate)
    }
  } as ConfigHandler<T>

  result.on<typeof config>('[update:all]', updateConfigFile)

  return result
}

export type GlobalConfig = {
  language: null | string
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
const config = (async () =>
  await createConfigLoader<GlobalConfig>(
    await ipc.invoke(
      'path:join',
      await ipc.invoke('path:get', 'userData'),
      'config'
    ),
    'config.json',
    1000,
    {
      isGlobal: true,
      onConfigChange: (config) => {
        ipc.send(
          'config:global:update',
          config ? JSON.parse(JSON.stringify(config)) : {}
        )
      }
    }
  ))()

config.then((c) => {
  ipc.send('config:global:update', c.value)
})

export default config
