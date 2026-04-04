import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { quasar } from '@quasar/vite-plugin'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    vue(),
    quasar({
      sassVariables: fileURLToPath(new URL('./src/quasar-variables.sass', import.meta.url)),
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
  },
  base: '',
})
