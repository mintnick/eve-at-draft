import { createI18n } from 'vue-i18n'
import en from './assets/locales/en.json'
import zh from './assets/locales/zh.json'

const messages = {
  en,
  zh,
}

function getInitialLocale(): keyof typeof messages {
  const lang = document.cookie
    .split('; ')
    .find((row) => row.startsWith('lang='))
    ?.split('=')[1]

  if (lang === 'en' || lang === 'zh') {
    return lang
  }

  if (typeof document !== 'undefined') {
    document.cookie = 'lang=en'
  }

  return 'en'
}

const i18n = createI18n({
  locale: getInitialLocale(),
  legacy: false,
  messages,
})

export default i18n
