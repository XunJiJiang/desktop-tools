<script setup lang="ts">
import { computed, ref, useTemplateRef } from 'vue'
import { createBasePopup } from '@comp/popup/BasePopup'
import IconFont from '@comp/IconFont/IconFont.vue'

type MenuPopupExposed = {
  hide: (e: MouseEvent) => boolean
}

type MenuItem = import('@/types/menu').MenuItem

const { items: _items, createMenuPopup } = defineProps<{
  items: MenuItem[]
  createMenuPopup: (
    menu: MenuItem[],
    onClick: (item: MenuItem, e: MouseEvent) => void,
    position?: {
      x: number
      y: number
    }
  ) => Omit<ReturnType<typeof createBasePopup>, 'hide'> & MenuPopupExposed
}>()
const emit = defineEmits<{
  click: [item: MenuItem, e: MouseEvent]
  createMenuPopup: [
    item: MenuItem[],
    (item: MenuItem, e: MouseEvent) => void,
    opt: {
      x?: number
      y?: number
      width?: number
      height?: number
    }
  ]
}>()

const items = computed(() => {
  return _items.filter((item, i) => {
    if (item.type === 'separator') {
      return (
        i > 0 &&
        i < _items.length - 1 &&
        _items[i - 1].type !== 'separator' &&
        _items[i + 1].type !== 'separator'
      )
    }
    return true
  })
})

const childPopup = ref<
  (Omit<ReturnType<typeof createBasePopup>, 'hide'> & MenuPopupExposed) | null
>(null)
const lastChildItem = ref<MenuItem | null>(null)

// const menuPopupRef = useTemplateRef<HTMLDivElement>('menu-popup-ref')

const clickHandler = (item: MenuItem, e: MouseEvent) => {
  if (item.type === 'separator') {
    return
  }
  if (!Array.isArray(item.submenu) || item.submenu.length === 0) {
    emit('click', item, e)
  }
}

const mouseenterHandle = (item: MenuItem, e: MouseEvent) => {
  if (lastChildItem.value === item) {
    return
  }
  if (childPopup.value) {
    childPopup.value.hide(e)
    childPopup.value = null
    lastChildItem.value = null
  }
  if (Array.isArray(item.submenu) && item.submenu.length > 0) {
    lastChildItem.value = item
    childPopup.value = createMenuPopup(
      item.submenu,
      (item) => {
        emit('click', item, e)
      },
      // TODO: 需要计算位置, 防止超出屏幕
      {
        x:
          (e.target as HTMLButtonElement).getBoundingClientRect().x +
          (e.target as HTMLButtonElement).offsetWidth,
        y: (e.target as HTMLButtonElement).getBoundingClientRect().y - 6
      }
    )
  }
}

const menuPopupRef = useTemplateRef<HTMLDivElement>('menu-popup-ref')

defineExpose({
  hide: (e: MouseEvent) => {
    if (menuPopupRef.value?.contains(e.target as Node)) {
      return false
    }
    return childPopup.value?.hide(e) ?? true
  }
})
</script>

<template>
  <div class="menu-popup" ref="menu-popup-ref">
    <ul>
      <li
        v-for="_item in items"
        :key="_item.label"
        :class="{
          separator: _item.type === 'separator',
          hasSubmenu: Array.isArray(_item.submenu) && _item.submenu.length > 0
        }"
      >
        <button
          @click="clickHandler(_item, $event)"
          @mouseenter="mouseenterHandle(_item, $event)"
        >
          {{ _item.label }}
          <span class="icon-right">
            <IconFont
              v-if="Array.isArray(_item.submenu) && _item.submenu.length > 0"
              :size="10"
              name="chevron-right"
              color="'#fff'"
            />
          </span>
        </button>
      </li>
    </ul>
  </div>
</template>

<style scoped lang="scss">
@use '@apps/theme/base/var.scss' as *;

.menu-popup {
  background-color: transparent;
  display: flex;
  justify-content: center;
  align-items: center;
  user-select: none;
  color: var(--menu-btn-font, $menu-btn-font);
}

ul {
  list-style: none;
  padding: 6px 0 6px 0;
  margin: 0;
}

li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 5px;
  height: 22px;
  line-height: 22px;
  box-sizing: border-box;
  cursor: pointer;

  &.separator {
    border-top: 1px solid var(--base-popup-border, $base-popup-border);
    margin: 5px auto;
    height: 0;
    width: calc(100% - 10px - 10px);

    & button {
      cursor: default;

      &:hover {
        background-color: transparent;
      }
    }
  }

  &.hasSubmenu {
    position: relative;

    & button {
      position: relative;
      padding-right: 20px;
      line-height: 20px;

      & span.icon-right {
        text-align: center;
        display: block;
        position: absolute;
        right: 5px;
        top: 0.5px;
        height: 20px;
        width: 10px;
        line-height: 22px;
      }
    }
  }

  & button {
    background-color: transparent;
    border: none;
    outline: none;
    padding: 2px 10px;
    cursor: pointer;
    width: 100%;
    text-align: left;
    font-size: 13px;
    border-radius: 4px;
    box-shadow: none;
    line-height: 20px;

    &:hover {
      background-color: var(
        --menu-popup-button-hover,
        $menu-popup-button-hover
      );
    }

    &:active {
      background-color: var(
        --menu-popup-button-active,
        $menu-popup-button-active
      );
    }
  }
}
</style>
