import { resolve, join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import electron from 'vite-plugin-electron/simple'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

const __dirname = join(dirname(fileURLToPath(import.meta.url)))
const joinTo = (...paths: string[]) => resolve(__dirname, ...paths)

export default defineConfig(async () => ({
  plugins: [
    vue(),
    vueDevTools(),
    electron({
      main: {
        vite: {
          resolve: {
            alias: {
              '@': joinTo(),
              '@ele': joinTo('electron/main')
            }
          }
        },
        entry: joinTo('electron/main/main.ts')
      },
      preload: {
        input: joinTo('electron/preload/preload.ts')
      },
      renderer: process.env.NODE_ENV === 'test' ? undefined : {}
    })
  ],
  clearScreen: false,
  server: {
    port: 3100,
    strictPort: true
  },
  resolve: {
    alias: {
      '@': joinTo(),
      '@fu': joinTo(`apps/full-viewport/src`),
      '@mv': joinTo(`apps/main-viewport-only/src`),
      '@apps': joinTo(`apps/pub-src`),
      '@comp': joinTo(`apps/pub-src/components`)
    }
  },
  build: {
    rollupOptions: {
      input: {
        fu: joinTo('apps/full-viewport/index.html'),
        mv: joinTo('apps/main-viewport-only/index.html')
      }
    }
  }
}))
