import { createI18n } from 'vue-i18n'
import config from '@apps/utils/config'
import { watch, nextTick } from 'vue'
import { invoke } from '@apps/utils/ipc'

const getBrowserLocale = (): string => {
  const navigatorLocale = navigator.language || navigator.languages[0]
  if (!navigatorLocale) {
    return 'en-US'
  }
  switch (navigatorLocale) {
    case 'ja-JP':
      return 'ja-JP'
    case 'zh-CN':
      return 'zh-CN'
    case 'zh-TW':
      return 'zh-TW'
    default:
      return 'en-US'
  }
}

const loadLocaleMessages = async (locale: string) => {
  const messages = await invoke('i18n:load', locale)
  i18n.global.setLocaleMessage(locale, messages)
  await nextTick()
}

const i18n = createI18n({
  legacy: false,
  locale: getBrowserLocale(),
  fallbackLocale: 'en-US',
})

loadLocaleMessages(i18n.global.locale.value)

loadLocaleMessages('en-US')

config.then((c) => {
  if (c.value.language) i18n.global.locale.value = c.value.language
  else c.update('language', i18n.global.locale.value)
  c.on('language', async (language) => {
    if (!language) return
    await loadLocaleMessages(language)
    i18n.global.locale.value = language
  })
})

watch(i18n.global.locale, (locale) => {
  config.then((c) => c.update('language', locale))
})

export default i18n
