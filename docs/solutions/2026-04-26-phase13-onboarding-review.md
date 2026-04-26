# Phase 13 — Onboarding Checklist Review

**Files:**
- `apps/grampanchayat-api/src/controllers/onboarding.controller.ts`
- `apps/grampanchayat-api/src/services/onboarding.service.ts`
- `apps/grampanchayat-api/src/routes/tenant.routes.ts`
- `apps/grampanchayat-api/src/db/schema/tenants.ts` — 3 new columns
- `apps/grampanchayat/app/[tenant]/(admin)/admin/onboarding/page.tsx`
- `apps/grampanchayat/components/admin/onboarding-ready-button.tsx`
- `apps/grampanchayat/lib/api/onboarding.ts`

---

## Blockers

### 1. FE snake_case mismatch — `lib/api/onboarding.ts`

`normalizeStatus` reads `raw.onboarding_complete`, `raw.ready_to_mark`, `raw.completed_steps`, `raw.total_steps` (snake_case) but BE returns camelCase directly. All four fields resolve to `undefined`. Page always shows 0/6 and Mark Ready never enables.

Fix — match casing:
```ts
function normalizeStatus(raw: RawOnboardingStatus): OnboardingStatus {
  return {
    onboardingComplete: raw.onboardingComplete,
    readyToMark: raw.readyToMark,
    completedSteps: raw.completedSteps,
    totalSteps: raw.totalSteps,
    steps: raw.steps,
  }
}
```
Or confirm BaseController does a global snake_case transform — check `base.controller.ts`.

### 2. `openingBalanceImportedAt` never set

`openingBalances` step checks `tenant.openingBalanceImportedAt`. Nothing sets this column after N09 import.

**Decision: do not set in N09 import service.** Will be tracked separately — either via a dedicated onboarding endpoint or a future step in the tax chain. `namuna9-opening-balances.service.ts` reverted to not touch `gpTenants`.

For now: step will remain incomplete until column is wired. Not a blocker for phase 13 ship — the checklist still renders and all other steps work.

---

## Medium

### 3. Double `getStatus` in `markReady`

`markReady` calls `this.getStatus(gpId)` twice — once to validate, once to return after UPDATE. Second call = 4 extra DB hits.

Fix:
```ts
async markReady(gpId: string) {
  const status = await this.getStatus(gpId)
  if (!status.readyToMark) throw new ApiError(409, '...')
  await db.update(gpTenants).set({ onboardingComplete: true, updatedAt: new Date() }).where(eq(gpTenants.id, gpId))
  return { ...status, onboardingComplete: true }
}
```

### 4. `markReady` not idempotent

If already `onboardingComplete = true`, re-calling re-checks all steps + fires UPDATE. Add early return:
```ts
if (status.onboardingComplete) return status
```

### 5. No tier gate on onboarding routes

Routes use `supabaseTenantAdminGuard` only. `rateMaster` and `openingBalances` steps reference `pro`-tier data. Consider `requireFeature('tax')` or document as intentionally ungated (visible to all tiers as a setup guide).

---

## Good

- `Promise.all` for citizen/property/admin counts — parallel
- `getRateMasterStatus` checks per-type completeness including `navi_rcc`-specific field
- `markReady` guards `!status.readyToMark` before writing
- FE: server-side fetch, `loadError` boundary, graceful degradation
- `OnboardingReadyButton` uses `useTransition` — no double-submit during pending
