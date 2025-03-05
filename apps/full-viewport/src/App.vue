<script lang="ts">
import ba from './utils/text-bill-analysis'
import i18n from '@/apps/pub-src/i18n'
import config from '@/apps/pub-src/utils/config'
import { shallowRef, useTemplateRef, watch } from 'vue'
import ipc from '@apps/utils/ipc'
import { isMac } from '@apps/utils/userAgent'

async function textBillAnalysis() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.txt'
  input.onchange = async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    const text = (await file?.text()) ?? ''

    ba(text).then((res) => {
      console.log(res)
    })
  }
  input.click()
}

const submitFile = (e: Event) => {
  e.preventDefault()
  textBillAnalysis()
}
const createWindow = async (label: string) => {
  const res = await ipc.invoke('window:new', label)
  console.log(res)
}
const languages = [
  ['en-US', 'English'],
  ['zh-CN', '简体中文'],
  ['zh-TW', '繁體中文'],
  ['ja-JP', '日本語']
] as const
const changeLanguage = (event: Event) => {
  i18n.global.locale.value = (event.target as HTMLSelectElement)
    .value as (typeof languages)[number][0]
}
</script>

<script setup lang="ts">
import TitleBar from '@comp/TitleBar/TitleBar.vue'
import { useFileDrop } from '@apps/hooks/useFileDrop'
import { useI18n } from 'vue-i18n'
const { locale } = useI18n({
  useScope: 'global'
})
// const fileDrop =
useFileDrop('container', (e) => {
  console.log(e)
})
const alphaRef = shallowRef(0)
config.then((c) => {
  alphaRef.value = isMac ? 0 : c.value['bg-transparency'] || 255
})
watch(alphaRef, (v) => {
  const _v = isMac ? 0 : v
  config.then((c) => {
    c.update('bg-transparency', Number(_v))
  })
})
const commandForm = useTemplateRef<HTMLFormElement>('command-form')
const commandSubmit = (e: Event) => {
  e.preventDefault()
  if (!commandForm.value) return
  const command = new FormData(commandForm.value).get('command') as string
  console.dir(command)
  ipc.send('command:parseAndRun', command)
  commandForm.value?.reset()
}
const commandChange = async (e: Event) => {
  const command = (e.target as HTMLInputElement).value
  console.log(await ipc.invoke('command:fuzzyParse', command))
}
</script>

<template>
  <div>
    <TitleBar :title="$t('title.search.value')" :showMenu="true" />
    <main class="container" ref="container">
      <div>
        <form id="form" @submit="submitFile">
          <button type="submit">选择账单</button>
        </form>
        <button
          v-tooltip="['左', 'left']"
          @click="createWindow('full-viewport')"
        >
          打开新的完整窗口
        </button>
        <button
          v-tooltip="['right', 'right']"
          @click="createWindow('main-viewport-only')"
        >
          打开新的主窗口
        </button>
        <select v-tooltip="['LeetCode', 'top']" @change="changeLanguage">
          <option
            v-for="[lang, key] in languages"
            :key="key"
            :value="lang"
            :selected="lang === locale"
          >
            {{ key }}
          </option>
        </select>
        <input
          v-tooltip="['bottom', 'bottom']"
          type="range"
          min="0"
          max="255"
          step="1"
          v-model="alphaRef"
        />
        <form id="command-form" @submit="commandSubmit" ref="command-form">
          <input name="command" type="text" @change="commandChange" />
        </form>
      </div>
    </main>
    <div
      class="menu-test"
      v-contextmenu="[
        {
          label: '右键菜单测试',
          submenu: [
            {
              label: '子菜单1',
              submenu: [
                {
                  label: '子菜单1-1',
                  submenu: [
                    {
                      label: '子菜单1-1-1'
                    }
                  ]
                },
                {
                  label: '子菜单1-2'
                }
              ]
            },
            {
              label: '子菜单2'
            }
          ]
        }
      ]"
    >
      右键菜单测试
    </div>
  </div>
</template>

<style lang="scss" scoped>
.menu-test {
  width: 100vw;
  height: 100px;
  background-color: #b1c29ebf;
}

#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

.container {
  margin: 0;
  padding-top: 10vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
}

button {
  margin: 10px;
}

select {
  margin: 10px;
  padding: 11px;
  border-radius: 8px;
  border: 0;
  background-color: #0f0f0f98;
  color: #fff;
  font-size: 16px;
  border: 1px solid #6736ec00;
  transition: border-color 0.25s;

  cursor: pointer;

  &:hover {
    border-color: #396cd8;
  }

  &:focus {
    border-color: #396cd8;
  }

  & option {
    padding: 5px;
  }
}
</style>
