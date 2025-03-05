<script lang="ts">
import { createMenuPopup, type MenuItem } from '@comp/popup/MenuPopup'
import { windowEvent } from '@apps/utils/windowEvent'
import ipc from '@apps/utils/ipc'
export type { MenuItem }
export type MenuButtonProps = {
  item: MenuItem
  /** 仅当上次鼠标聚焦在menu的任意项时, 处理鼠标hover */
  readyToFocus: boolean
  /** 是否可以在鼠标移入时显示, 当值为false时，只能在鼠标点击时显示 */
  hoverShow: boolean
}
export type MountEvent = {
  width: number
  height: number
  item: MenuItem
}
export type MenuButtonEvents = {
  onMounted: [event: MountEvent]
  show: [item: MenuItem]
  hide: [item: MenuItem]
  click: [item: MenuItem]
}
</script>

<script lang="ts" setup>
import { useStyle } from '@apps/style'
import {
  computed,
  onMounted,
  onUnmounted,
  ref,
  useTemplateRef,
  watch
} from 'vue'
import Icon from '@comp/IconFont/IconFont.vue'
import { useCssVar } from '@apps/store/modules/useCssVar'

const { item, readyToFocus, hoverShow } = defineProps<MenuButtonProps>()
const emit = defineEmits<MenuButtonEvents>()
const isFocused = ref(true)

let unListenFns: Promise<[Ipc.UnListen, Ipc.UnListen]>
onMounted(() => {
  unListenFns = Promise.all([
    ipc.on('window:blur', () => {
      isFocused.value = false
    }),
    ipc.on('window:focus', () => {
      isFocused.value = true
    })
  ])
})
onUnmounted(() => {
  unListenFns.then(([unListen1, unListen2]) => {
    unListen1()
    unListen2()
  })
})
const cssVar = useCssVar()
const style = useStyle()
const fontFamily = computed(() => style.style['font-family'])
const menuBarRef = useTemplateRef<HTMLDivElement>('menu-bar-ref')
const control = ref<ReturnType<typeof createMenuPopup> | null>(null)
const hidePopup = (e?: MouseEvent) => {
  const hasHide = control.value?.hide(e ?? new MouseEvent(''))
  if (hasHide) {
    emit('hide', item)
    control.value = null
    unListener()
  }
}

watch(isFocused, (v) => {
  if (!v) {
    hidePopup()
  }
})

const OVERLAP = 3

let unListener = () => {}
const openMenuPopup = () => {
  if (control.value) return

  control.value = createMenuPopup(
    item.submenu ?? [],
    (item) => {
      emit('click', item)
      hidePopup()
    },
    () => {
      return {
        x: (menuBarRef.value?.getBoundingClientRect().x ?? 0) - OVERLAP,
        y:
          (menuBarRef.value?.getBoundingClientRect().y ?? 0) +
          (menuBarRef.value?.offsetHeight ?? 0)
      }
    },
    {
      x: (menuBarRef.value?.getBoundingClientRect().x ?? 0) - OVERLAP,
      y:
        (menuBarRef.value?.getBoundingClientRect().y ?? 0) +
        (menuBarRef.value?.offsetHeight ?? 0)
    }
  )
  emit('show', item)
  unListener = windowEvent('mousedown', (e) => {
    hidePopup(e)
  })
}
const switchMenuPopup = () => {
  if (control.value || !hoverShow) return
  openMenuPopup()
}
onMounted(() => {
  if (!menuBarRef.value) return
  const { width, height } = menuBarRef.value?.getBoundingClientRect()
  emit('onMounted', { width, height, item })
})
const isIcon = computed(
  () => item.type === 'remaining' || item.type === 'all remaining'
)
const iconName = computed(() => {
  if (item.type === 'remaining') {
    return 'ellipsis'
  } else if (item.type === 'all remaining') {
    return 'menu'
  }
  return ''
})
const iconColor = computed(() => cssVar.vars['menu-btn-font'])
defineExpose({
  hide: () => {
    control.value?.hide(new MouseEvent(''))
    control.value = null
    unListener()
  }
})
</script>

<template>
  <div
    ref="menu-bar-ref"
    :class="{
      'menu-btn': true,
      'ready-to-focus': readyToFocus,
      active: control
    }"
  >
    <button v-if="isIcon" @click="openMenuPopup" @mouseenter="switchMenuPopup">
      <Icon :name="iconName" :size="16" :color="iconColor" />
    </button>
    <button v-else @click="openMenuPopup" @mouseenter="switchMenuPopup">
      {{ item.label }}
    </button>
  </div>
</template>

<style scoped lang="scss">
@use '@apps/theme/base/var.scss' as *;
// 按钮之间的重叠部分(px)
$overlap: 3px;

.menu-btn {
  position: relative;

  button {
    background-color: transparent;
    border: none;
    box-shadow: none;
    color: var(--menu-btn-font, $menu-btn-font);
    cursor: pointer;
    font-size: 12px;
    font-family: v-bind(fontFamily);
    height: 32px;
    line-height: 32px;
    padding: 0 10px;
    text-align: center;
    user-select: none;
    white-space: nowrap;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: calc(-#{$overlap});
    box-sizing: border-box;
    padding: 0 #{$overlap};
    margin-top: 4px;
    height: calc(100% - 8px);
    width: calc(100% + #{$overlap} * 2);
    border-radius: 4px;
    z-index: -1;
    background-color: transparent;
    pointer-events: none;
  }
}

.ready-to-focus:hover::before,
.ready-to-focus.active::before {
  background-color: var(--menu-btn-hover-bg, $menu-btn-hover-bg);
}

.ready-to-focus:active::before {
  border: 1px solid var(--menu-btn-active-border, $menu-btn-active-border);
}
</style>
