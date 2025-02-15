<script lang="ts">
import { computed, useTemplateRef } from 'vue'
import { useMenu } from './hooks/useMenu'
</script>

<script lang="ts" setup>
import MenuButton from '@comp/button/menuButton/MenuButton.vue'
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

const maxWidth = computed(() => mw)
const menuBarRef = useTemplateRef<HTMLDivElement>('menuBarRef')
const {
  menu,
  menuHandler,
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
          :item="item"
          :ready-to-focus="true"
          @click="menuHandler"
          @on-mounted="getSingleWidth"
        />
      </li>
      <li>
        <MenuButton
          v-if="showRemaining"
          :item="{
            label: '未完全展示项',
            type: 'remaining',
            submenu: remainingMenu
          }"
          :ready-to-focus="true"
          @click="menuHandler"
          @on-mounted="getRemainingWidth"
        />
      </li>
      <li>
        <MenuButton
          v-if="showAllRemaining"
          :item="{
            label: '全部菜单项',
            type: 'all remaining',
            submenu: allRemainingMenu
          }"
          :ready-to-focus="true"
          @click="menuHandler"
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
