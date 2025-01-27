import usePath from './handle/path'
import useFs from './handle/fs'
// import useSqlite from './handle/node:sqlite'
import useSqlite from './handle/sqlite3'
import useWindow from './handle/window'
import i18n from './handle/i18n'
import useConfig from './handle/config'
import { createMenu } from '@ele/menu'

const useHandle = () => {
  usePath()
  useFs()
  useSqlite()
  useWindow()
  const { onLanguageUpdated } = i18n((lang) => {
    createMenu(lang)
  })
  useConfig({
    onUpdated: (config) => {
      onLanguageUpdated(config['language'])
    }
  })
}

const useIpc = () => {
  useHandle()
}

export default useIpc
