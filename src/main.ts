import { createApp } from 'vue'
import PrimeVue from 'primevue/config'

import App from './App.vue'
import { ConsoleTheme } from '@/app/theme'
import { createAppI18n } from '@/lib/i18n'
import './style.css'

const i18n = createAppI18n()

createApp(App)
  .use(PrimeVue, {
    theme: {
      preset: ConsoleTheme,
      options: {
        darkModeSelector: '.app-dark',
      },
    },
  })
  .use(i18n)
  .mount('#app')
