import './main.scss'

import { createApp } from 'vue'
import i18n from '@apps/i18n'

import App from './App.vue'
import { initThemes, reloadDefaultThemes } from '@apps/theme'
import { pinia } from '@apps/store'
import directive from '@apps/directive'
// import router from './router'

// TODO: 此处仅开发环境下使用, 用于每次刷新页面时重新转存默认主题
reloadDefaultThemes()

const app = createApp(App)

app.use(i18n)
app.use(pinia)
app.use(directive)
initThemes()

// app.use(router)

app.mount('#app')
