import { createI18n } from 'vue-i18n'

import de from '@/lib/i18n/messages/de.json'
import en from '@/lib/i18n/messages/en.json'
import es from '@/lib/i18n/messages/es.json'
import fr from '@/lib/i18n/messages/fr.json'
import ja from '@/lib/i18n/messages/ja.json'
import ko from '@/lib/i18n/messages/ko.json'
import ru from '@/lib/i18n/messages/ru.json'
import zhCN from '@/lib/i18n/messages/zh-CN.json'
import zhTW from '@/lib/i18n/messages/zh-TW.json'
import { getInitialLocale } from '@/lib/preferences'

export const appMessages = {
  en,
  'zh-CN': zhCN,
  'zh-TW': zhTW,
  ru,
  de,
  ja,
  ko,
  fr,
  es,
}

export function createAppI18n() {
  return createI18n({
    locale: getInitialLocale(),
    legacy: false,
    messages: appMessages,
  })
}
