import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { Image as ImageIcon } from 'lucide-react'
import { getTenant } from '@/lib/tenant'
import { listGallery } from '@/lib/api/gallery'
import { PageHeader } from '@/components/public/page-header'
import { EmptyState } from '@/components/public/empty-state'
import { GalleryGrid } from '@/components/public/gallery-grid'
import type { Gallery, Locale } from '@/lib/types'

export default async function GalleryPage({
  params,
}: {
  params: Promise<{ tenant: string }>
}) {
  const { tenant: subdomain } = await params
  const tenant = await getTenant(subdomain)
  if (!tenant) notFound()

  const cookieStore = await cookies()
  const locale = (cookieStore.get('locale')?.value ?? 'mr') as Locale

  const items = (await listGallery(subdomain)) as Gallery[]

  return (
    <>
      <PageHeader
        eyebrow={locale === 'mr' ? 'आठवणी' : 'Memories'}
        title={locale === 'mr' ? 'दालन' : 'Gallery'}
        subtitle={
          locale === 'mr'
            ? 'ग्रामपंचायतीचे फोटो व व्हिडिओ संग्रह.'
            : 'Photos and videos from the Gram Panchayat.'
        }
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        {!items.length ? (
          <EmptyState
            icon={<ImageIcon className="h-6 w-6" />}
            title={locale === 'mr' ? 'कोणतेही फोटो नाहीत' : 'No media yet'}
            description={
              locale === 'mr'
                ? 'छायाचित्रे आणि व्हिडिओ लवकरच जोडले जातील.'
                : 'Photos and videos will be added soon.'
            }
          />
        ) : (
          <GalleryGrid items={items} locale={locale} />
        )}
      </div>
    </>
  )
}
