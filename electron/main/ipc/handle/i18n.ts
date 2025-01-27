import { resourcesPath } from '@ele/utils/resourcesPath'
import { app, ipcMain } from 'electron'
import { mkdir, readdir, readFile } from 'node:fs'
import { join, parse } from 'node:path'

const defLanguagesPath = join(resourcesPath(), 'languages')

const additionalLanguagesPath = join(app.getPath('appData'), 'languages')

const supportList = ['zh', 'en', 'tw', 'ja']

const getAdditionalLanguagesList = async () => {
  return new Promise<string[]>((resolve) => {
    readdir(additionalLanguagesPath, (err, files) => {
      if (err) {
        mkdir(additionalLanguagesPath, (err) => {
          if (err) {
            console.error('Error creating additional languages directory:', err)
          }
        })
        resolve([])
      }
      resolve(files.map((file) => parse(file).name))
    })
  })
}

type Lang = import('../../../../types/language').Lang

const getLanguage = async (lang: string) => {
  return new Promise<Lang>((resolve) => {
    if (supportList.includes(lang)) {
      readFile(join(defLanguagesPath, `${lang}.json`), 'utf-8', (err, data) => {
        if (err) {
          console.error('Error reading default language file:', err)
        }
        resolve(JSON.parse(data))
      })
    } else {
      readFile(
        join(additionalLanguagesPath, `${lang}.json`),
        'utf-8',
        (err, data) => {
          if (err) {
            console.error('Error reading additional language file:', err)
          }
          resolve(JSON.parse(data))
        }
      )
    }
  })
}

const useI18n = (callback: (lang: Lang) => void) => {
  let local = ''

  ipcMain.handle('i18n:available', async () => {
    return (await getAdditionalLanguagesList()).push(...supportList)
  })

  ipcMain.handle('i18n:load', async (_, lang: string) => {
    return await getLanguage(lang)
  })

  return {
    onLanguageUpdated: (language?: string) => {
      if (!language) return
      local = language
      getLanguage(local).then((lang) => {
        callback(lang)
      })
    }
  }
}

export default useI18n
