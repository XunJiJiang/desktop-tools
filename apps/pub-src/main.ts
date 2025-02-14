import { createApp as createVueApp } from 'vue'
import i18n from '@apps/i18n'
import { pinia } from '@apps/store'
import directive from '@apps/directive'
import { initThemes } from '@apps/theme'
import { useStyle } from '@apps/style'
// import router from './router'

export const createApp: typeof createVueApp = (App) => {
  const app = createVueApp(App)
  app.use(i18n)
  app.use(pinia)
  app.use(directive)
  // app.use(router)
  app.mount('#app')

  useStyle({})
  initThemes()

  return app
}
