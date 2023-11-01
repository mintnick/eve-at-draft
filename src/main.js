import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

// Quasar
import { Quasar } from 'quasar'
import '@quasar/extras/material-icons/material-icons.css'
import 'quasar/src/css/index.sass'
import 'quasar/src/css/flex-addon.sass'

// load theme from cookie
let themeString = document.cookie
  .split("; ")
  .find((row) => row.startsWith("theme="))
  ?.split("=")[1];
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
  themeString = "true";
}
let themeValue = "auto";
if (themeString == "true") themeValue = true;
else if (themeString == "false") themeValue = false;

else themeValue = themeString;

createApp(App)
.use(Quasar, {
  plugins: {}, // import Quasar plugins and add here
  config: {
    dark: themeValue,
  },
})
.mount('#app')
