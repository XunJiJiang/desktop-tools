import './main.scss'

import { createApp } from 'vue'

import App from './App.vue'
import { initThemes } from '@apps/theme'
import { pinia } from '@apps/store'
// import router from './router'

const app = createApp(App)

app.use(pinia)
// app.use(router)

initThemes()

app.mount('#app')
