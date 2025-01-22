import config from '../utils/config'
import { useCssVar } from '@apps/store/modules/useCssVar'

class ThemeError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ThemeError'
  }
}

export const isThemeError = (error: unknown): error is ThemeError => {
  return error instanceof ThemeError
}

const defaultThemesName = ['dark', 'light']

/** [space, name] */
let themesName: [string, string][] = []

/**
 * Get all themes name
 * @param reload reload themesName
 * @returns themesName
 */
export const getThemesName = async (reload = false) => {
  if (!(themesName.length === 0) && !reload) {
    return themesName
  }

  const themeDirPath = await window.ipcRenderer.invoke(
    'path:join',
    await window.ipcRenderer.invoke('path:get', 'appData'),
    'theme'
  )

  themesName = []
  const entries = await window.ipcRenderer.invoke('fs:readdir', themeDirPath, {
    withFileTypes: true
  })
  for (const entry of entries) {
    if (entry.isDirectory && entry.name !== 'default') {
      const path = await window.ipcRenderer.invoke(
        'path:join',
        themeDirPath,
        entry.name
      )
      const files = await window.ipcRenderer.invoke('fs:readdir', path, {
        withFileTypes: true
      })
      for (const file of files) {
        if (file.isFile && file.name.endsWith('.json')) {
          themesName.push([entry.name, file.name.slice(0, -5)])
        }
      }
    }
  }
  for (const name of defaultThemesName) {
    themesName.push(['default', name])
  }
  return themesName
}

/** 保存动态修改背景透明度的函数 */
let setBgTransparency: ((transparency: number | null | false) => void) | null =
  null

/**
 * Load a theme
 * @param name theme name
 * @param space theme space
 * @exports
 *   [space]:[name]
 *   [themeDirPath]/[space]/[name].json
 */
export const loadTheme = async (name: string, space: string) => {
  const cssVar = useCssVar()

  const themeDirPath = await window.ipcRenderer.invoke(
    'path:join',
    await window.ipcRenderer.invoke('path:get', 'appData'),
    'theme'
  )

  const fullPath = await window.ipcRenderer.invoke(
    'path:join',
    themeDirPath,
    space,
    name + '.json'
  )

  if (await hasTheme(name, space, fullPath)) {
    try {
      let theme = JSON.parse(
        await window.ipcRenderer.invoke('fs:readfile', fullPath, {
          encoding: 'utf-8'
        })
      ) as {
        [key: string]: string
      }
      if (space !== 'default') {
        const extendsTheme =
          theme['extends'] === undefined
            ? {}
            : theme['extends'] === 'default:light'
              ? JSON.parse(
                  await window.ipcRenderer.invoke('fs:resources', [
                    'default',
                    'theme',
                    'light.json'
                  ])
                )
              : JSON.parse(
                  await window.ipcRenderer.invoke('fs:resources', [
                    'default',
                    'theme',
                    'dark.json'
                  ])
                )
        theme = { ...extendsTheme, ...theme }
      }
      const transparency = (await config).value['bg-transparency']
      if (setBgTransparency) {
        ;(await config).remove('bg-transparency', setBgTransparency)
      }
      const alpha = checkTransparency(transparency)

      setBgTransparency = (transparency) => {
        if (transparency === null) {
          return
        }
        const alpha = checkTransparency(transparency)
        for (const [key, value] of Object.entries(theme)) {
          if (key.endsWith('tr-bg-color')) {
            document.documentElement.style.setProperty(
              `--${key}`,
              value + alpha
            )
            cssVar.setCssVar(key, value + alpha)
          }
        }
      }
      ;(await config).on('bg-transparency', setBgTransparency)

      for (const [key, value] of Object.entries(theme)) {
        if (key.endsWith('tr-bg-color')) {
          document.documentElement.style.setProperty(`--${key}`, value + alpha)
          cssVar.setCssVar(key, value + alpha)
        } else {
          document.documentElement.style.setProperty(`--${key}`, value)
          cssVar.setCssVar(key, value)
        }
      }
      config.then((c) => {
        c.update('theme', `${space}:${name}`)
      })
    } catch {
      throw new ThemeError(`Theme ${space}:${name} is invalid`)
    }
  } else {
    throw new ThemeError(`Theme ${space}:${name} not found`)
  }
}

/**
 * check the transparency is valid
 * @param transparency
 * @returns transparency in hex
 */
const checkTransparency = (
  transparency: number | false | undefined | null
): string => {
  if (
    typeof transparency === 'number' &&
    transparency >= 0 &&
    transparency <= 255
  ) {
    return transparency.toString(16).padStart(2, '0')
  } else if (transparency === false) {
    return 'ff'
  } else {
    config.then((c) => {
      c.update('bg-transparency', false)
    })
    return 'ff'
  }
}

/**
 * check the theme has existed in themeDirPath
 * @param name theme name
 * @param space theme space
 * @param fullPath theme fullPath (absolute to $APPDATA/themes/**)
 */
const hasTheme = async (name: string, space: string, fullPath: string) => {
  if (await window.ipcRenderer.invoke('fs:exists', fullPath)) {
    return true
  } else {
    if (space === 'default') {
      await loadDefaultTheme(name, fullPath)
      return true
    } else {
      return false
    }
  }
}

/**
 * Reload all default themes
 */
export const reloadDefaultThemes = async () => {
  const themeDirPath = await window.ipcRenderer.invoke(
    'path:join',
    await window.ipcRenderer.invoke('path:get', 'appData'),
    'theme'
  )

  await window.ipcRenderer.invoke(
    'fs:mkdir',
    await window.ipcRenderer.invoke('path:join', themeDirPath, 'default'),
    {
      recursive: true
    }
  )

  try {
    for (const name of defaultThemesName) {
      const theme = JSON.parse(
        await window.ipcRenderer.invoke('fs:resources', [
          'default',
          'theme',
          name + '.json'
        ])
      )

      await window.ipcRenderer.invoke(
        'fs:writefile',
        await window.ipcRenderer.invoke(
          'path:join',
          themeDirPath,
          'default',
          name + '.json'
        ),
        JSON.stringify(theme, null, 2)
      )
    }
  } catch (e) {
    if (isThemeError(e)) {
      throw e
    } else throw new ThemeError(`Theme default not found. ${e}`)
  }

  const theme = (await config).value.theme
  if (theme) {
    const [space, name] = theme.split(':')
    await loadTheme(name, space)
  }
}

/**
 * Load the default theme
 * @param name theme name
 * @param fullPath theme fullPath (absolute to $APPDATA/themes/**)
 */
const loadDefaultTheme = async (name: string, fullPath: string) => {
  const themeDirPath = await window.ipcRenderer.invoke(
    'path:join',
    await window.ipcRenderer.invoke('path:get', 'appData'),
    'theme'
  )

  await window.ipcRenderer.invoke(
    'fs:mkdir',
    await window.ipcRenderer.invoke('path:join', themeDirPath, 'default'),
    {
      recursive: true
    }
  )

  try {
    const resourcePath = await window.ipcRenderer.invoke(
      'fs:resource',
      'default',
      'theme',
      name + '.json'
    )
    const theme = JSON.parse(
      await window.ipcRenderer.invoke('fs:readfile', resourcePath, {
        encoding: 'utf-8'
      })
    )

    await window.ipcRenderer.invoke(
      'fs:writefile',
      fullPath,
      JSON.stringify(theme, null, 2),
      {
        encoding: 'utf-8'
      }
    )
  } catch (e) {
    if (isThemeError(e)) {
      throw e
    } else throw new ThemeError(`Theme default:${name} not found. ${e}`)
  }
}

/**
 * init themes on app start
 */
export const initThemes = async () => {
  const theme = (await config).value.theme
  try {
    if (theme) {
      const [space, name] = theme.split(':')
      await loadTheme(name, space)
    } else {
      await loadTheme('dark', 'default')
      ;(await config).update('theme', 'default:dark')
    }
  } catch (e) {
    if (isThemeError(e)) {
      console.error(e)
    }
  }
}

config.then((c) => {
  c.on('theme', async (theme) => {
    if (!theme) return
    const [space, name] = theme.split(':')
    await loadTheme(name, space)
  })
})
