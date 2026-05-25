import type { LocaleCode } from '@/lib/types'
import { normalizeLocaleCode } from '@/lib/i18n/locales'

const LANG_COOKIE = 'lang'

function getCookieValue(name: string): string | null {
  if (typeof document === 'undefined') {
    return null
  }

  return document.cookie
    .split(/;\s*/)
    .find((row) => row.startsWith(`${name}=`))
    ?.split('=')[1] ?? null
}

export function getStoredLocale(): LocaleCode | null {
  const locale = getCookieValue(LANG_COOKIE)
  return normalizeLocaleCode(locale)
}

export function setStoredLocale(locale: LocaleCode) {
  if (typeof document !== 'undefined') {
    document.cookie = `${LANG_COOKIE}=${locale}`
  }
}

function detectBrowserLocale(): LocaleCode | null {
  if (typeof navigator === 'undefined') return null
  for (const lang of navigator.languages ?? []) {
    const normalized = normalizeLocaleCode(lang)
    if (normalized) return normalized
  }
  return null
}

export function getInitialLocale(): LocaleCode {
  return getStoredLocale() ?? detectBrowserLocale() ?? 'en'
}
