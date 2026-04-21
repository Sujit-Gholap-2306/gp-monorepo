import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { MapPin, Phone, Mail, Home, Calendar, Building2 } from 'lucide-react'
import { getTenant } from '@/lib/tenant'
import { PageHeader } from '@/components/public/page-header'
import type { Locale } from '@/lib/types'

export default async function AboutPage({
  params,
}: {
  params: Promise<{ tenant: string }>
}) {
  const { tenant: subdomain } = await params
  const tenant = await getTenant(subdomain)
  if (!tenant) notFound()

  const cookieStore = await cookies()
  const locale = (cookieStore.get('locale')?.value ?? 'mr') as Locale

  const village = tenant.village ?? {}
  const contact = tenant.contact ?? {}
  const gpName = locale === 'mr' ? tenant.name_mr : tenant.name_en
  const established = tenant.established
    ? new Date(tenant.established).getFullYear()
    : null

  const villageRows = [
    village.name_mr || village.name_en
      ? {
          icon: <Home className="h-5 w-5" />,
          label_mr: 'गाव',
          label_en: 'Village',
          value: locale === 'mr' ? village.name_mr ?? village.name_en : village.name_en ?? village.name_mr,
        }
      : null,
    village.taluka
      ? {
          icon: <Building2 className="h-5 w-5" />,
          label_mr: 'तालुका',
          label_en: 'Taluka',
          value: village.taluka,
        }
      : null,
    village.district
      ? {
          icon: <MapPin className="h-5 w-5" />,
          label_mr: 'जिल्हा',
          label_en: 'District',
          value: village.district,
        }
      : null,
    village.pincode
      ? {
          icon: <MapPin className="h-5 w-5" />,
          label_mr: 'पिनकोड',
          label_en: 'Pincode',
          value: village.pincode,
        }
      : null,
    established
      ? {
          icon: <Calendar className="h-5 w-5" />,
          label_mr: 'स्थापना वर्ष',
          label_en: 'Established',
          value: String(established),
        }
      : null,
  ].filter(Boolean) as Array<{ icon: React.ReactNode; label_mr: string; label_en: string; value: string }>

  const contactRows = [
    contact.phone
      ? {
          icon: <Phone className="h-5 w-5" />,
          label_mr: 'फोन',
          label_en: 'Phone',
          value: contact.phone,
          href: `tel:${contact.phone}`,
        }
      : null,
    contact.email
      ? {
          icon: <Mail className="h-5 w-5" />,
          label_mr: 'ईमेल',
          label_en: 'Email',
          value: contact.email,
          href: `mailto:${contact.email}`,
        }
      : null,
    contact.address_mr || contact.address_en
      ? {
          icon: <MapPin className="h-5 w-5" />,
          label_mr: 'पत्ता',
          label_en: 'Address',
          value:
            locale === 'mr'
              ? contact.address_mr ?? contact.address_en
              : contact.address_en ?? contact.address_mr,
          href: null,
        }
      : null,
  ].filter(Boolean) as Array<{ icon: React.ReactNode; label_mr: string; label_en: string; value: string; href: string | null }>

  return (
    <>
      <PageHeader
        eyebrow={locale === 'mr' ? 'परिचय' : 'Introduction'}
        title={locale === 'mr' ? 'आमच्याबद्दल' : 'About Us'}
        subtitle={
          locale === 'mr'
            ? `${gpName}च्या माहिती व संपर्क तपशील.`
            : `Information and contact details for ${gpName}.`
        }
      />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 grid gap-6 md:grid-cols-2">
        {villageRows.length > 0 && (
          <InfoCard
            title={locale === 'mr' ? 'गाव माहिती' : 'Village Information'}
            rows={villageRows.map((r) => ({
              icon: r.icon,
              label: locale === 'mr' ? r.label_mr : r.label_en,
              value: r.value,
            }))}
          />
        )}
        {contactRows.length > 0 && (
          <InfoCard
            title={locale === 'mr' ? 'संपर्क तपशील' : 'Contact Details'}
            rows={contactRows.map((r) => ({
              icon: r.icon,
              label: locale === 'mr' ? r.label_mr : r.label_en,
              value: r.value,
              href: r.href,
            }))}
          />
        )}
      </div>
    </>
  )
}

function InfoCard({
  title,
  rows,
}: {
  title: string
  rows: Array<{
    icon: React.ReactNode
    label: string
    value: string
    href?: string | null
  }>
}) {
  return (
    <div className="rounded-2xl border border-gp-border bg-card overflow-hidden">
      <div className="px-6 py-4 border-b border-gp-border bg-gp-surface/50">
        <h2 className="font-display text-lg font-bold text-foreground">{title}</h2>
      </div>
      <ul className="divide-y divide-gp-border">
        {rows.map((row, i) => (
          <li key={i} className="flex items-start gap-4 px-6 py-4">
            <div className="shrink-0 h-9 w-9 rounded-lg bg-gp-primary/10 text-gp-primary flex items-center justify-center">
              {row.icon}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium uppercase tracking-wider text-gp-muted">
                {row.label}
              </p>
              {row.href ? (
                <a
                  href={row.href}
                  className="mt-0.5 text-base text-foreground hover:text-gp-primary transition-colors break-words cursor-pointer"
                >
                  {row.value}
                </a>
              ) : (
                <p className="mt-0.5 text-base text-foreground break-words">{row.value}</p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
