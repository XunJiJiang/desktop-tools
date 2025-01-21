import { createI18n } from 'vue-i18n'
import type { Settings } from '@apps/types/settings'
import config from '@apps/utils/config'
import en from './languages/en.json'
import ja from './languages/ja.json'
import zh from './languages/zh.json'
import tw from './languages/tw.json'
import { watch } from 'vue'

const getBrowserLocale = (): Settings['language'] => {
  const navigatorLocale = navigator.language || navigator.languages[0]
  if (!navigatorLocale) {
    return 'en'
  }
  const trimmedLocale = navigatorLocale.trim().split(/-|_/)[0]
  switch (trimmedLocale) {
    case 'ja':
      return 'ja'
    case 'zh':
      return 'zh'
    case 'zh-Hant':
      return 'tw'
    default:
      return 'en'
  }
}

const messages = {
  en,
  ja,
  zh,
  tw
}

const i18n = createI18n({
  locale: getBrowserLocale(),
  fallbackLocale: 'en',
  messages
})

config.then((c) => {
  if (c.value.language) i18n.global.locale = c.value.language
  else c.update('language', i18n.global.locale)
  c.on('language', (language) => {
    if (!language) return
    i18n.global.locale = language
  })
})

watch(
  () => i18n.global.locale,
  (locale) => {
    config.then((c) => c.update('language', locale))
  }
)

export default i18n
