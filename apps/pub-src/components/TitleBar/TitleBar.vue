<script lang="ts">
import { onMounted, onUnmounted, ref, shallowRef, useTemplateRef } from 'vue'
import config from '@apps/utils/config'
import logo from '@apps/assets/img/logo.svg'
import ipc from '@apps/utils/ipc'
import { isWindows } from '@apps/utils/userAgent'
import { windowEvent } from '@apps/utils/windowEvent'
</script>

<script lang="ts" setup>
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
const startRef = useTemplateRef<HTMLDivElement>('start-ref')

const titleBarStyle = ref<'macos' | 'windows' | ''>('')
const switchTitleBarStyle = (style: 'macos' | 'windows') => {
  titleBarStyle.value = style
}

config.then((c) => {
  // INFO: 此处 if 分支仅用于开发环境
  // 生产环境每次启动重新从 navigator 中获取
  // 对于linux系统, 由于无法获取到系统信息, 所以默认为macos, 允许用户自行选择
  // windows 和 macos 系统, 会根据系统类型自动选择, 不允许用户自行选择
  if (c.value['title-bar']?.style) {
    titleBarStyle.value = c.value['title-bar'].style
  } else {
    titleBarStyle.value = isWindows ? 'windows' : 'macos'
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

const isFocused = shallowRef(true)

const maxMenuWidth = ref(0)
const updateMaxMenuWidth = () => {
  const startElement = startRef.value
  if (startElement) {
    const rect = startElement.getBoundingClientRect()
    maxMenuWidth.value = rect.left + rect.width - 34
  }
}

let unListenFns: Promise<[Ipc.UnListen, Ipc.UnListen, () => void]>
onMounted(() => {
  unListenFns = Promise.all([
    ipc.on('window:blur', () => {
      isFocused.value = false
    }),
    ipc.on('window:focus', () => {
      isFocused.value = true
    }),
    windowEvent('resize', () => {
      updateMaxMenuWidth()
    })
  ])
  updateMaxMenuWidth()
})
onUnmounted(() => {
  unListenFns.then((fns) => fns.forEach((fn) => fn()))
})
</script>

<template>
  <div
    :class="{
      'title-bar': true,
      'show-action': showMenu,
      focused: isFocused,
      macos: titleBarStyle === 'macos',
      windows: titleBarStyle === 'windows'
    }"
  >
    <div ref="start-ref" class="start">
      <div class="logo" v-if="titleBarStyle === 'windows'">
        <img :src="logo" class="logo" alt="logo" />
      </div>

      <div v-if="titleBarStyle === 'macos'" class="macos-control"></div>

      <MenuBar
        v-if="showMenu"
        :titleBarStyle
        :isFocused
        :max-width="maxMenuWidth"
      />

      <!-- <div class="placeholder"></div> -->
    </div>

    <div class="center">
      <div class="placeholder"></div>
      <SearchBar :isFocused :title="title" :titleBarStyle />
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
  color: var(--base-font-2, $base-font-2);

  border-bottom: 1px solid #49494947;
  background-color: transparent;

  -webkit-app-region: drag;

  &.focused {
    background-color: var(--title-bar-bg, $title-bar-bg);
    color: var(--base-font-1, $base-font-1);
  }

  &.show-action {
    & > div {
      &.start {
        flex: 1;
      }

      &.center {
        justify-content: center;

        @media screen and (max-width: 670px) {
          flex: 0 0 222px;
        }

        @media screen and (max-width: 520px) {
          flex: 0 0 calc(100% - 298px);
        }
      }

      &.end {
        @media screen and (max-width: 670px) {
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
          flex: 0 0 222px;
        }
      }
    }

    &.show-action {
      & > div {
        @media screen and (max-width: 1000px) {
          flex: 1;
        }
        @media screen and (max-width: 670px) {
          &.end {
            flex: 1;
          }
        }
      }
    }
  }

  &.windows {
    &.show-action {
      justify-content: flex-end;

      & > div {
        &.start {
          @media screen and (max-width: 1000px) {
            flex: 1;
          }
        }

        &.center {
          @media screen and (max-width: 1000px) {
            flex: 1 0 222px;
            max-width: 320px;
          }

          @media screen and (max-width: 520px) {
            flex: 0 0 calc(100% - 298px);
          }
        }
      }
    }

    & > div {
      .center {
        flex: 1;
      }
    }
  }

  & > div {
    display: flex;
    flex: 1;

    &.center {
      justify-content: center;

      @media screen and (max-width: 670px) {
        flex: 0 0 222px;
      }
    }

    &.end {
      @media screen and (max-width: 670px) {
        flex: 0 0 1;
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
