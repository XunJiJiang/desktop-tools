import type { App } from 'vue'
import tooltip from './modules/tooltip'
import appRegion from './modules/app-region'
import contextmenu from './modules/contextmenu'
import focus from './modules/focus'

const directive = (app: App) => {
  app.directive('tooltip', tooltip)
  app.directive('app-region', appRegion)
  app.directive('contextmenu', contextmenu)
  app.directive('focus', focus)
}

export default directive
