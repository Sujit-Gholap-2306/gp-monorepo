'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Ban } from 'lucide-react'
import { voidReceipt } from '@/lib/api/namuna10'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { gpToast } from '@/lib/toast'

type Props = {
  subdomain: string
  receiptId: string
  accessToken?: string
}

export function Namuna10VoidAction({ subdomain, receiptId, accessToken }: Props) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)

  async function getAccessToken() {
    const supabase = createSupabaseBrowserClient()
    const { data } = await supabase.auth.getSession()
    return data.session?.access_token ?? accessToken ?? null
  }

  async function handleVoid() {
    const reason = window.prompt('पावती void करण्याचे कारण लिहा')
    if (reason == null) return

    const trimmedReason = reason.trim()
    if (trimmedReason.length < 3) {
      gpToast.error('Void कारण किमान 3 अक्षरांचे असावे')
      return
    }

    const confirmed = window.confirm('ही पावती void करायची आहे? ही क्रिया delete करत नाही, पण N09 भरलेली रक्कम reverse करेल.')
    if (!confirmed) return

    const token = await getAccessToken()
    if (!token) {
      gpToast.error('Login session मिळाली नाही. कृपया पुन्हा login करा.')
      return
    }

    setSubmitting(true)
    try {
      await voidReceipt(
        subdomain,
        receiptId,
        { reason: trimmedReason },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      gpToast.success('पावती void झाली. N09 भरणा reverse झाला.')
      router.refresh()
    } catch (error) {
      gpToast.fromError(error, 'पावती void अयशस्वी')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleVoid}
      disabled={submitting}
      className="inline-flex h-9 items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 disabled:opacity-60"
    >
      <Ban className="h-4 w-4" aria-hidden="true" />
      <span>{submitting ? 'Voiding...' : 'Void Receipt'}</span>
    </button>
  )
}
