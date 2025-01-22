import { defineStore } from 'pinia'
// import { appConfigDir, join } from '@tauri-apps/api/path'
// import { getCurrentWebview } from '@tauri-apps/api/webview'
// import { TauriEvent } from '@tauri-apps/api/event'
// import { stat, exists } from '@tauri-apps/plugin-fs'
import { shallowRef } from 'vue'
import config, {
  createConfigLoader,
  type ConfigHandler
} from '@apps/utils/config'
import { createHash } from '@apps/utils/createHash'
// import { asyncArrayEvery } from '@apps/utils/asyncArrayEvery'

const configDir = (async () => {
  const dir = await window.ipcRenderer.invoke('path:get', 'userData')
  return await window.ipcRenderer.invoke(
    'path:join',
    dir,
    'config',
    'workspace'
  )
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
}

const openData: OpenData = {
  paths: [],
  type: 'never'
}

export const setOpenData = (paths: string[], type: OpenData['type']) => {
  openData.paths = paths
  openData.type = type
  const hash = createHash(paths.join('-'))
  console.log(openData)
  config.then(async (c) => {
    c.update('workspace', {
      path: await window.ipcRenderer.invoke('path:join', await configDir, hash)
    })
  })
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
  const lastConfig = c.value.workspace?.path ?? ''

  try {
    const isExist =
      (await window.ipcRenderer.invoke('fs:exists', lastConfig)) &&
      (await window.ipcRenderer.invoke('fs:stat', lastConfig)).isDirectory
    if (isExist) {
      workspaceConfig.value =
        await createConfigLoader<WorkspaceConfig>(lastConfig)
    } else {
      console.log('not exist')
      c.update('workspace.path', tempConfigPath)
      workspaceConfig.value = await createConfigLoader<WorkspaceConfig>(
        await window.ipcRenderer.invoke(
          'path:join',
          await configDir,
          '__temp__'
        )
      )
      // TODO: 提示 找不到配置文件
    }
    if (lastConfig === tempConfigPath) {
      workspaceConfig.value?.update(
        '[update:all]',
        createDefaultWorkspaceConfig(openData)
      )
    }
  } catch {
    console.log('not exist')
    c.update('workspace.path', tempConfigPath)
    workspaceConfig.value = await createConfigLoader<WorkspaceConfig>(
      await window.ipcRenderer.invoke('path:join', await configDir, '__temp__')
    )
    // TODO: 提示 找不到配置文件
  }

  c.on('workspace', async (globalWorkspaceConfig) => {
    if (openData.type === 'never') {
      return
    }
    workspaceConfig.value?.close()
    if (globalWorkspaceConfig.path) {
      workspaceConfig.value = await createConfigLoader<WorkspaceConfig>(
        globalWorkspaceConfig.path
      )
      if (!workspaceConfig.value?.value?.type) {
        workspaceConfig.value?.update(
          '[update:all]',
          createDefaultWorkspaceConfig(openData)
        )
      }
    } else if (globalWorkspaceConfig.path === null) {
      workspaceConfig.value = null
    }
  })
})

const closeWorkspace = async () => {
  config.then((c) => {
    c.update('workspace', {
      path: null
    })
  })
}

export const useWorkspace = defineStore('workspace', () => {
  return {
    workspaceConfig,
    closeWorkspace
  }
})
