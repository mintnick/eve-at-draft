import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import i18n from './i18n'

// Quasar stays in place during Phase 1 to avoid changing current behavior.
import { Quasar } from 'quasar'
import '@quasar/extras/material-icons/material-icons.css'
import 'quasar/src/css/index.sass'
import 'quasar/src/css/flex-addon.sass'

function getThemePreference(): boolean | 'auto' {
  let themeString = document.cookie
    .split('; ')
    .find((row) => row.startsWith('theme='))
    ?.split('=')[1]

  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    themeString = 'true'
  }

  if (themeString === 'true') return true
  if (themeString === 'false') return false

  return 'auto'
}

createApp(App)
  .use(Quasar, {
    plugins: {},
    config: {
      dark: getThemePreference(),
    },
  })
  .use(i18n)
  .mount('#app')
