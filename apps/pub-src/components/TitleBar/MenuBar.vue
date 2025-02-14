<script lang="ts">
import { onUnmounted, ref, useTemplateRef } from 'vue'
import ipc from '@apps/utils/ipc'
</script>

<script lang="ts" setup>
import MenuButton, {
  type MenuItem
} from '@comp/button/menuButton/MenuButton.vue'
const { titleBarStyle } = defineProps({
  isFocused: {
    type: Boolean,
    required: true
  },
  titleBarStyle: {
    type: String,
    required: true
  }
})
const menuBarRef = useTemplateRef<HTMLDivElement>('menuBarRef')
const menu = ref<MenuItem[]>([])
const unListerFn = ipc.on('menu:update', (_, _menu) => {
  console.log(_menu)
  menu.value = _menu
})
onUnmounted(() => {
  unListerFn()
})
const menuHandler = (item: MenuItem) => {
  console.log(item)
}
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
        <MenuButton :item="item" :ready-to-focus="true" @click="menuHandler" />
      </li>
    </ul>
  </div>
</template>

<style scoped lang="scss">
.menu-bar {
  // TODO: 没有内容, 宽度未确定
  flex: 1;

  & > ul {
    display: flex;
    justify-content: flex-start;

    font-size: 13px;

    app-region: no-drag;

    list-style: none;
    padding: 0;
    margin: 0;

    // & > li {}
  }
}
</style>
