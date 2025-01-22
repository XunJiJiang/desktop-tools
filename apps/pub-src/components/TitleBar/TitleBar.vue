<script lang="ts">
import { onUnmounted, ref, shallowRef } from 'vue'
import config from '@apps/utils/config'
import logo from '@apps/assets/img/logo.svg'
// import { getCurrentWindow } from '@tauri-apps/api/window'
// const appWindow = getCurrentWindow()
</script>

<script lang="ts" setup>
// import ControllerMacOS from './ControllerMacOS.vue'
// import ControllerWindows from './ControllerWindows.vue'
import MenuBar from './MenuBar.vue'
import SearchBar from './SearchBar.vue'
import ActionBar from './ActionBar.vue'
defineProps({
  title: {
    type: String,
    required: true
  },
  showMenu: {
    type: Boolean,
    required: true
  }
})
const titleBarStyle = ref<'macos' | 'windows' | ''>('')
const switchTitleBarStyle = (style: 'macos' | 'windows') => {
  titleBarStyle.value = style
}

config.then((c) => {
  if (c.value['title-bar']?.style) {
    titleBarStyle.value = c.value['title-bar'].style
  } else {
    titleBarStyle.value =
      navigator.userAgent.indexOf('Windows NT') !== -1 ? 'windows' : 'macos'
    c.update('title-bar.style', titleBarStyle.value)
  }
  c.on('title-bar.style', (style) => {
    titleBarStyle.value = style
  })
})
onUnmounted(() => {
  config.then((c) => {
    c.remove('title-bar.style', switchTitleBarStyle)
  })
})

const isFocused = shallowRef(false)

const unListenFns = Promise.all([
  window.ipcRenderer.on('window:blur', () => {
    isFocused.value = false
  }),
  window.ipcRenderer.on('window:focus', () => {
    isFocused.value = true
  })
])
onUnmounted(() => {
  unListenFns.then((fns) => fns.forEach((fn) => fn()))
})
</script>

<template>
  <div
    :class="{
      'title-bar': true,
      'show-menu': showMenu,
      focused: isFocused,
      macos: titleBarStyle === 'macos',
      windows: titleBarStyle === 'windows'
    }"
  >
    <div class="start">
      <div class="logo" v-if="titleBarStyle === 'windows'">
        <img :src="logo" class="logo" alt="logo" />
      </div>

      <div v-if="titleBarStyle === 'macos'" class="macos-control"></div>

      <MenuBar v-if="showMenu" :titleBarStyle="titleBarStyle" :isFocused />

      <!-- <div class="placeholder"></div> -->
    </div>

    <div class="center">
      <div class="placeholder"></div>
      <SearchBar :isFocused :title="title" />
      <div class="placeholder"></div>
    </div>

    <div class="end">
      <div class="placeholder"></div>

      <ActionBar v-if="showMenu" :isFocused />

      <div v-if="titleBarStyle !== 'macos'" class="window-control"></div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use 'sass:color';
@use '@apps/theme/base/var.scss' as *;

$focused-color: #fff;

div {
  background: transparent;
}

.title-bar {
  height: 34px;
  max-width: 100vw;
  user-select: none;
  -webkit-user-select: none;
  display: flex;
  justify-content: center;

  font-size: 13px;
  color: var(--base-font-color-2, $base-font-color-2);

  border-bottom: 1px solid #424242;
  background-color: transparent;

  app-region: drag;

  &.focused {
    background-color: var(--title-bar-bg-color, $title-bar-bg-color);
    color: var(--base-font-color-1, $base-font-color-1);
  }

  &.show-menu {
    & > div {
      &.start {
        flex: 1;
      }

      @media screen and (max-width: 670px) {
        &.end {
          flex: 0 0 224px;
        }
      }
    }
  }

  @media screen and (max-width: 670px) {
    justify-content: space-between;
  }

  &.macos {
    & > div {
      @media screen and (max-width: 670px) {
        &.center {
          flex: 6;
        }
      }
    }
  }

  &.macos.show-menu {
    & > div {
      @media screen and (max-width: 670px) {
        &.end {
          flex: 0 0 90px;
        }
      }
    }
  }

  & > div {
    display: flex;
    flex: 1;

    &.center {
      justify-content: center;

      @media screen and (max-width: 670px) {
        flex: 6;
      }
    }

    & > div {
      display: flex;
      align-items: center;

      box-sizing: border-box;

      &.placeholder {
        flex: 1;
        // border: #fff 1px solid;

        pointer-events: none;
      }

      &.macos-control {
        width: 76px;
        flex: 0 0 76px;
        pointer-events: none;
      }

      &.window-control {
        width: 132px;
        flex: 0 0 132px;
        pointer-events: none;
      }

      &.logo {
        width: 34px;
        height: 34px;
        box-sizing: content-box;
        padding: 0;
        margin: 0;

        pointer-events: none;

        flex: 0 0 34px;

        & img {
          width: 16px;
          height: 16px;
          margin: 9px;
        }
      }
    }
  }
}
</style>
