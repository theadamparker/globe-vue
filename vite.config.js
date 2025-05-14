import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import vitePluginString from 'vite-plugin-string'

// https://vite.dev/config/
export default defineConfig({
  base: 'globe-vue',
  plugins: [vue(), vueDevTools(), vitePluginString()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
