import { readFileSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'

import { quasar, transformAssetUrls } from '@quasar/vite-plugin'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

const packageMetadata = JSON.parse(readFileSync(
  fileURLToPath(new URL('./package.json', import.meta.url)),
  'utf8'
)) as { version: string }

export default defineConfig({
  define: {
    __ASTIAN_UI_VERSION__: JSON.stringify(packageMetadata.version)
  },
  plugins: [
    vue({ template: { transformAssetUrls } }),
    quasar({ sassVariables: fileURLToPath(new URL('./src/css/quasar.variables.scss', import.meta.url)) })
  ],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) }
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    css: true,
    include: ['tests/**/*.spec.ts'],
    exclude: ['tests/e2e/**', 'node_modules/**', 'dist/**', 'dist-lib/**']
  }
})
