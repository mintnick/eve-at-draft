export const APP_LOCALES = ['en', 'zh-CN', 'zh-TW', 'ru', 'de', 'ja', 'ko', 'fr', 'es'] as const

export type LocaleCode = (typeof APP_LOCALES)[number]

export const LOCALE_LABELS: Record<LocaleCode, string> = {
  en: 'English',
  'zh-CN': '简体中文',
  'zh-TW': '繁體中文',
  ru: 'Русский',
  de: 'Deutsch',
  ja: '日本語',
  ko: '한국어',
  fr: 'Français',
  es: 'Español',
}

export function isLocaleCode(value: string): value is LocaleCode {
  return (APP_LOCALES as readonly string[]).includes(value)
}

export function normalizeLocaleCode(value: string | null): LocaleCode | null {
  if (value === 'zh') {
    return 'zh-CN'
  }

  return value && isLocaleCode(value) ? value : null
}
