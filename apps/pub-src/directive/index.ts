import type { App } from 'vue'
import tooltip from './modules/tooltip'
import appRegion from './modules/app-region'

const directive = (app: App) => {
  app.directive('tooltip', tooltip)
  app.directive('app-region', appRegion)
}

export default directive
