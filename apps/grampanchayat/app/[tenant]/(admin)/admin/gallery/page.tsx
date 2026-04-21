import { notFound } from 'next/navigation'
import { getTenant } from '@/lib/tenant'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { addGalleryItem, deleteGalleryItem } from '@/lib/actions/gallery'
import type { Gallery } from '@/lib/types'

export default async function AdminGalleryPage({
  params,
}: {
  params: Promise<{ tenant: string }>
}) {
  const { tenant: subdomain } = await params
  const tenant = await getTenant(subdomain)
  if (!tenant) notFound()

  const supabase = await createSupabaseServerClient()
  const { data: raw } = await supabase
    .from('gallery')
    .select('*')
    .eq('gp_id', tenant.id)
    .order('sort_order', { ascending: true })

  // DB CHECK constraint guarantees type is 'photo' | 'video'
  const items = (raw ?? []) as Gallery[]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gp-primary">दालन</h1>
        <p className="text-sm text-gp-muted">Gallery — {items.length} फाइल्स</p>
      </div>

      {/* Upload */}
      <div className="bg-card rounded-lg border border-gp-border p-5 mb-6 max-w-lg">
        <h2 className="font-semibold mb-3 text-sm">फोटो / व्हिडिओ जोडा</h2>
        <form
          action={async (formData) => {
            'use server'
            await addGalleryItem(subdomain, formData)
          }}
          className="grid gap-3"
        >
          <input type="file" name="file" accept="image/*,video/*" required className="text-sm" />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              name="caption_mr"
              placeholder="शीर्षक (मराठी)"
              className="rounded-md border border-gp-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gp-primary"
            />
            <input
              type="text"
              name="caption_en"
              placeholder="Caption (English)"
              className="rounded-md border border-gp-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gp-primary"
            />
          </div>
          <button
            type="submit"
            className="rounded-md bg-gp-primary text-white px-4 py-2 text-sm font-medium hover:bg-gp-primary-hover w-fit"
          >
            अपलोड करा
          </button>
        </form>
      </div>

      {!items.length ? (
        <p className="text-gp-muted text-sm">अद्याप कोणताही मीडिया नाही</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {items.map((item) => (
            <div key={item.id} className="relative group rounded-lg overflow-hidden border border-gp-border bg-gp-surface aspect-square">
              {item.type === 'photo' ? (
                <img src={item.url} alt={item.caption_mr ?? ''} className="w-full h-full object-cover" />
              ) : (
                <video src={item.url} className="w-full h-full object-cover" />
              )}
              {item.caption_mr && (
                <p className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs px-2 py-1 truncate">
                  {item.caption_mr}
                </p>
              )}
              <span className="absolute top-1 left-1 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded">
                {item.type === 'video' ? '▶' : '📷'}
              </span>
              <form
                action={async () => {
                  'use server'
                  await deleteGalleryItem(subdomain, item.id, item.url)
                }}
                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <button type="submit" className="bg-red-600 text-white text-xs px-2 py-1 rounded hover:bg-red-700">
                  हटवा
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
