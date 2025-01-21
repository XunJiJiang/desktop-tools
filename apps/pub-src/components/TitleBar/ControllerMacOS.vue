<script lang="ts">
import { getCurrentWindow } from '@tauri-apps/api/window'
const appWindow = getCurrentWindow()
</script>

<script lang="ts" setup>
defineProps({
  isFocused: {
    type: Boolean,
    required: true
  }
})
</script>

<template>
  <div
    data-tauri-drag-region
    :class="{
      'webview-window-controller': true,
      focused: isFocused
    }"
  >
    <div class="titlebar-button titlebar-close" @click="appWindow.close"></div>
    <div
      class="titlebar-button titlebar-maximize"
      @click="appWindow.maximize"
    ></div>
    <div
      class="titlebar-button titlebar-minimize"
      @click="appWindow.minimize"
    ></div>
  </div>
</template>

<style scoped lang="scss">
@use '@apps/theme/base/var.scss' as *;
div {
  background: transparent;
}

.webview-window-controller {
  height: 34px;
  width: 76px;
  background: transparent;
  user-select: none;
  -webkit-user-select: none;
  display: flex;
  justify-content: flex-start;
  flex: 0 0 76px;
  border: 0;
  padding: 0;
  margin: 0;
}

// 控件按钮和边框的距离
$title-bar-button-margin: 10px;

.titlebar-button {
  width: 12px;
  height: 12px;
  margin: $title-bar-button-margin calc($title-bar-button-margin / 2);
  user-select: none;
  -webkit-user-select: none;
  border-radius: 6px;

  transition:
    opacity 0.25s,
    background-color 0.25s;

  font-size: 12px;
  line-height: 12px;
  text-align: center;
  font-weight: bold;
  color: #4d4d4d;

  &.titlebar-minimize {
    margin-inline-end: $title-bar-button-margin;
  }
  // &.titlebar-maximize {}
  &.titlebar-close {
    margin-inline-start: $title-bar-button-margin;
  }
}
.titlebar-button:hover {
  opacity: 0.7;
}

.webview-window-controller.focused {
  & .titlebar-button {
    &.titlebar-minimize {
      background-color: #28c740;
    }
    &.titlebar-maximize {
      background-color: #fab92b;
    }
    &.titlebar-close {
      background-color: #ff3f35;
    }
  }
}

.webview-window-controller {
  background-color: transparent;
  & .titlebar-button {
    &.titlebar-minimize {
      background-color: #424242;
    }
    &.titlebar-maximize {
      background-color: #424242;
    }
    &.titlebar-close {
      background-color: #424242;
    }
  }
}
</style>
