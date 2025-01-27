import { defineStore } from 'pinia'
import { shallowRef } from 'vue'
import config, {
  createConfigLoader,
  type ConfigHandler
} from '@apps/utils/config'
import { createHash } from '@apps/utils/createHash'
import ipc from '@apps/utils/ipc'
// import { asyncArrayEvery } from '@apps/utils/asyncArrayEvery'

const configDir = (async () => {
  const dir = await ipc.invoke('path:get', 'userData')
  return await ipc.invoke('path:join', dir, 'config', 'workspace')
})()

const workspaceConfig = shallowRef<ConfigHandler<WorkspaceConfig> | null>()

// TODO: Define the PanelConfig type
type PanelConfig = {
  show: boolean
}

export type WorkspaceConfig = {
  type: 'files' | 'dir' | 'temp'
  dir: string | null
  // 当 type 为 files 时, open-file-paths 为文件路径数组
  // 当 type 为 dir 时, open-file-path 为打开的文件的路径
  'open-file-path': string[]
  'title-bar': {
    'action-bar': {
      'left-panel': PanelConfig
      'layout-panel': PanelConfig
      'right-panel': PanelConfig
    }
  }
}

export type OpenData = {
  paths: string[]
  type: 'files' | 'dir' | 'temp' | 'never'
  workspaceConfigPath: string
}

const openData: OpenData = {
  paths: [],
  type: 'never',
  workspaceConfigPath: '[workspace:temp]'
}

export const setOpenData = async (paths: string[], type: OpenData['type']) => {
  openData.paths = paths
  openData.type = type
  const hash = createHash(paths.join('-'))
  const workspaceConfigPath = await ipc.invoke(
    'path:join',
    await configDir,
    hash
  )
  openData.workspaceConfigPath = workspaceConfigPath
  ipc.send('workspace:change', openData.workspaceConfigPath)
  console.log(openData)
  if (workspaceConfig.value) {
    workspaceConfig.value.close()
    workspaceConfig.value =
      await createConfigLoader<WorkspaceConfig>(workspaceConfigPath)
    if (!workspaceConfig.value?.value?.type) {
      workspaceConfig.value?.update(
        '[update:all]',
        createDefaultWorkspaceConfig(openData)
      )
    }
  }
}

const createDefaultWorkspaceConfig = (openData: OpenData): WorkspaceConfig => {
  return {
    type: openData.type === 'never' ? 'temp' : openData.type,
    dir: openData.type === 'dir' ? openData.paths[0] : null,
    'open-file-path': openData.type === 'dir' ? [] : [...openData.paths],
    'title-bar': {
      'action-bar': {
        'left-panel': {
          show: false
        },
        'layout-panel': {
          show: false
        },
        'right-panel': {
          show: false
        }
      }
    }
  }
}

/** 临时配置文件标识 */
const tempConfigPath = '[workspace:temp]'

config.then(async (c) => {
  // #region 加载上次的工作区 start

  const lastConfig = c.value.workspace?.path ?? ''

  try {
    const isExist =
      (await ipc.invoke('fs:exists', lastConfig)) &&
      (await ipc.invoke('fs:stat', lastConfig)).isDirectory
    if (isExist) {
      workspaceConfig.value =
        await createConfigLoader<WorkspaceConfig>(lastConfig)
      openData.workspaceConfigPath = lastConfig
    } else {
      console.log('isExist: not exist')
      workspaceConfig.value = await createConfigLoader<WorkspaceConfig>(
        await ipc.invoke('path:join', await configDir, '__temp__'),
        'temp-' + (await ipc.invoke('window:webContent:id')) + '.json'
      )
      openData.workspaceConfigPath = tempConfigPath
      // TODO: 提示 找不到配置文件
    }
    if (lastConfig === tempConfigPath) {
      openData.workspaceConfigPath = tempConfigPath
      workspaceConfig.value?.update(
        '[update:all]',
        createDefaultWorkspaceConfig(openData)
      )
    }
  } catch {
    console.log('catch: not exist')
    openData.workspaceConfigPath = tempConfigPath
    workspaceConfig.value = await createConfigLoader<WorkspaceConfig>(
      await ipc.invoke('path:join', await configDir, '__temp__'),
      'temp-' + (await ipc.invoke('window:webContent:id')) + '.json'
    )
    // TODO: 提示 找不到配置文件
  } finally {
    // 在第一个窗口启动时, 读取上次的最后一个窗口的工作区配置
    // 之后的窗口都使用临时配置, 除非打开了一个新的工作区
    c.update('workspace.path', tempConfigPath)

    ipc.send('workspace:change', openData.workspaceConfigPath)
  }

  // #endregion 加载上次的工作区 end
})

const closeWorkspace = async () => {
  if (workspaceConfig.value) {
    workspaceConfig.value.close()
    workspaceConfig.value = null
  }
  openData.paths = []
  openData.type = 'never'
  openData.workspaceConfigPath = tempConfigPath
}

export const useWorkspace = defineStore('workspace', () => {
  return {
    workspaceConfig,
    closeWorkspace
  }
})
