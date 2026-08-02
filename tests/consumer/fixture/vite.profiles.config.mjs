import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

const fixtureDir = dirname(fileURLToPath(import.meta.url))
const profile = process.env.ASTIAN_CONSUMER_PROFILE
const supportedProfiles = new Set(['baseline', 'input', 'forms', 'marketing'])

if (!profile || !supportedProfiles.has(profile)) {
  throw new Error(`Perfil Vite inválido: ${String(profile)}`)
}

export default defineConfig({
  plugins: [
    vue(),
    {
      name: 'astian-consumer-module-graph',
      generateBundle(_options, bundle) {
        const modules = Object.values(bundle)
          .filter((output) => output.type === 'chunk')
          .flatMap((chunk) => Object.keys(chunk.modules))
          .toSorted()

        this.emitFile({
          type: 'asset',
          fileName: 'module-graph.json',
          source: `${JSON.stringify([...new Set(modules)], null, 2)}\n`
        })
      }
    }
  ],
  build: {
    outDir: resolve(fixtureDir, 'dist-profiles', profile),
    emptyOutDir: true,
    cssCodeSplit: true,
    minify: 'oxc',
    sourcemap: false,
    rollupOptions: {
      input: resolve(fixtureDir, 'src', 'profiles', `${profile}.ts`),
      output: {
        entryFileNames: 'profile.js',
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]'
      }
    }
  }
})
