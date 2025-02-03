import { Menu } from 'electron'
import { createAppMenu } from './template'

type Lang = import('@/types/language').Lang

/** 创建应用菜单(用于macOS顶部显示和菜单快捷键) */
export const createMenu = (lang: Lang) => {
  const menu = createAppMenu(lang)
  console.log('template: create')
  Menu.setApplicationMenu(menu)
}
