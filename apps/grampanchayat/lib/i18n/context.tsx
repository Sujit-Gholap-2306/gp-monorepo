'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { mr, type TranslationKey } from './mr'
import { en } from './en'
import type { Locale } from '@/lib/types'

const strings = { mr, en }

interface LocaleContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: TranslationKey) => string
}

const LocaleContext = createContext<LocaleContextValue | null>(null)

export function LocaleProvider({
  children,
  initial = 'mr',
}: {
  children: ReactNode
  initial?: Locale
}) {
  const [locale, setLocaleState] = useState<Locale>(initial)

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next)
    document.cookie = `locale=${next};path=/;max-age=31536000;SameSite=Lax`
  }, [])

  const t = useCallback(
    (key: TranslationKey) => strings[locale][key] ?? key,
    [locale]
  )

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale() {
  const ctx = useContext(LocaleContext)
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider')
  return ctx
}
