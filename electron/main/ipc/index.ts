import useCursor from './handle/cursor'
import usePath from './handle/path'
import useFs from './handle/fs'
// import useSqlite from './handle/node:sqlite'
import useSqlite from './handle/sqlite3'
import useWindow from './handle/window'
import i18n from './handle/i18n'
import useConfig from './handle/config'
import { createMenu } from '@ele/menu'
import useMenu from './handle/menu'
import useAppRegion from './handle/app-region'

const useHandle = () => {
  useAppRegion()
  useCursor()
  usePath()
  useFs()
  useSqlite()
  useWindow()
  const { updateAppMenu: updateMenu } = useMenu()
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
