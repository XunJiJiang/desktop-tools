import { dirname, resolve } from 'node:path'
import globals from 'globals'
import pluginJs from '@eslint/js'
import tsEslint from 'typescript-eslint'
import eslintConfigPrettier from 'eslint-config-prettier'
import prettier from 'eslint-plugin-prettier'
import importPlugin from 'eslint-plugin-import'
import resolverAlias from 'eslint-import-resolver-alias'

const __dirname = dirname(new URL(import.meta.url).pathname)

const joinTo = (...paths) => resolve(__dirname, ...paths)

export default [
  {
    files: ['**/*.{ts}'],
    settings: {
      'import/resolver': {
        vite: {
          viteConfig: {
            resolve: {
              alias: {
                '@': joinTo('src')
              }
            }
          }
        },
        typescript: {
          alwaysTryTypes: true
        },
        node: true,
        alias: true
      }
    }
  },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tsEslint.configs.recommended,
  {
    plugins: {
      'eslint-plugin-prettier': prettier,
      'eslint-plugin-import': importPlugin,
      'eslint-import-resolver-alias': resolverAlias
    }
  },
  eslintConfigPrettier,
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/coverage/**',
      '**/public/**',
      '**/scripts/**',
      '**/test/**',
      '**/tests/**',
      '**/tmp/**',
      '**/vendor/**',
      '**/webpack/**'
    ]
  }
]
