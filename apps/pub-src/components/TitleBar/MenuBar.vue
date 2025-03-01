<script lang="ts" setup>
import { computed, useTemplateRef } from 'vue'
import { useMenu } from './hooks/useMenu'
import MenuButton, {
  type MenuItem
} from '@comp/button/menuButton/MenuButton.vue'
import { send } from '@apps/utils/ipc'
const { titleBarStyle, maxWidth: mw } = defineProps({
  isFocused: {
    type: Boolean,
    required: true
  },
  titleBarStyle: {
    type: String,
    required: true
  },
  maxWidth: {
    type: Number,
    required: true
  }
})
const clickHandler = (item: MenuItem) => {
  if (item.command) {
    send('command:parseAndRun', item.command)
  }
}
const maxWidth = computed(() => mw)
const menuBarRef = useTemplateRef<HTMLDivElement>('menuBarRef')
const {
  menu,
  showHandler,
  hideHandler,
  hoverShow,
  getRemainingWidth,
  getAllRemainingWidth,
  getSingleWidth,
  showRemaining,
  showAllRemaining,
  remainingMenu,
  allRemainingMenu
} = useMenu(maxWidth)
</script>

<template>
  <div
    ref="menuBarRef"
    v-if="titleBarStyle === 'windows'"
    :class="{
      'menu-bar': true,
      focused: isFocused
    }"
  >
    <ul>
      <!-- TODO: 此处, 需要响应式, 宽度不足时隐藏部分 -->
      <li v-for="item in menu" :key="item.label">
        <MenuButton
          ref="menu-button-list-ref"
          :item="item"
          :ready-to-focus="true"
          :hover-show="hoverShow"
          @show="showHandler"
          @hide="hideHandler"
          @click="clickHandler"
          @on-mounted="getSingleWidth"
        />
      </li>
      <li>
        <MenuButton
          ref="menu-button-remaining-ref"
          v-if="showRemaining"
          :item="{
            label: '未完全展示项',
            type: 'remaining',
            submenu: remainingMenu
          }"
          :ready-to-focus="true"
          :hover-show="hoverShow"
          @show="showHandler"
          @hide="hideHandler"
          @click="clickHandler"
          @on-mounted="getRemainingWidth"
        />
      </li>
      <li>
        <MenuButton
          ref="menu-button-all-remaining-ref"
          v-if="showAllRemaining"
          :item="{
            label: '全部菜单项',
            type: 'all remaining',
            submenu: allRemainingMenu
          }"
          :ready-to-focus="true"
          :hover-show="hoverShow"
          @show="showHandler"
          @hide="hideHandler"
          @click="clickHandler"
          @on-mounted="getAllRemainingWidth"
        />
      </li>
    </ul>
  </div>
</template>

<style scoped lang="scss">
.menu-bar {
  // TODO: 没有内容, 宽度未确定
  flex: 0;

  & > ul {
    display: flex;
    justify-content: flex-start;

    font-size: 13px;

    -webkit-app-region: no-drag;

    list-style: none;
    padding: 0;
    margin: 0;

    // & > li {}
  }
}
</style>
