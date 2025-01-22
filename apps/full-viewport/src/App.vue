<script lang="ts">
import ba from './utils/text-bill-analysis'
import i18n from '@/apps/pub-src/i18n'
import config from '@/apps/pub-src/utils/config'
import { shallowRef, watch } from 'vue'

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
  const res = await window.ipcRenderer.invoke('window:new', label)
  console.log(res)
}
const languages = [
  ['en', 'English'],
  ['zh', '简体中文'],
  ['tw', '繁體中文'],
  ['ja', '日本語']
] as const
const changeLanguage = (event: Event) => {
  i18n.global.locale = (event.target as HTMLSelectElement)
    .value as (typeof languages)[number][0]
}
</script>

<script setup lang="ts">
import TitleBar from '@comp/TitleBar/TitleBar.vue'
import { useFileDrop } from '@apps/hooks/useFileDrop'
const fileDrop = useFileDrop('container', (e) => {
  console.log(e)
})
const alphaRef = shallowRef(255)
config.then((c) => {
  alphaRef.value = (c.value['bg-transparency'] || 255)
})
watch(alphaRef, (v) => {
  config.then((c) => {
    c.update('bg-transparency', Number(v))
  })
})
</script>

<template>
  <div>
    <TitleBar :title="$t('title.search')" :showMenu="true" />
    <main class="container" ref="container">
      <div>
        <form id="form" @submit="submitFile">
          <button type="submit">选择账单</button>
        </form>
        <button @click="createWindow('full-viewport')">打开新的完整窗口</button>
        <button @click="createWindow('main-viewport-only')">
          打开新的主窗口
        </button>
        <select @change="changeLanguage">
          <option
            v-for="[lang, key] in languages"
            :key="key"
            :value="lang"
            :selected="lang === i18n.global.locale"
          >
            {{ key }}
          </option>
        </select>
      </div>
    </main>
  </div>
</template>

<style lang="scss" scoped>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
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
  background-color: #1d1d1d;
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
