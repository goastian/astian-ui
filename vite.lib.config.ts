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
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) }
  },
  build: {
    outDir: 'dist-lib',
    lib: {
      entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
      name: 'AstianUI',
      formats: ['es', 'umd'],
      fileName: (format) => format === 'es' ? 'astian-ui.js' : 'astian-ui.umd.cjs',
      cssFileName: 'astian-ui'
    },
    rollupOptions: {
      external: ['vue', 'quasar'],
      output: {
        exports: 'named',
        globals: { vue: 'Vue', quasar: 'Quasar' }
      }
    },
    sourcemap: true
  }
})
