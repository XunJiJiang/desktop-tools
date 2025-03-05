import ipc from '@apps/utils/ipc'
import { windowEvent } from '@apps/utils/windowEvent'
import { type MenuItem } from '@/apps/pub-src/components/popup/MenuPopup'
import { isMac } from '@apps/utils/userAgent'
import { createMenuPopup } from '@/apps/pub-src/components/popup/MenuPopup'

import { ref, watch, type Directive } from 'vue'

const map = new Map<HTMLElement, (e: MouseEvent) => void>()

const isFocused = ref(true)
ipc.on('window:blur', () => {
  isFocused.value = false
})
ipc.on('window:focus', () => {
  isFocused.value = true
})

let unListener = () => {}
let control: ReturnType<typeof createMenuPopup> | null = null
const hidePopup = (e?: MouseEvent) => {
  const hasHide = control?.hide(e ?? new MouseEvent(''))
  if (hasHide) {
    control = null
    unListener()
  }
}

watch(isFocused, (v) => {
  if (!v) {
    hidePopup()
  }
})

export default {
  name: 'contextmenu',
  mounted(el, binding) {
    map.set(el, (e) => {
      e.preventDefault()
      if (!isMac) {
        ipc.send('menu:context', {
          items: binding.value
        })
      } else {
        if (control) {
          hidePopup()
          control = null
        }
        control = createMenuPopup(binding.value, (item) => {
          ipc.send('command:parseAndRun', item.command ?? '')
          hidePopup()
        })
        unListener = windowEvent('mousedown', (e) => {
          hidePopup(e)
        })
      }
    })
    el.addEventListener('contextmenu', map.get(el)!)
  },
  unmounted(el) {
    el.removeEventListener('contextmenu', map.get(el)!)
    map.delete(el)
  }
} as Directive<HTMLElement, MenuItem[]>
