'use client'

/**
 * PreviewThemeProvider — makes the active PreviewTheme available to any
 * client component via `useTheme()`.
 *
 * Why a context and not just CSS variables?
 *   SVG `fill=` / `stroke=` / `stopColor=` attributes don't reliably resolve
 *   `var(--foo)` across browsers (especially inside `<defs>` and gradients).
 *   Components that paint SVG attributes need the concrete colour string.
 *
 *   For everything else (Tailwind arbitrary classes, CSS gradients, plain
 *   inline `style={{ background: 'var(--civic-gold)' }}`) the CSS variables
 *   set by `themeToCssVars()` are enough — no context read needed.
 */

import { createContext, useContext, type ReactNode } from 'react'
import { defaultTheme, type PreviewTheme } from '@/lib/preview/theme'

const PreviewThemeContext = createContext<PreviewTheme>(defaultTheme)

export function PreviewThemeProvider({
  theme,
  children,
}: {
  theme: PreviewTheme
  children: ReactNode
}) {
  return (
    <PreviewThemeContext.Provider value={theme}>
      {children}
    </PreviewThemeContext.Provider>
  )
}

/** Read the active preview theme from any client component. */
export function useTheme(): PreviewTheme {
  return useContext(PreviewThemeContext)
}
