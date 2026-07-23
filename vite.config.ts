import { fileURLToPath, URL } from 'node:url'

import { quasar, transformAssetUrls } from '@quasar/vite-plugin'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    vue({ template: { transformAssetUrls } }),
    quasar({ sassVariables: fileURLToPath(new URL('./src/css/quasar.variables.scss', import.meta.url)) })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@goastian/astian-ui/cloud': fileURLToPath(new URL('./src/cloud/index.ts', import.meta.url)),
      '@goastian/astian-ui': fileURLToPath(new URL('./src/index.ts', import.meta.url))
    }
  },
  build: {
    sourcemap: true,
    chunkSizeWarningLimit: 750
  }
})
