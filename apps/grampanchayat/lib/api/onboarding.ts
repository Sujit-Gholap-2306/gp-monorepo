import { apiFetch, buildApiUrl } from './client'
import { tenantApiPaths } from './endpoints'

export type OnboardingStepKey =
  | 'profile'
  | 'rateMaster'
  | 'citizens'
  | 'properties'
  | 'openingBalances'
  | 'admins'

export type OnboardingStep = {
  key: OnboardingStepKey
  title: string
  description: string
  complete: boolean
  detail: string
  href?: string
}

export type OnboardingStatus = {
  onboardingComplete: boolean
  readyToMark: boolean
  completedSteps: number
  totalSteps: number
  steps: OnboardingStep[]
}

type RawOnboardingStep = {
  key: OnboardingStepKey
  title: string
  description: string
  complete: boolean
  detail: string
  href?: string
}

type RawOnboardingStatus = {
  onboarding_complete: boolean
  ready_to_mark: boolean
  completed_steps: number
  total_steps: number
  steps: RawOnboardingStep[]
}

function normalizeStatus(raw: RawOnboardingStatus): OnboardingStatus {
  return {
    onboardingComplete: raw.onboarding_complete,
    readyToMark: raw.ready_to_mark,
    completedSteps: raw.completed_steps,
    totalSteps: raw.total_steps,
    steps: raw.steps.map((step) => ({
      key: step.key,
      title: step.title,
      description: step.description,
      complete: step.complete,
      detail: step.detail,
      href: step.href,
    })),
  }
}

export async function getOnboardingStatus(
  subdomain: string,
  init?: RequestInit
): Promise<OnboardingStatus> {
  const raw = await apiFetch<RawOnboardingStatus>(
    buildApiUrl(subdomain, tenantApiPaths.onboarding.status),
    { method: 'GET', ...init }
  )
  return normalizeStatus(raw)
}

export async function markOnboardingReady(
  subdomain: string,
  init?: RequestInit
): Promise<OnboardingStatus> {
  const raw = await apiFetch<RawOnboardingStatus>(
    buildApiUrl(subdomain, tenantApiPaths.onboarding.markReady),
    { method: 'POST', body: JSON.stringify({}), ...init }
  )
  return normalizeStatus(raw)
}
