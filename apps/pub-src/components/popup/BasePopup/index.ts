import BasePopup from './BasePopup.vue'
import {
  createVNode,
  ref,
  isRef,
  render,
  type Ref,
  computed,
  shallowReactive,
  type VNode,
  watch
} from 'vue'
import { useMountElement } from '@apps/hooks/useMountElement'
import { invoke } from '@apps/utils/ipc'

// TODO: 计划: 加自动偏移确保不超出屏幕

type Position = {
  x: number | Ref<number>
  y: number | Ref<number>
}

type Size = {
  width: number | Ref<number>
  height: number | Ref<number>
}

let popupId = 0

export const createBasePopup = (
  slot: VNode,
  opt: Partial<Size & Position> & {
    zIndex?: number
  }
) => {
  const {
    x: baseX,
    y: baseY,
    width: baseWidth,
    height: baseHeight,
    zIndex = 0
  } = opt
  const visible = ref(false)
  const key = `base-popup-${popupId++}`

  let root: HTMLDivElement | null = null

  const [baseXRef, baseYRef, baseWidthRef, baseHeightRef] = ((
    baseX,
    baseY,
    baseWidth,
    baseHeight
  ) => {
    return [
      isRef(baseX) ? computed(() => baseX.value) : ref(baseX ?? null),
      isRef(baseY) ? computed(() => baseY.value) : ref(baseY ?? null),
      isRef(baseWidth)
        ? computed(() => baseWidth.value)
        : ref(baseWidth ?? null),
      isRef(baseHeight)
        ? computed(() => baseHeight.value)
        : ref(baseHeight ?? null)
    ]
  })(baseX, baseY, baseWidth, baseHeight)

  const [showXRef, showYRef, showWidthRef, showHeightRef] = new Array<
    Ref<number | null>
  >(4).fill(ref(0))

  const cursorX = ref(0)
  const cursorY = ref(0)

  const [x, y, width, height] = ((
    [baseXRef, baseYRef, BaseWidthRef, BaseHeightRef],
    [showXRef, showYRef, showWidthRef, showHeightRef]
  ) => {
    return [
      computed(() => showXRef.value ?? baseXRef.value ?? cursorX.value),
      computed(() => showYRef.value ?? baseYRef.value ?? cursorY.value),
      computed(() => showWidthRef.value ?? BaseWidthRef.value),
      computed(() => showHeightRef.value ?? BaseHeightRef.value)
    ]
  })(
    [baseXRef, baseYRef, baseWidthRef, baseHeightRef] as const,
    [showXRef, showYRef, showWidthRef, showHeightRef] as const
  )

  let instance: VNode | null = null

  const res = shallowReactive<{
    show: (opt?: Partial<Size & Position>) => Promise<void>
    hide: () => void
    ref: HTMLElement | null
  }>({
    show: async (opt: Partial<Size & Position> = {}) => {
      if (instance && visible.value) return

      const res = await invoke('cursor:getPosition')

      if (res.inWindow) {
        cursorX.value = res.x
        cursorY.value = res.y
      } else {
        cursorX.value = 0
        cursorY.value = 0
      }

      const { x: showX, y: showY, width: showWidth, height: showHeight } = opt
      showXRef.value = isRef(showX) ? showX.value : (showX ?? null)
      showYRef.value = isRef(showY) ? showY.value : (showY ?? null)

      showWidthRef.value = isRef(showWidth)
        ? showWidth.value
        : (showWidth ?? null)
      showHeightRef.value = isRef(showHeight)
        ? showHeight.value
        : (showHeight ?? null)

      visible.value = true
    },
    hide: () => {
      visible.value = false
    },
    ref: null
  })

  const popupRef = ref<{
    ref: HTMLElement | null
  }>()

  watch(
    popupRef,
    (v) => {
      res.ref = v?.ref ?? null
    },
    { immediate: true }
  )

  watch(
    [x, y, width, height, visible],
    ([x, y, width, height, _visible]) => {
      if (_visible) {
        if (!root) {
          root = useMountElement('base-popup-root__' + key, {
            zIndex: 9998
          })
        }
        instance = createVNode(
          {
            setup: () => () =>
              createVNode(
                BasePopup,
                {
                  ref: popupRef,
                  // TODO: 需要进行位置计算, 防止超出屏幕
                  x,
                  y,
                  width,
                  height,
                  zIndex,
                  visible: _visible,
                  'onUpdate:visible': (v: boolean) => {
                    visible.value = v
                  },
                  key
                },
                {
                  default: () => slot
                }
              )
          },
          {
            key
          }
        )
        render(instance, root)
      } else {
        if (root) {
          render(null, root)
          root.remove()
          root = null
        }
      }
    },
    { immediate: true }
  )

  return res
}
