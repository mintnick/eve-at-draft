import { createI18n } from "vue-i18n";
import en from './locales/en.json'

let local_lang = navigator.language

const i18n = createI18n({
  legacy: false,
  locale: local_lang,
  fallbackLocale: 'en',
  messages: {
    "en": en,
    // "zh": zh,
  }
});

export default i18n;