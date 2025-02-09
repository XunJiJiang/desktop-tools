import type { App } from "vue"
import tooltip from "./modules/tooltip"

const directive = (app: App) => {
  app.directive("tooltip", tooltip)
}

export default directive
