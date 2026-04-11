import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vue()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('/data/generated/')) {
            return 'tournament-data'
          }

          if (id.includes('/node_modules/primevue/') || id.includes('/node_modules/@primeuix/') || id.includes('/node_modules/primeicons/')) {
            return 'primevue'
          }

          if (id.includes('/node_modules/vue/') || id.includes('/node_modules/vue-i18n/') || id.includes('/node_modules/@intlify/')) {
            return 'vue'
          }
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  base: '',
})
