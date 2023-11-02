import { createI18n } from 'vue-i18n'
import en from './assets/locales/en.json'
import zh from './assets/locales/zh.json'

const messages = {
  en: en,
  zh: zh
}

const i18n = createI18n({
  locale: 'en',
  messages,
})

export default i18n;