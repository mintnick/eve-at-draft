import { createApp } from 'vue'
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'
import 'primeicons/primeicons.css'

import App from './App.vue'
import i18n from './i18n'
import './style.css'

function isDarkThemeEnabled(): boolean {
  const themeString = document.cookie
    .split('; ')
    .find((row) => row.startsWith('theme='))
    ?.split('=')[1]

  if (themeString === 'true') return true
  if (themeString === 'false') return false

  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

document.documentElement.classList.toggle('app-dark', isDarkThemeEnabled())

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
