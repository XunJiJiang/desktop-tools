import type { Directive } from 'vue'

export default {
  name: 'focus',
  mounted(el) {
    el.focus()
  }
} as Directive
