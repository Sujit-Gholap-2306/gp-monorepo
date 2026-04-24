'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createEventMedia, deleteEventMedia } from '@/lib/api/event-media'
import { gpToast } from '@/lib/toast'
import type { EventMedia } from '@/lib/types'

export function EventMediaManager({
  subdomain,
  eventId,
  initialMedia,
}: {
  subdomain: string
  eventId: string
  initialMedia: EventMedia[]
}) {
  const router = useRouter()
  const [media, setMedia] = useState(initialMedia)
  const [uploading, setUploading] = useState(false)

  async function onUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setUploading(true)
    const form = e.currentTarget
    const fd = new FormData(form)
    const file = fd.get('file') as File | null
    if (!file || file.size === 0) {
      gpToast.error('फाइल निवडा')
      setUploading(false)
      return
    }
    try {
      const up = new FormData()
      up.set('subdomain', subdomain)
      up.set('folder', 'events')
      up.set('file', file)
      const res = await fetch('/api/gp/media/upload', { method: 'POST', body: up, credentials: 'include' })
      const j = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error((j as { message?: string }).message ?? 'Upload failed')
      const url = (j as { url: string }).url
      const type = file.type.startsWith('video/') ? 'video' : 'photo'
      const row = await createEventMedia(subdomain, eventId, {
        url,
        type,
        caption: (fd.get('caption') as string) || null,
        sortOrder: 0,
      })
      setMedia((prev) => [...prev, row as EventMedia])
      form.reset()
      router.refresh()
    } catch (err) {
      gpToast.error(err instanceof Error ? err.message : 'अपलोड अयशस्वी')
    } finally {
      setUploading(false)
    }
  }

  async function onDelete(item: EventMedia) {
    try {
      const res = await fetch('/api/gp/media/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ subdomain, url: item.url }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error((j as { message?: string }).message ?? 'Delete failed')
      }
      await deleteEventMedia(subdomain, eventId, item.id)
      setMedia((prev) => prev.filter((m) => m.id !== item.id))
      router.refresh()
    } catch (err) {
      gpToast.error(err instanceof Error ? err.message : 'हटविणे अयशस्वी')
    }
  }

  return (
    <div>
      <p className="text-sm text-gp-muted mb-6">{media.length} फाइल्स</p>

      <div className="bg-card rounded-lg border border-gp-border p-5 mb-6 max-w-lg">
        <h2 className="font-semibold mb-3 text-sm">फोटो / व्हिडिओ जोडा</h2>
        <form onSubmit={onUpload} className="grid gap-3">
          <input type="file" name="file" accept="image/*,video/*" required className="text-sm" />
          <input
            type="text"
            name="caption"
            placeholder="शीर्षक (पर्यायी)"
            className="rounded-md border border-gp-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gp-primary"
          />
          <button
            type="submit"
            disabled={uploading}
            className="rounded-md bg-gp-primary text-white px-4 py-2 text-sm font-medium hover:bg-gp-primary-hover w-fit disabled:opacity-50"
          >
            {uploading ? '…' : 'अपलोड करा'}
          </button>
        </form>
      </div>

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
              <button
                type="button"
                onClick={() => onDelete(item)}
                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-red-600 text-white text-xs px-2 py-1 rounded hover:bg-red-700"
              >
                हटवा
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
