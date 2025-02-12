import { resourcesPath } from '@ele/utils/resourcesPath'
import { app, ipcMain } from 'electron'
import { mkdir, readdir, readFile } from 'node:fs'
import { join, parse } from 'node:path'
import { singleRun } from '@/utils/singleRun'

const defLanguagesPath = join(resourcesPath(), 'languages')

const additionalLanguagesPath = join(app.getPath('userData'), 'languages')

console.log('defLanguagesPath:', defLanguagesPath)
console.log('additionalLanguagesPath:', additionalLanguagesPath)

const supportList = ['zh-CN', 'en-US', 'zh-TW', 'ja-JP']

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

type Lang = import('@/types/language').Lang

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
            resolve({} as Lang)
          }
          resolve(JSON.parse(data))
        }
      )
    }
  })
}

interface GetLanguage {
  (sync: false): Promise<Lang>
  (sync?: true): Lang | null
}

const useI18n = singleRun(
  (
    callback: (lang: Lang) => void = () => {}
  ): {
    onLanguageUpdated: (language?: string) => void
    getLanguage: GetLanguage
  } => {
    let local = ''
    let lang: Lang | null = null

    ipcMain.handle('i18n:available', async () => {
      return (await getAdditionalLanguagesList()).push(...supportList)
    })

    ipcMain.handle('i18n:load', async (_, local: string) => {
      return (lang = await getLanguage(local))
    })

    return {
      onLanguageUpdated: (language?: string) => {
        if (!language) return
        local = language
        getLanguage(local).then((_lang) => {
          callback(_lang)
          lang = _lang
        })
      },
      getLanguage: ((sync = true) => {
        if (sync) {
          return lang
        } else {
          return new Promise<Lang>((resolve) => {
            getLanguage(local).then((lang) => {
              resolve(lang)
            })
          })
        }
      }) as GetLanguage
    }
  }
)

export default useI18n
