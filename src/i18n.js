import { createI18n } from 'vue-i18n'
import en from './assets/locales/en.json'
import zh from './assets/locales/zh.json'

const messages = {
  en: en,
  zh: zh
}

// load lang from cookie
let lang = document.cookie
  .split("; ")
  .find((row) => row.startsWith("lang="))
  ?.split("=")[1];
if (!lang) {
  lang = 'en';
  document.cookie=`lang=en`
}

const i18n = createI18n({
  locale: lang,
  legacy: false,
  messages,
})

export default i18n;