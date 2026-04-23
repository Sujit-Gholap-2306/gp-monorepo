import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getTenant } from '@/lib/tenant'
import { LocaleProvider } from '@/lib/i18n/context'
import { SiteNav } from '@/components/public/site-nav'
import { SiteFooter } from '@/components/public/site-footer'
import { getTenantPublicMetadata } from '@/lib/portal-meta'
import type { Locale } from '@/lib/types'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tenant: string }>
}): Promise<Metadata> {
  const { tenant: subdomain } = await params
  const tenant = await getTenant(subdomain)
  if (!tenant) return { title: 'Gram Panchayat' }
  return getTenantPublicMetadata(tenant, subdomain)
}

export default async function PublicLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ tenant: string }>
}) {
  const { tenant: subdomain } = await params
  const tenant = await getTenant(subdomain)
  if (!tenant) notFound()

  const cookieStore = await cookies()
  const locale = (cookieStore.get('locale')?.value ?? 'mr') as Locale

  return (
    <LocaleProvider initial={locale}>
      <div className="min-h-screen flex flex-col bg-background">
        <SiteNav tenant={tenant} locale={locale} />
        <main className="flex-1">{children}</main>
        <SiteFooter tenant={tenant} locale={locale} subdomain={subdomain} />
      </div>
    </LocaleProvider>
  )
}
