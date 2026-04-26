'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { FilePlus2, Loader2 } from 'lucide-react'
import { generateNamuna9 } from '@/lib/api/namuna9'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { gpToast } from '@/lib/toast'

type Namuna9GenerateButtonProps = {
  subdomain: string
  fiscalYear?: string
}

export function Namuna9GenerateButton({
  subdomain,
  fiscalYear,
}: Namuna9GenerateButtonProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  function handleGenerate() {
    startTransition(async () => {
      try {
        const supabase = createSupabaseBrowserClient()
        const { data } = await supabase.auth.getSession()
        const accessToken = data.session?.access_token
        if (!accessToken) {
          gpToast.error('Login session मिळाली नाही. कृपया पुन्हा login करा.')
          return
        }

        const result = await generateNamuna9(subdomain, fiscalYear, {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        gpToast.success(
          result.headersGenerated > 0
            ? `${result.headersGenerated} मागणी नोंदी तयार झाल्या`
            : 'या वर्षासाठी मागणी आधीच तयार आहे'
        )
        router.refresh()
      } catch (error) {
        gpToast.error(error instanceof Error ? error.message : 'नमुना ९ generate अयशस्वी')
      }
    })
  }

  return (
    <button
      type="button"
      onClick={handleGenerate}
      disabled={pending}
      className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-gp-primary px-3 text-sm font-medium text-gp-primary-fg transition-colors hover:bg-gp-primary-hover disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : (
        <FilePlus2 className="h-4 w-4" aria-hidden="true" />
      )}
      <span>Generate</span>
    </button>
  )
}
