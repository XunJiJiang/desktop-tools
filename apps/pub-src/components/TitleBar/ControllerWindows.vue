<script lang="ts">
import { getCurrentWindow } from '@tauri-apps/api/window'
import { computed } from 'vue';
const appWindow = getCurrentWindow()
</script>

<script lang="ts" setup>
import IconFont from '@comp/IconFont/IconFont.vue'
import { useCssVar } from '@apps/store/modules/useCssVar'

const { isFocused } = defineProps({
  isFocused: {
    type: Boolean,
    required: true
  }
})
const cssVar = useCssVar()

const color = computed(() => {
  return isFocused
    ? cssVar.vars['base-font-color-1']
    : cssVar.vars['base-font-color-2']
})
</script>

<template>
  <div class="webview-window-controller">
    <div class="titlebar-button titlebar-minimize" @click="appWindow.minimize">
      <IconFont name="minimize" :size="17" :color />
    </div>
    <div class="titlebar-button titlebar-maximize" @click="appWindow.maximize">
      <IconFont name="maximize-1" :size="12" :color />
    </div>
    <div class="titlebar-button titlebar-close" @click="appWindow.close">
      <IconFont name="close-line" :size="16" :color />
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@apps/theme/base/var.scss' as *;

.webview-window-controller {
  height: 34px;
  width: 132px;
  background: transparent;
  user-select: none;
  -webkit-user-select: none;
  display: flex;
  justify-content: flex-end;
  flex: 0 0 132px;
  border: 0;
  padding: 0;
  margin: 0;
}

.titlebar-button {
  width: 44px;
  height: 34px;
  user-select: none;
  -webkit-user-select: none;
  box-sizing: border-box;
  text-align: center;
  line-height: 34px;
  background-color: transparent;
  transition: background-color 0.25s;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
  &.titlebar-close:hover {
    background-color: #e72828;
  }
}
</style>
