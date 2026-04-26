import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { CheckCircle2, CircleDashed, ShieldCheck } from 'lucide-react'
import { getTenant } from '@/lib/tenant'
import { getOnboardingStatus } from '@/lib/api/onboarding'
import { createSupabaseServerClient, getSupabaseAccessToken } from '@/lib/supabase/server'
import { OnboardingReadyButton } from '@/components/admin/onboarding-ready-button'

type PageProps = {
  params: Promise<{ tenant: string }>
}

export default async function AdminOnboardingPage({ params }: PageProps) {
  const { tenant: subdomain } = await params
  const tenant = await getTenant(subdomain)
  if (!tenant) notFound()

  const cookieStore = await cookies()
  const supabase = await createSupabaseServerClient()
  const accessToken = await getSupabaseAccessToken(supabase)
  if (!accessToken) {
    redirect(`/${subdomain}/login`)
  }

  let status: Awaited<ReturnType<typeof getOnboardingStatus>> | null = null
  let loadError: string | null = null
  try {
    status = await getOnboardingStatus(subdomain, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        cookie: cookieStore.toString(),
      },
    })
  } catch (error) {
    loadError = error instanceof Error ? error.message : 'Onboarding status load अयशस्वी'
  }

  if (loadError || !status) {
    return (
      <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
        {loadError ?? 'Onboarding status load अयशस्वी'}
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-gp-border bg-card p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-gp-border bg-gp-surface px-3 py-1 text-xs text-gp-muted">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Go-live checklist</span>
            </div>
            <h1 className="mt-3 text-xl font-bold text-gp-primary">Onboarding readiness</h1>
            <p className="mt-1 text-sm text-gp-muted">
              Setup work can continue before ready. Only live collection flow will be gated later.
            </p>
          </div>

          <div className="rounded-lg border border-gp-border bg-gp-surface px-4 py-3">
            <p className="text-xs text-gp-muted">Completed</p>
            <p className="mt-1 text-2xl font-semibold text-foreground">
              {status.completedSteps}/{status.totalSteps}
            </p>
            <p className="mt-1 text-xs text-gp-muted">
              {status.onboardingComplete ? 'GP is already marked ready' : status.readyToMark ? 'All steps done' : 'Finish pending steps first'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-3">
        {status.steps.map((step) => (
          <div
            key={step.key}
            className={`rounded-lg border p-4 ${
              step.complete
                ? 'border-emerald-200 bg-emerald-50'
                : 'border-gp-border bg-card'
            }`}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex gap-3">
                <div className={`mt-0.5 rounded-full p-1 ${step.complete ? 'bg-emerald-100 text-emerald-700' : 'bg-gp-surface text-gp-muted'}`}>
                  {step.complete ? (
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <CircleDashed className="h-4 w-4" aria-hidden="true" />
                  )}
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-foreground">{step.title}</h2>
                  <p className="mt-1 text-sm text-gp-muted">{step.description}</p>
                  <p className="mt-2 text-xs text-foreground/80">{step.detail}</p>
                </div>
              </div>
              {step.href ? (
                <Link
                  href={`/${subdomain}/${step.href}`}
                  className="inline-flex h-9 items-center rounded-md border border-gp-border px-3 text-sm hover:bg-gp-surface"
                >
                  Open
                </Link>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-gp-border bg-card p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Final confirmation</h2>
            <p className="mt-1 text-sm text-gp-muted">
              Mark ready only after you verify master data, N09 generation, and opening arrears.
            </p>
          </div>
          <OnboardingReadyButton
            subdomain={subdomain}
            disabled={status.onboardingComplete || !status.readyToMark}
          />
        </div>
      </div>
    </div>
  )
}
