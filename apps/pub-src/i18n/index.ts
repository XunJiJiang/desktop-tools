import { createI18n } from 'vue-i18n'
import config from '@apps/utils/config'
import { watch, nextTick } from 'vue'
import { useStyle } from '@apps/style'
import { isMac, isWindows } from '@apps/utils/userAgent'
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
  fallbackLocale: 'en-US'
})

loadLocaleMessages(i18n.global.locale.value)

loadLocaleMessages('en-US')

const setFontFamily = (local: string) => {
  const style = useStyle()
  const isEn = local.startsWith('en')
  const isZh = local.startsWith('zh')
  const fontFamily = (() => {
    if (isWindows) {
      if (isEn) {
        return `'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif`
      } else if (isZh) {
        return `'Microsoft YaHei', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft JhengHei', 'Source Han Sans SC', 'Noto Sans CJK SC', 'WenQuanYi Micro Hei', sans-serif`
      } else {
        return `'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif`
      }
    } else if (isMac) {
      if (isEn) {
        return `-apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Arial, sans-serif`
      } else if (isZh) {
        return `-apple-system, BlinkMacSystemFont, PingFang SC, Hiragino Sans GB, sans-serif`
      } else {
        return `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif`
      }
    } else {
      return 'Inter, Avenir, Helvetica, Arial, sans-serif'
    }
  })()
  style.set('font-family', fontFamily)
  document.documentElement.style.setProperty('font-family', fontFamily)
}

config.then((c) => {
  if (c.value.language) i18n.global.locale.value = c.value.language
  else c.update('language', i18n.global.locale.value)
  setFontFamily(i18n.global.locale.value)
  c.on('language', async (language) => {
    if (!language) return
    await loadLocaleMessages(language)
    i18n.global.locale.value = language
    setFontFamily(language)
  })
})

watch(i18n.global.locale, (locale) => {
  config.then((c) => c.update('language', locale))
})

export default i18n
