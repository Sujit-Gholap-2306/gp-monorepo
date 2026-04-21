import Link from 'next/link'
import { Phone, Mail, MapPin, ExternalLink } from 'lucide-react'
import type { GpTenant } from '@/lib/types'

interface SiteFooterProps {
  tenant: GpTenant
  locale: 'mr' | 'en'
  subdomain: string
}

export function SiteFooter({ tenant, locale, subdomain }: SiteFooterProps) {
  const gpName = locale === 'mr' ? tenant.name_mr : tenant.name_en
  const contact = tenant.contact ?? {}
  const village = tenant.village ?? {}
  const year = new Date().getFullYear()

  const quickLinks = [
    { slug: 'announcements', label_mr: 'घोषणा',       label_en: 'Announcements' },
    { slug: 'events',        label_mr: 'कार्यक्रम',   label_en: 'Events' },
    { slug: 'gallery',       label_mr: 'दालन',        label_en: 'Gallery' },
    { slug: 'post-holders',  label_mr: 'पदाधिकारी',   label_en: 'Post Holders' },
    { slug: 'about',         label_mr: 'आमच्याबद्दल', label_en: 'About' },
  ]

  return (
    <footer className="border-t border-gp-border bg-gp-primary text-gp-primary-fg mt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* About column */}
          <div className="lg:col-span-2">
            <p className="font-display text-xl font-bold">{gpName}</p>
            <p className="text-sm text-gp-primary-fg/70 mt-1">
              {locale === 'mr' ? tenant.name_en : tenant.name_mr}
            </p>
            {village.taluka && village.district && (
              <p className="text-sm text-gp-primary-fg/80 mt-3">
                {locale === 'mr'
                  ? `${village.taluka} तालुका, ${village.district} जिल्हा, महाराष्ट्र`
                  : `${village.taluka} Taluka, ${village.district} District, Maharashtra`}
              </p>
            )}
            {tenant.established && (
              <p className="text-xs text-gp-primary-fg/60 mt-2 uppercase tracking-wider">
                {locale === 'mr' ? 'स्थापना' : 'Established'}:{' '}
                {new Date(tenant.established).getFullYear()}
              </p>
            )}
          </div>

          {/* Quick links */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gp-primary-fg/60 mb-4">
              {locale === 'mr' ? 'द्रुत दुवे' : 'Quick Links'}
            </p>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.slug}>
                  <Link
                    href={`/${subdomain}/${link.slug}`}
                    className="text-sm text-gp-primary-fg/80 hover:text-gp-primary-fg transition-colors cursor-pointer"
                  >
                    {locale === 'mr' ? link.label_mr : link.label_en}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gp-primary-fg/60 mb-4">
              {locale === 'mr' ? 'संपर्क' : 'Contact'}
            </p>
            <ul className="space-y-3 text-sm">
              {contact.phone && (
                <li className="flex items-start gap-2.5">
                  <Phone className="h-4 w-4 mt-0.5 text-gp-primary-fg/60 shrink-0" aria-hidden="true" />
                  <a
                    href={`tel:${contact.phone}`}
                    className="text-gp-primary-fg/90 hover:text-gp-primary-fg transition-colors cursor-pointer"
                  >
                    {contact.phone}
                  </a>
                </li>
              )}
              {contact.email && (
                <li className="flex items-start gap-2.5">
                  <Mail className="h-4 w-4 mt-0.5 text-gp-primary-fg/60 shrink-0" aria-hidden="true" />
                  <a
                    href={`mailto:${contact.email}`}
                    className="text-gp-primary-fg/90 hover:text-gp-primary-fg transition-colors cursor-pointer break-all"
                  >
                    {contact.email}
                  </a>
                </li>
              )}
              {contact.address_mr && (
                <li className="flex items-start gap-2.5">
                  <MapPin className="h-4 w-4 mt-0.5 text-gp-primary-fg/60 shrink-0" aria-hidden="true" />
                  <span className="text-gp-primary-fg/90">
                    {locale === 'mr' ? contact.address_mr : contact.address_en ?? contact.address_mr}
                  </span>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-gp-primary-fg/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-gp-primary-fg/60">
          <p>
            © {year} {gpName}.{' '}
            {locale === 'mr' ? 'सर्व हक्क राखीव.' : 'All rights reserved.'}
          </p>
          <a
            href="https://grampanchayat.co.in"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-gp-primary-fg/60 hover:text-gp-cta transition-colors cursor-pointer"
          >
            <span>
              {locale === 'mr'
                ? 'हे पोर्टल ग्रामपंचायत वर चालते'
                : 'Powered by GramPanchayat'}
            </span>
            <ExternalLink className="h-3 w-3" aria-hidden="true" />
          </a>
        </div>
      </div>
    </footer>
  )
}
