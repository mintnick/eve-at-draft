import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

// Quasar
import { Quasar } from 'quasar'
import '@quasar/extras/material-icons/material-icons.css'
import 'quasar/src/css/index.sass'
import 'quasar/src/css/flex-addon.sass'

createApp(App)
.use(Quasar, {
  plugins: {}, // import Quasar plugins and add here
})
.mount('#app')
