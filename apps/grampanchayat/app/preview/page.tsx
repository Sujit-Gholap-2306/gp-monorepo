import { PreviewNav } from '@/components/preview/preview-nav'
import { PreviewThemeProvider } from '@/components/preview/theme-provider'
import { HeroSection } from '@/components/preview/sections/hero-section'
import { AboutSection } from '@/components/preview/sections/about-section'
import { MembersSection } from '@/components/preview/sections/members-section'
import { AnnouncementsSection } from '@/components/preview/sections/announcements-section'
import { AchievementsSection } from '@/components/preview/sections/achievements-section'
import { EventsSection } from '@/components/preview/sections/events-section'
import { GallerySection } from '@/components/preview/sections/gallery-section'
import { ProgressSection } from '@/components/preview/sections/progress-section'
import { MapSection } from '@/components/preview/sections/map-section'
import { ContactFooter } from '@/components/preview/sections/contact-footer'
import { resolveTheme, themeToCssVars } from '@/lib/preview/theme'

/**
 * /preview — Civic Elegant, premium Gram Panchayat portal showcase.
 *
 * Scope:
 *   - Runs on the app root (no tenant lookup, no Supabase).
 *   - All content comes from lib/preview/mock-data.
 *   - Typography, palette, and motion are scoped inside .civic-root
 *     (see app/preview/preview.css) so nothing leaks into the live tenant pages.
 *   - Default locale is Marathi to mirror real GP context; pass ?lang=en for English.
 *
 * Theming:
 *   - Default theme = Civic Elegant. Pass `?theme=sahyadri-pine` or
 *     `?theme=koyna-saffron` to switch. Unknown ids fall back to default.
 *   - In production (per-tenant), swap the `resolveTheme(...)` call for a
 *     lookup against the tenant row (e.g. `resolveTheme(tenant.portal_theme)`)
 *     — the rest of the tree is already generic.
 */
export default async function PreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string; theme?: string }>
}) {
  const { lang, theme: themeId } = await searchParams
  const locale = lang === 'en' ? 'en' : 'mr'
  const theme = resolveTheme(themeId)

  return (
    <div className="civic-root" style={themeToCssVars(theme)}>
      <PreviewThemeProvider theme={theme}>
        <PreviewNav locale={locale} />
        <main>
          <HeroSection locale={locale} />
          <AboutSection locale={locale} />
          <MembersSection locale={locale} />
          <AnnouncementsSection locale={locale} />
          <AchievementsSection locale={locale} />
          <EventsSection locale={locale} />
          <GallerySection locale={locale} />
          <ProgressSection locale={locale} />
          <MapSection locale={locale} />
          <ContactFooter locale={locale} />
        </main>
      </PreviewThemeProvider>
    </div>
  )
}
