import { Menu } from 'electron'
import { createAppMenu } from './template'

type Lang = import('../../../types/language').Lang

export const createMenu = (lang: Lang) => {
  const menu = createAppMenu(lang)
  console.log('template: create')
  Menu.setApplicationMenu(menu)
}
