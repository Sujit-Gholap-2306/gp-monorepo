import type { Metadata } from 'next'
import type { GpTenant } from '@/lib/types'
import { normalizePortalConfig } from '@/lib/portal-config'

/**
 * Resolves public SEO metadata for `[tenant]/(public)` from `gp_tenants` + `portal_config`.
 * Use in `generateMetadata` in the public layout.
 */
export function getTenantPublicMetadata(
  tenant: GpTenant,
  subdomain: string
): Metadata {
  const p = tenant.portal_config ?? normalizePortalConfig({})
  const nameMr = tenant.name_mr
  const nameEn = tenant.name_en
  const titleMr = (p.meta_title_mr as string | undefined)?.trim() || nameMr
  const titleEn = (p.meta_title_en as string | undefined)?.trim() || nameEn
  const descMr = (p.meta_description_mr as string | undefined)?.trim()
  const descEn = (p.meta_description_en as string | undefined)?.trim()
  const desc =
    [descMr, descEn].filter(Boolean).join(' · ') ||
    (descMr || descEn) ||
    `${nameMr} (${nameEn}) — ग्रामपंचायत`

  const ogImage = resolveAbsoluteOgImage(p.og_image_url as string | undefined, tenant.logo_url)
  return {
    title: `${titleMr} | ${titleEn}`,
    description: desc,
    openGraph: {
      title: `${titleMr} | ${titleEn}`,
      description: desc,
      ...(ogImage ? { images: [{ url: ogImage, alt: nameMr }] } : {}),
    },
    alternates: { canonical: `/${subdomain}` },
  }
}

function resolveAbsoluteOgImage(
  og: string | undefined,
  logo: string | null
): string | undefined {
  if (og && /^https?:\/\//.test(og)) return og
  const base = process.env.NEXT_PUBLIC_APP_ORIGIN
  if (og && base && og.startsWith('/')) {
    return `${base.replace(/\/$/, '')}${og}`
  }
  if (logo && /^https?:\/\//.test(logo)) return logo
  if (logo && base && logo.startsWith('/')) {
    return `${base.replace(/\/$/, '')}${logo}`
  }
  return undefined
}
