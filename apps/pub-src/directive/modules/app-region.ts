import type { Directive } from 'vue'
import ipc from '@apps/utils/ipc'

const drag = (e: MouseEvent) => {
  e.preventDefault()
  e.stopPropagation()
  e.stopImmediatePropagation()
  ipc.send('app-region:drag', { x: e.clientX, y: e.clientY })
}

const drop = (e: MouseEvent) => {
  e.preventDefault()
  e.stopPropagation()
  e.stopImmediatePropagation()
  ipc.send('app-region:drop')
}

export default {
  name: 'app-region',
  mounted(el) {
    el.addEventListener('drag', drag)
    window.addEventListener('drop', drop)
    el.addEventListener('mousedown', drag)
    window.addEventListener('mouseup', drop)
  },
  unmounted(el) {
    el.removeEventListener('drag', drag)
    window.removeEventListener('drop', drop)
    el.removeEventListener('mousedown', drag)
    window.removeEventListener('mouseup', drop)
  }
} as Directive<HTMLElement>
