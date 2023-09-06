import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // VueI18nPlugin({
    //   include: resolveBaseUrl(dirname(fileURLToPath(import.meta.url)), './src/i18n/locales/**'),
    // }),
  ],
  // resolve: {
  // alias: {
  //   '@': fileURLToPath(new URL('./src', import.meta.url))
  // }
})
