import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { Megaphone, FileDown } from 'lucide-react'
import { getTenant } from '@/lib/tenant'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/public/page-header'
import { EmptyState } from '@/components/public/empty-state'
import type { Announcement, Locale } from '@/lib/types'

const CATEGORY_LABEL: Record<string, { mr: string; en: string; color: string }> = {
  general: { mr: 'सामान्य',  en: 'General',   color: 'bg-gp-primary/10 text-gp-primary border-gp-primary/20' },
  scheme:  { mr: 'योजना',   en: 'Scheme',    color: 'bg-gp-cta/10 text-gp-cta border-gp-cta/20' },
  notice:  { mr: 'सूचना',    en: 'Notice',    color: 'bg-destructive/10 text-destructive border-destructive/20' },
}

export default async function AnnouncementsPage({
  params,
}: {
  params: Promise<{ tenant: string }>
}) {
  const { tenant: subdomain } = await params
  const tenant = await getTenant(subdomain)
  if (!tenant) notFound()

  const cookieStore = await cookies()
  const locale = (cookieStore.get('locale')?.value ?? 'mr') as Locale

  const supabase = await createSupabaseServerClient()
  const { data: raw } = await supabase
    .from('announcements')
    .select('*')
    .eq('gp_id', tenant.id)
    .eq('is_published', true)
    .order('published_at', { ascending: false })

  const items = (raw ?? []) as Announcement[]

  return (
    <>
      <PageHeader
        eyebrow={locale === 'mr' ? 'माहिती' : 'Information'}
        title={locale === 'mr' ? 'घोषणा' : 'Announcements'}
        subtitle={
          locale === 'mr'
            ? 'ग्रामपंचायतीच्या अधिकृत घोषणा, योजना आणि सूचना.'
            : 'Official announcements, schemes, and notices from the Gram Panchayat.'
        }
      />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
        {!items.length ? (
          <EmptyState
            icon={<Megaphone className="h-6 w-6" />}
            title={locale === 'mr' ? 'कोणतीही घोषणा नाही' : 'No announcements yet'}
            description={
              locale === 'mr'
                ? 'प्रकाशित घोषणा येथे दिसतील.'
                : 'Published announcements will appear here.'
            }
          />
        ) : (
          <ul className="grid gap-4">
            {items.map((ann) => {
              const cat = CATEGORY_LABEL[ann.category] ?? CATEGORY_LABEL.general
              const title = locale === 'mr' ? ann.title_mr : ann.title_en
              const content = locale === 'mr' ? ann.content_mr : ann.content_en
              return (
                <li
                  key={ann.id}
                  className="group relative bg-card rounded-xl border border-gp-border p-6 hover:border-gp-primary/30 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span
                          className={`inline-flex items-center text-[11px] font-semibold uppercase tracking-wider border rounded-full px-2.5 py-0.5 ${cat.color}`}
                        >
                          {locale === 'mr' ? cat.mr : cat.en}
                        </span>
                        {ann.published_at && (
                          <time
                            dateTime={ann.published_at}
                            className="text-xs text-gp-muted"
                          >
                            {new Date(ann.published_at).toLocaleDateString(
                              locale === 'mr' ? 'mr-IN' : 'en-IN',
                              { day: 'numeric', month: 'long', year: 'numeric' },
                            )}
                          </time>
                        )}
                      </div>
                      <h3 className="mt-3 font-display text-xl font-bold text-foreground leading-snug">
                        {title}
                      </h3>
                      {content && (
                        <p className="mt-2 text-sm text-foreground/80 leading-relaxed whitespace-pre-line">
                          {content}
                        </p>
                      )}
                    </div>
                    {ann.doc_url && (
                      <a
                        href={ann.doc_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 inline-flex items-center gap-1.5 rounded-md bg-gp-primary px-3.5 py-2 text-sm font-medium text-gp-primary-fg hover:bg-gp-primary-hover transition-colors cursor-pointer"
                      >
                        <FileDown className="h-4 w-4" aria-hidden="true" />
                        <span>{locale === 'mr' ? 'डाउनलोड' : 'Download'}</span>
                      </a>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </>
  )
}
