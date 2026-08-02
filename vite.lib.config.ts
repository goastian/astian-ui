import { fileURLToPath, URL } from 'node:url'

import { transformAssetUrls } from '@quasar/vite-plugin'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    vue({ template: { transformAssetUrls } })
  ],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) }
  },
  build: {
    outDir: 'dist-lib',
    cssCodeSplit: true,
    lib: {
      entry: {
        index: fileURLToPath(new URL('./src/entries/root.ts', import.meta.url)),
        cloud: fileURLToPath(new URL('./src/cloud/index.ts', import.meta.url)),
        style: fileURLToPath(new URL('./src/style.ts', import.meta.url)),
        input: fileURLToPath(new URL('./src/entries/input.ts', import.meta.url)),
        textarea: fileURLToPath(new URL('./src/entries/textarea.ts', import.meta.url)),
        checkbox: fileURLToPath(new URL('./src/entries/checkbox.ts', import.meta.url)),
        button: fileURLToPath(new URL('./src/entries/button.ts', import.meta.url)),
        'marketing-navigation': fileURLToPath(new URL('./src/entries/marketing-navigation.ts', import.meta.url)),
        'locale-switch': fileURLToPath(new URL('./src/entries/locale-switch.ts', import.meta.url)),
        'marketing-action': fileURLToPath(new URL('./src/entries/marketing-action.ts', import.meta.url))
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
