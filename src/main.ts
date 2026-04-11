import { createApp } from 'vue'
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'
import 'primeicons/primeicons.css'

import App from './App.vue'
import { createAppI18n } from '@/lib/i18n'
import { getInitialThemeDark } from '@/lib/preferences'
import './style.css'

document.documentElement.classList.toggle('app-dark', getInitialThemeDark())

const i18n = createAppI18n()

createApp(App)
  .use(PrimeVue, {
    theme: {
      preset: Aura,
      options: {
        darkModeSelector: '.app-dark',
      },
    },
  })
  .use(i18n)
  .mount('#app')
