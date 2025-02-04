import { Menu } from 'electron'
import { createAppMenu } from './template'
import useConfig from '@ele/ipc/handle/config'

type Lang = import('@/types/language').Lang

/** 创建应用菜单(用于macOS顶部显示和菜单快捷键) */
export const createMenu = async (lang: Lang) => {
  const { getConfig } = useConfig()
  const menu = createAppMenu(lang, await getConfig())
  console.log('template: create')
  Menu.setApplicationMenu(menu)
}
