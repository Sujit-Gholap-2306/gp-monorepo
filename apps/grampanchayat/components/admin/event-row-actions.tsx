'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { updateEvent, deleteEvent } from '@/lib/api/events'
import { gpToast } from '@/lib/toast'

type Ev = { id: string; is_published: boolean }

export function EventPublishedToggle({ subdomain, ev }: { subdomain: string; ev: Ev }) {
  const router = useRouter()
  const [pending, setPending] = useState(false)

  return (
    <button
      type="button"
      disabled={pending}
      onClick={async () => {
        setPending(true)
        try {
          await updateEvent(subdomain, ev.id, { isPublished: !ev.is_published })
          router.refresh()
        } catch (e) {
          gpToast.error(e instanceof Error ? e.message : 'अपडेट अयशस्वी')
        } finally {
          setPending(false)
        }
      }}
      className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${
        ev.is_published
          ? 'bg-green-100 text-green-700 border-green-200'
          : 'bg-gray-100 text-gray-500 border-gray-200'
      }`}
    >
      {pending ? '…' : ev.is_published ? 'प्रकाशित' : 'मसुदा'}
    </button>
  )
}

export function EventRowEndActions({ subdomain, ev }: { subdomain: string; ev: Ev }) {
  const router = useRouter()
  const [deletePending, setDeletePending] = useState(false)

  async function remove() {
    if (!window.confirm('हा कार्यक्रम हटवायचा?')) return
    setDeletePending(true)
    try {
      await deleteEvent(subdomain, ev.id)
      router.refresh()
    } catch (e) {
      gpToast.error(e instanceof Error ? e.message : 'हटविणे अयशस्वी')
    } finally {
      setDeletePending(false)
    }
  }

  return (
    <div className="flex gap-3 justify-end">
      <Link href={`/${subdomain}/admin/events/${ev.id}/media`} className="text-sm text-gp-primary hover:underline">
        मीडिया
      </Link>
      <Link href={`/${subdomain}/admin/events/${ev.id}/edit`} className="text-sm text-gp-primary hover:underline">
        संपादित
      </Link>
      <button
        type="button"
        disabled={deletePending}
        onClick={remove}
        className="text-sm text-destructive hover:underline disabled:opacity-50"
      >
        {deletePending ? '…' : 'हटवा'}
      </button>
    </div>
  )
}
