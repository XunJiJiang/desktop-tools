import usePath from './handle/path'
import useFs from './handle/fs'
// import useSqlite from './handle/node:sqlite'
import useSqlite from './handle/sqlite3'
import useWindow from './handle/window'
import i18n from './handle/i18n'
import useConfig from './handle/config'
import { createMenu } from '@ele/menu'
import useMenu from './handle/menu'
import useCommand from '@ele/store/modules/appCommand'

const useHandle = () => {
  usePath()
  useFs()
  useSqlite()
  useWindow()
  useCommand()
  const { updateMenu } = useMenu()
  const { onLanguageUpdated } = i18n((lang) => {
    createMenu(lang)
    updateMenu(lang)
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
