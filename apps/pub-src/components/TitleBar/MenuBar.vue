<script lang="ts">
import { useTemplateRef } from 'vue'
</script>

<script lang="ts" setup>
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
const menuBarRef = useTemplateRef<HTMLDivElement | null>('menuBarRef')
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
    <ul></ul>
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
  }
}
</style>
