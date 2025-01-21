import './main.scss'

import { createApp } from 'vue'
import i18n from '@apps/i18n'

import App from './App.vue'
import { initThemes, reloadDefaultThemes } from '@apps/theme'
import { pinia } from '@apps/store'
// import router from './router'

reloadDefaultThemes()

const app = createApp(App)

app.use(i18n)
app.use(pinia)
initThemes()

// app.use(router)

app.mount('#app')
