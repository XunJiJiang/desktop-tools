import { createVNode, ref } from 'vue'
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
export const createMenuPopup = (
  menu: MenuItem[],
  onClick: (item: MenuItem, e: MouseEvent) => void,
  position?: {
    x: number
    y: number
  }
) => {
  const control = {} as Omit<ReturnType<typeof createBasePopup>, 'hide'> &
    MenuPopupExposed
  const childPopupRef = ref<MenuPopupExposed | null>(null)
  const c = createBasePopup(
    createVNode({
      setup: () => () =>
        createVNode(MenuPopup, {
          ref: childPopupRef,
          items: menu,
          onClick: (item: MenuItem, e: MouseEvent) => {
            onClick(item, e)
            control.hide(e)
          },
          createMenuPopup
        })
    }),
    {
      ...(position ?? {})
    }
  )
  control.hide = (e: MouseEvent) => {
    if (!childPopupRef.value) return true
    const allowHide = childPopupRef.value.hide(e)
    if (allowHide) {
      c.hide()
    }
    return allowHide
  }
  control.ref = c.ref
  control.show = c.show
  control.show()

  return control
}
