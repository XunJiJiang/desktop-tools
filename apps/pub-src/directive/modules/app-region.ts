import type { Directive } from 'vue'
import ipc from '@apps/utils/ipc'

const drag = (e: MouseEvent, el: HTMLElement) => {
  e.preventDefault()
  e.stopPropagation()
  e.stopImmediatePropagation()
  if (e.target !== el || e.button !== 0) return
  ipc.send('app-region:drag', { x: e.clientX, y: e.clientY })
}

const drop = (e: MouseEvent) => {
  e.preventDefault()
  e.stopPropagation()
  e.stopImmediatePropagation()
  ipc.send('app-region:drop')
}

const map = new Map<HTMLElement, { drag: (e: MouseEvent) => void }>()

export default {
  name: 'app-region',
  mounted(el) {
    map.set(el, { drag: (e) => drag(e, el) })
    el.addEventListener('drag', map.get(el)!.drag)
    window.addEventListener('drop', drop)
    el.addEventListener('mousedown', map.get(el)!.drag)
    window.addEventListener('mouseup', drop)
  },
  unmounted(el) {
    el.removeEventListener('drag', map.get(el)!.drag)
    window.removeEventListener('drop', drop)
    el.removeEventListener('mousedown', map.get(el)!.drag)
    window.removeEventListener('mouseup', drop)
    map.delete(el)
  }
} as Directive<HTMLElement>
