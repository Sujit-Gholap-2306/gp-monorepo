'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { deletePostHolder } from '@/lib/api/post-holders'
import { gpToast } from '@/lib/toast'

export function DeletePostHolderButton({
  subdomain,
  id,
  photoUrl,
}: {
  subdomain: string
  id: string
  photoUrl: string | null
}) {
  const router = useRouter()
  const [pending, setPending] = useState(false)

  return (
    <button
      type="button"
      disabled={pending}
      onClick={async () => {
        if (!window.confirm('हा पदाधिकारी हटवायचा?')) return
        setPending(true)
        try {
          if (photoUrl) {
            const res = await fetch('/api/gp/media/delete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({ subdomain, url: photoUrl }),
            })
            if (!res.ok) {
              const j = await res.json().catch(() => ({}))
              throw new Error((j as { message?: string }).message ?? 'Storage delete failed')
            }
          }
          await deletePostHolder(subdomain, id)
          router.refresh()
        } catch (e) {
          gpToast.error(e instanceof Error ? e.message : 'हटविणे अयशस्वी')
        } finally {
          setPending(false)
        }
      }}
      className="text-sm text-destructive hover:underline disabled:opacity-50"
    >
      {pending ? '…' : 'हटवा'}
    </button>
  )
}
