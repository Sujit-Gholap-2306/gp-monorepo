import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getTenant } from '@/lib/tenant'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { addEventMedia, deleteEventMedia } from '@/lib/actions/events'
import type { EventMedia } from '@/lib/types'

export default async function EventMediaPage({
  params,
}: {
  params: Promise<{ tenant: string; id: string }>
}) {
  const { tenant: subdomain, id: eventId } = await params
  const [tenant, supabase] = [await getTenant(subdomain), await createSupabaseServerClient()]
  if (!tenant) notFound()

  const { data: ev } = await supabase
    .from('events')
    .select('id, title_mr')
    .eq('id', eventId)
    .eq('gp_id', tenant.id)
    .single()

  if (!ev) notFound()

  const { data: mediaRaw } = await supabase
    .from('event_media')
    .select('*')
    .eq('event_id', eventId)
    .order('sort_order', { ascending: true })

  // DB CHECK constraint guarantees type is 'photo' | 'video'
  const media = (mediaRaw ?? []) as EventMedia[]

  return (
    <div>
      <div className="mb-6">
        <Link href={`/${subdomain}/admin/events`} className="text-sm text-gp-muted hover:text-foreground">
          ← कार्यक्रम
        </Link>
        <h1 className="text-xl font-bold text-gp-primary mt-2">{ev.title_mr} — मीडिया</h1>
        <p className="text-sm text-gp-muted">{media.length} फाइल्स</p>
      </div>

      {/* Upload form */}
      <div className="bg-card rounded-lg border border-gp-border p-5 mb-6 max-w-lg">
        <h2 className="font-semibold mb-3 text-sm">फोटो / व्हिडिओ जोडा</h2>
        <form
          action={async (formData) => {
            'use server'
            await addEventMedia(subdomain, eventId, formData)
          }}
          className="grid gap-3"
        >
          <input
            type="file"
            name="file"
            accept="image/*,video/*"
            required
            className="text-sm"
          />
          <input
            type="text"
            name="caption"
            placeholder="शीर्षक (पर्यायी)"
            className="rounded-md border border-gp-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gp-primary"
          />
          <button
            type="submit"
            className="rounded-md bg-gp-primary text-white px-4 py-2 text-sm font-medium hover:bg-gp-primary-hover w-fit"
          >
            अपलोड करा
          </button>
        </form>
      </div>

      {/* Media grid */}
      {!media.length ? (
        <p className="text-gp-muted text-sm">अद्याप कोणताही मीडिया नाही</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {media.map((item) => (
            <div key={item.id} className="relative group rounded-lg overflow-hidden border border-gp-border bg-gp-surface aspect-square">
              {item.type === 'photo' ? (
                <img src={item.url} alt={item.caption ?? ''} className="w-full h-full object-cover" />
              ) : (
                <video src={item.url} className="w-full h-full object-cover" />
              )}
              {item.caption && (
                <p className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs px-2 py-1 truncate">
                  {item.caption}
                </p>
              )}
              <form
                action={async () => {
                  'use server'
                  await deleteEventMedia(subdomain, eventId, item.id, item.url)
                }}
                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <button
                  type="submit"
                  className="bg-red-600 text-white text-xs px-2 py-1 rounded hover:bg-red-700"
                >
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
