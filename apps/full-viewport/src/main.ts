import './main.scss'

import { createApp } from '@apps/main'

import App from './App.vue'
import { reloadDefaultThemes } from '@apps/theme'

// TODO: 此处仅开发环境下使用, 用于每次刷新页面时重新转存默认主题
reloadDefaultThemes()

createApp(App)
