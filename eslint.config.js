import { dirname, resolve } from 'node:path'
import pluginVue from 'eslint-plugin-vue'
import pluginVitest from '@vitest/eslint-plugin'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'
import {
  defineConfigWithVueTs,
  vueTsConfigs
} from '@vue/eslint-config-typescript'

const __dirname = dirname(new URL(import.meta.url).pathname)
const joinTo = (...paths) => resolve(__dirname, ...paths)

export default defineConfigWithVueTs(
  {
    name: 'app/files-to-lint',
    files: ['**/*.{ts,mts,tsx,vue,js,jsx}']
  },

  {
    name: 'app/files-to-ignore',
    ignores: ['**/dist/**', '**/dist-ssr/**', '**/coverage/**']
  },

  {
    name: 'app/alias',
    settings: {
      'import/resolver': {
        vite: {
          viteConfig: {
            resolve: {
              alias: {
                '@': joinTo(),
                '@fu': joinTo('apps/full-viewport/src'),
                '@mv': joinTo('apps/main-viewport-only/src'),
                '@apps': joinTo('apps/pub-src'),
                '@comp': joinTo('apps/pub-src/components'),
                '@ele': joinTo('electron/main')
              }
            }
          }
        }
      }
    }
  },

  pluginVue.configs['flat/essential'],
  vueTsConfigs.recommended,

  {
    ...pluginVitest.configs.recommended,
    files: ['src/**/__tests__/*']
  },
  skipFormatting
)
