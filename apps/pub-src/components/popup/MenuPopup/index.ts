import { createVNode, ref, type Ref } from 'vue'
import { createBasePopup } from '@comp/popup/BasePopup'
import MenuPopup from './MenuPopup.vue'

export type MenuPopupExposed = {
  hide: (e: MouseEvent) => boolean
}
export type MenuItem = {
  label: string
  type?:
    | 'normal'
    | 'separator'
    | 'submenu'
    | 'checkbox'
    | 'radio'
    | 'remaining'
    | 'all remaining'
  submenu?: MenuItem[]
  command?: string
}

const retRefNumOrVoid = (num: Ref<number | null>): Ref<number> | undefined => {
  if (typeof num.value === 'number') return num as Ref<number>
}

export const createMenuPopup = (
  menu: MenuItem[],
  onChoose: (item: MenuItem, e: MouseEvent) => void,
  beyondViewport: (
    width: number,
    height: number
  ) => {
    x: number
    y: number
  } = () => ({ x: 0, y: 0 }),
  position?: {
    x: number
    y: number
  },
  delay = 0
) => {
  const control = {} as Omit<ReturnType<typeof createBasePopup>, 'hide'> &
    MenuPopupExposed
  const childPopupRef = ref<MenuPopupExposed | null>(null)
  const x = ref(position?.x ?? null)
  const y = ref(position?.y ?? null)
  const c = createBasePopup(
    createVNode({
      setup: () => () =>
        createVNode(MenuPopup, {
          ref: childPopupRef,
          items: menu,
          onChoose: (item: MenuItem, e: MouseEvent) => {
            onChoose(item, e)
            control.hide(e)
          },
          createMenuPopup
        })
    }),
    {
      x: retRefNumOrVoid(x),
      y: retRefNumOrVoid(y)
    },
    ({ width, height }) => {
      const { x: _x, y: _y } = beyondViewport(width, height)
      x.value = _x
      y.value = _y
    }
  )
  let timeout: number | null = null
  control.hide = (e: MouseEvent) => {
    if (!childPopupRef.value || timeout) {
      if (timeout) clearTimeout(timeout)
      return true
    }
    const allowHide = childPopupRef.value.hide(e)
    if (allowHide) {
      c.hide()
    }
    return allowHide
  }
  control.ref = c.ref
  control.show = c.show

  timeout = setTimeout(() => {
    control.show()
    timeout = null
  }, delay)

  return control
}
