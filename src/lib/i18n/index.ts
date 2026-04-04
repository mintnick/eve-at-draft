import { createI18n } from 'vue-i18n'

import en from '@/lib/i18n/messages/en.json'
import zh from '@/lib/i18n/messages/zh.json'
import { getInitialLocale } from '@/lib/preferences'

export const appMessages = {
  en,
  zh,
}

export function createAppI18n() {
  return createI18n({
    locale: getInitialLocale(),
    legacy: false,
    messages: appMessages,
  })
}
