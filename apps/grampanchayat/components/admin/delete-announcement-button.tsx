'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { deleteAnnouncement } from '@/lib/api/announcements'
import { gpToast } from '@/lib/toast'

export function DeleteAnnouncementButton({ subdomain, id }: { subdomain: string; id: string }) {
  const router = useRouter()
  const [pending, setPending] = useState(false)

  return (
    <button
      type="button"
      disabled={pending}
      onClick={async () => {
        if (!window.confirm('ही घोषणा हटवायची?')) return
        setPending(true)
        try {
          await deleteAnnouncement(subdomain, id)
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
