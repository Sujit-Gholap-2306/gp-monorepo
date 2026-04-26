'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { markOnboardingReady } from '@/lib/api/onboarding'
import { gpToast } from '@/lib/toast'

type Props = {
  subdomain: string
  disabled: boolean
}

export function OnboardingReadyButton({ subdomain, disabled }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  function handleClick() {
    startTransition(async () => {
      try {
        const supabase = createSupabaseBrowserClient()
        const { data } = await supabase.auth.getSession()
        const accessToken = data.session?.access_token
        if (!accessToken) {
          gpToast.error('Login session मिळाली नाही. कृपया पुन्हा login करा.')
          return
        }

        await markOnboardingReady(subdomain, {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        gpToast.success('GP ready म्हणून mark झाले')
        router.refresh()
      } catch (error) {
        gpToast.fromError(error, 'Mark ready अयशस्वी')
      }
    })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || pending}
      className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-gp-primary px-4 text-sm font-medium text-gp-primary-fg transition-colors hover:bg-gp-primary-hover disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : (
        <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
      )}
      <span>Mark GP as ready</span>
    </button>
  )
}
