import { dirname, resolve } from 'node:path'
import pluginVue from 'eslint-plugin-vue'
import vueTsEslintConfig from '@vue/eslint-config-typescript'
import pluginVitest from '@vitest/eslint-plugin'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'

const __dirname = dirname(new URL(import.meta.url).pathname)
const joinTo = (...paths) => resolve(__dirname, ...paths)

export default [
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
                '@comp': joinTo('apps/pub-src/components')
              }
            }
          }
        }
      }
    }
  },

  ...pluginVue.configs['flat/essential'],
  ...vueTsEslintConfig(),

  {
    ...pluginVitest.configs.recommended,
    files: ['src/**/__tests__/*']
  },
  skipFormatting
]
