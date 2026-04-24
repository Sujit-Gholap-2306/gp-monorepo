'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createGalleryItem, deleteGalleryItem } from '@/lib/api/gallery'
import { gpToast } from '@/lib/toast'
import type { Gallery } from '@/lib/types'

export function GalleryManager({
  subdomain,
  initialItems,
}: {
  subdomain: string
  initialItems: Gallery[]
}) {
  const router = useRouter()
  const [items, setItems] = useState(initialItems)
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
      up.set('folder', 'gallery')
      up.set('file', file)
      const res = await fetch('/api/gp/media/upload', { method: 'POST', body: up, credentials: 'include' })
      const j = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error((j as { message?: string }).message ?? 'Upload failed')
      const url = (j as { url: string }).url
      const type = file.type.startsWith('video/') ? 'video' : 'photo'
      const row = await createGalleryItem(subdomain, {
        url,
        type,
        captionMr: (fd.get('caption_mr') as string) || null,
        captionEn: (fd.get('caption_en') as string) || null,
        sortOrder: 0,
      })
      setItems((prev) => [...prev, row as Gallery])
      form.reset()
      router.refresh()
    } catch (err) {
      gpToast.error(err instanceof Error ? err.message : 'अपलोड अयशस्वी')
    } finally {
      setUploading(false)
    }
  }

  async function onDelete(item: Gallery) {
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
      await deleteGalleryItem(subdomain, item.id)
      setItems((prev) => prev.filter((x) => x.id !== item.id))
      router.refresh()
    } catch (err) {
      gpToast.error(err instanceof Error ? err.message : 'हटविणे अयशस्वी')
    }
  }

  return (
    <div>
      <div className="bg-card rounded-lg border border-gp-border p-5 mb-6 max-w-lg">
        <h2 className="font-semibold mb-3 text-sm">फोटो / व्हिडिओ जोडा</h2>
        <form onSubmit={onUpload} className="grid gap-3">
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
            disabled={uploading}
            className="rounded-md bg-gp-primary text-white px-4 py-2 text-sm font-medium hover:bg-gp-primary-hover w-fit disabled:opacity-50"
          >
            {uploading ? '…' : 'अपलोड करा'}
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
