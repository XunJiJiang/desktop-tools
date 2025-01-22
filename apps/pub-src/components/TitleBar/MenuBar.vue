<script lang="ts">
import i18n from '@apps/i18n'
// import { Menu, Submenu, MenuItem } from '@tauri-apps/api/menu'
import { onMounted, onUnmounted, useTemplateRef } from 'vue'
import { getStringWidth } from '@apps/utils/getStringWidth'
import { createAwaiter } from '../../utils/waitFnRun'
const menu = [
  {
    label: 'file',
    i18nKey: 'title.menu.file',
    globalKey: 'F',
    group: []
  },
  {
    label: 'edit',
    i18nKey: 'title.menu.edit',
    globalKey: 'E',
    group: []
  },
  {
    label: 'selection',
    i18nKey: 'title.menu.selection',
    globalKey: 'S',
    group: []
  },
  {
    label: 'view',
    i18nKey: 'title.menu.view',
    globalKey: 'V',
    group: []
  },
  {
    label: 'go',
    i18nKey: 'title.menu.go',
    globalKey: 'G',
    group: []
  },
  {
    label: 'terminal',
    i18nKey: 'title.menu.terminal',
    globalKey: 'T',
    group: []
  },
  {
    label: 'help',
    i18nKey: 'title.menu.help',
    globalKey: 'H',
    group: []
  }
]
const init = (containerWidth: number) => {
  console.log('containerWidth', containerWidth)
  for (const item of menu) {
    const value = i18n.global.t(item.i18nKey)
    console.log(getStringWidth(value), value, i18n.global.locale)
  }
}
</script>

<script lang="ts" setup>
import config from '@apps/utils/config'
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
// config.then((c) => {
//   c.on('language', init)
// })
const { promise, resolve } = createAwaiter()
Promise.all([promise, config]).then(() => {
  const barWidth = menuBarRef.value?.clientWidth ?? 0
  init(barWidth)
})
// Menu.new().then((m) => {
//   const submenus: Promise<Submenu | MenuItem>[] = []
//   for (const item of menu) {
//     if (titleBarStyle === 'macos') {
//       const submenu = Submenu.new({
//         id: item.label,
//         text: i18n.global.t(item.i18nKey),
//         enabled: true
//       })
//       submenus.push(submenu)
//     } else {
//       const submenu = MenuItem.new({
//         id: item.label,
//         text: i18n.global.t(item.i18nKey),
//         enabled: true
//       })
//       submenus.push(submenu)
//     }
//   }
//   Promise.all(submenus).then((submenus) => {
//     for (const submenu of submenus) {
//       m.append(submenu)
//     }
//   })
// })
onMounted(() => {
  resolve()
})
onUnmounted(() => {
  config.then((c) => {
    c.remove('language', init)
  })
})
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
