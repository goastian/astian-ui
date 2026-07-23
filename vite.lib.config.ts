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
    cssCodeSplit: false,
    lib: {
      entry: {
        index: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
        cloud: fileURLToPath(new URL('./src/cloud/index.ts', import.meta.url)),
        style: fileURLToPath(new URL('./src/style.ts', import.meta.url))
      },
      name: 'AstianUI',
      formats: ['es', 'cjs'],
      fileName: (format, entryName) => {
        const baseName = entryName === 'index' ? 'astian-ui' : entryName
        return `${baseName}.${format === 'es' ? 'js' : 'cjs'}`
      },
      cssFileName: 'astian-ui'
    },
    rollupOptions: {
      external: (id) => (
        id === 'vue' ||
        id.startsWith('vue/') ||
        id === 'quasar' ||
        id.startsWith('quasar/')
      ),
      output: {
        exports: 'named',
      }
    },
    sourcemap: true
  }
})
