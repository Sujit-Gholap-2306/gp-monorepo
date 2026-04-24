import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { Users, Phone } from 'lucide-react'
import { getTenant } from '@/lib/tenant'
import { listPostHolders } from '@/lib/api/post-holders'
import { PageHeader } from '@/components/public/page-header'
import { EmptyState } from '@/components/public/empty-state'
import type { PostHolder, Locale } from '@/lib/types'

export default async function PostHoldersPage({
  params,
}: {
  params: Promise<{ tenant: string }>
}) {
  const { tenant: subdomain } = await params
  const tenant = await getTenant(subdomain)
  if (!tenant) notFound()

  const cookieStore = await cookies()
  const locale = (cookieStore.get('locale')?.value ?? 'mr') as Locale

  const raw = (await listPostHolders(subdomain)) as PostHolder[]
  const list = raw.filter((ph) => ph.is_active)

  return (
    <>
      <PageHeader
        eyebrow={locale === 'mr' ? 'नेतृत्व' : 'Leadership'}
        title={locale === 'mr' ? 'पदाधिकारी' : 'Post Holders'}
        subtitle={
          locale === 'mr'
            ? 'आमच्या ग्रामपंचायतीचे निवडून आलेले पदाधिकारी व सदस्य.'
            : 'Elected representatives and members of our Gram Panchayat.'
        }
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        {!list.length ? (
          <EmptyState
            icon={<Users className="h-6 w-6" />}
            title={locale === 'mr' ? 'माहिती उपलब्ध नाही' : 'No post holders listed'}
            description={
              locale === 'mr'
                ? 'पदाधिकारी माहिती लवकरच प्रकाशित केली जाईल.'
                : 'Post holder information will be published soon.'
            }
          />
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {list.map((ph) => {
              const name = locale === 'mr' ? ph.name_mr : ph.name_en
              const nameAlt = locale === 'mr' ? ph.name_en : ph.name_mr
              const post = locale === 'mr' ? ph.post_mr : ph.post_en
              return (
                <li
                  key={ph.id}
                  className="group relative overflow-hidden rounded-2xl border border-gp-border bg-card p-6 hover:border-gp-primary/30 hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-4">
                    {ph.photo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={ph.photo_url}
                        alt={name}
                        loading="lazy"
                        className="h-20 w-20 rounded-full object-cover ring-2 ring-gp-border shrink-0"
                      />
                    ) : (
                      <div className="h-20 w-20 rounded-full bg-gp-primary/10 text-gp-primary flex items-center justify-center font-display font-bold text-2xl shrink-0 ring-2 ring-gp-border">
                        {name.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-gp-primary">
                        {post}
                      </p>
                      <h3 className="mt-1 font-display text-lg font-bold text-foreground leading-tight">
                        {name}
                      </h3>
                      <p className="mt-0.5 text-sm text-gp-muted">{nameAlt}</p>
                    </div>
                  </div>
                  {ph.phone && (
                    <a
                      href={`tel:${ph.phone}`}
                      className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-gp-primary hover:text-gp-primary-hover transition-colors cursor-pointer"
                    >
                      <Phone className="h-4 w-4" aria-hidden="true" />
                      <span>{ph.phone}</span>
                    </a>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </>
  )
}
