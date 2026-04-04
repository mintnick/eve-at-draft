import type { LocaleCode } from '@/lib/types'

export interface AppPreferences {
  locale: LocaleCode
  themeDark: boolean
}

const LANG_COOKIE = 'lang'
const THEME_COOKIE = 'theme'

export function getCookieValue(name: string): string | null {
  if (typeof document === 'undefined') {
    return null
  }

  return document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`))
    ?.split('=')[1] ?? null
}

export function getStoredLocale(): LocaleCode | null {
  const locale = getCookieValue(LANG_COOKIE)
  return locale === 'en' || locale === 'zh' ? locale : null
}

export function setStoredLocale(locale: LocaleCode) {
  if (typeof document !== 'undefined') {
    document.cookie = `${LANG_COOKIE}=${locale}`
  }
}

export function getStoredThemeDark(): boolean | null {
  const theme = getCookieValue(THEME_COOKIE)
  if (theme === 'true') return true
  if (theme === 'false') return false
  return null
}

export function setStoredThemeDark(themeDark: boolean) {
  if (typeof document !== 'undefined') {
    document.cookie = `${THEME_COOKIE}=${themeDark}`
  }
}

export function getInitialLocale(): LocaleCode {
  return getStoredLocale() ?? 'en'
}

export function getInitialThemeDark(): boolean {
  const storedTheme = getStoredThemeDark()
  if (storedTheme !== null) {
    return storedTheme
  }

  return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
}

export function loadAppPreferences(): AppPreferences {
  return {
    locale: getInitialLocale(),
    themeDark: getInitialThemeDark(),
  }
}
