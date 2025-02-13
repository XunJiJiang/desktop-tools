<script lang="ts">
export type MenuItem = {
  label: string
}
export type MenuButtonProps = {
  item: MenuItem
  /** 仅当上次鼠标聚焦在menu的任意项时, 处理鼠标hover */
  readyToFocus: boolean
}
export type MenuButtonEvents = {
  click: [item: MenuItem]
}
</script>

<script lang="ts" setup>
const { item, readyToFocus } = defineProps<MenuButtonProps>()
const emit = defineEmits<MenuButtonEvents>()
const clickHandler = () => {
  emit('click', item)
}
</script>

<template>
  <div
    :class="{
      'menu-btn': true,
      'ready-to-focus': readyToFocus
    }"
  >
    <button @click="clickHandler">{{ item.label }}</button>
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
    background-color: #0000;
  }
}

.ready-to-focus:hover::before,
.ready-to-focus.active::before {
  background-color: var(--menu-btn-hover-bg, $menu-btn-hover-bg);
}

.ready-to-focus:active::before {
  border: 1px solid var(--menu-btn-hover-border, $menu-btn-hover-border);
}
</style>
