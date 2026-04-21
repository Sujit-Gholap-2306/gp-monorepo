'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useParams } from 'next/navigation'
import { Menu, Globe, X } from 'lucide-react'
import type { GpTenant } from '@/lib/types'

const NAV_ITEMS = [
  { key: 'home',          hrefSlug: '',              label: 'मुख्यपृष्ठ',   labelEn: 'Home' },
  { key: 'announcements', hrefSlug: 'announcements', label: 'घोषणा',        labelEn: 'Announcements' },
  { key: 'events',        hrefSlug: 'events',        label: 'कार्यक्रम',    labelEn: 'Events' },
  { key: 'gallery',       hrefSlug: 'gallery',       label: 'दालन',         labelEn: 'Gallery' },
  { key: 'post-holders',  hrefSlug: 'post-holders',  label: 'पदाधिकारी',    labelEn: 'Post Holders' },
  { key: 'about',         hrefSlug: 'about',         label: 'आमच्याबद्दल', labelEn: 'About' },
] as const

interface SiteNavProps {
  tenant: Pick<GpTenant, 'name_mr' | 'name_en' | 'logo_url'>
  locale: 'mr' | 'en'
}

export function SiteNav({ tenant, locale }: SiteNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const params = useParams()
  const subdomain = params.tenant as string
  const [mobileOpen, setMobileOpen] = useState(false)

  function toggleLocale() {
    const next = locale === 'mr' ? 'en' : 'mr'
    document.cookie = `locale=${next};path=/;max-age=31536000;SameSite=Lax`
    router.refresh()
  }

  function isActive(hrefSlug: string) {
    const fullPath = hrefSlug ? `/${subdomain}/${hrefSlug}` : `/${subdomain}`
    if (hrefSlug === '') return pathname === fullPath
    return pathname === fullPath || pathname.startsWith(`${fullPath}/`)
  }

  const gpName = locale === 'mr' ? tenant.name_mr : tenant.name_en

  return (
    <header className="sticky top-0 z-40 border-b border-gp-border/60 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
        {/* Brand */}
        <Link
          href={`/${subdomain}`}
          className="flex items-center gap-3 group"
          aria-label={gpName}
        >
          {tenant.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={tenant.logo_url}
              alt=""
              className="h-10 w-10 rounded-full object-cover ring-1 ring-gp-border"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gp-primary text-gp-primary-fg font-display font-bold text-sm">
              {gpName.slice(0, 1)}
            </div>
          )}
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold text-foreground group-hover:text-gp-primary transition-colors">
              {gpName}
            </span>
            <span className="text-[11px] text-gp-muted tracking-wide uppercase">
              ग्रामपंचायत
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.hrefSlug)
            const href = item.hrefSlug ? `/${subdomain}/${item.hrefSlug}` : `/${subdomain}`
            return (
              <Link
                key={item.key}
                href={href}
                className={`relative px-3 py-2 text-sm rounded-md transition-colors cursor-pointer ${
                  active
                    ? 'text-gp-primary font-semibold'
                    : 'text-foreground/70 hover:text-foreground hover:bg-gp-surface'
                }`}
                aria-current={active ? 'page' : undefined}
              >
                {locale === 'mr' ? item.label : item.labelEn}
                {active && (
                  <span className="absolute inset-x-3 -bottom-[1px] h-[2px] bg-gp-primary rounded-full" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Right cluster */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={toggleLocale}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-foreground/70 hover:text-foreground hover:bg-gp-surface rounded-md transition-colors cursor-pointer"
            aria-label={locale === 'mr' ? 'Switch to English' : 'मराठीत पहा'}
          >
            <Globe className="h-4 w-4" aria-hidden="true" />
            <span>{locale === 'mr' ? 'EN' : 'मर'}</span>
          </button>

          {/* Mobile trigger */}
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-md text-foreground/70 hover:text-foreground hover:bg-gp-surface transition-colors cursor-pointer"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm animate-fade-in"
          onClick={() => setMobileOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute right-0 top-0 h-full w-72 bg-background shadow-xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between h-16 px-4 border-b border-gp-border">
              <span className="text-sm font-semibold">{gpName}</span>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-md text-foreground/70 hover:bg-gp-surface transition-colors cursor-pointer"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto px-2 py-3 flex flex-col gap-0.5">
              {NAV_ITEMS.map((item) => {
                const active = isActive(item.hrefSlug)
                const href = item.hrefSlug ? `/${subdomain}/${item.hrefSlug}` : `/${subdomain}`
                return (
                  <Link
                    key={item.key}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className={`px-3 py-3 rounded-md text-sm transition-colors cursor-pointer ${
                      active
                        ? 'bg-gp-primary text-gp-primary-fg font-semibold'
                        : 'text-foreground hover:bg-gp-surface'
                    }`}
                  >
                    {locale === 'mr' ? item.label : item.labelEn}
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}
