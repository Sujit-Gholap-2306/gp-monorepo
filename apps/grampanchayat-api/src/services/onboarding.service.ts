import { and, count, eq, sql } from 'drizzle-orm'
import { db } from '../db/index.ts'
import { gpAdmins, gpCitizens, gpProperties, gpPropertyTypeRates, gpTenants } from '../db/schema/index.ts'
import { PROPERTY_TYPE_KEYS } from '../db/schema/property-type-rates.ts'
import { ApiError } from '../common/exceptions/http.exception.ts'

type OnboardingStepKey =
  | 'profile'
  | 'rateMaster'
  | 'citizens'
  | 'properties'
  | 'openingBalances'
  | 'admins'

type OnboardingStep = {
  key: OnboardingStepKey
  title: string
  description: string
  complete: boolean
  detail: string
  href?: string
}

type OnboardingStatus = {
  onboardingComplete: boolean
  readyToMark: boolean
  completedSteps: number
  totalSteps: number
  steps: OnboardingStep[]
}

function hasTenantProfileData(tenant: {
  nameMr: string
  nameEn: string
  logoUrl: string | null
  contact: unknown
}): boolean {
  if (!tenant.nameMr || !tenant.nameEn || !tenant.logoUrl) return false
  if (!tenant.contact || typeof tenant.contact !== 'object' || Array.isArray(tenant.contact)) return false
  const contact = tenant.contact as Record<string, unknown>
  return Boolean(contact.phone || contact.email || contact.address_mr || contact.address_en)
}

async function getRateMasterStatus(gpId: string) {
  const rows = await db
    .select({
      propertyType: gpPropertyTypeRates.propertyType,
      landRatePerSqft: gpPropertyTypeRates.landRatePerSqft,
      constructionRatePerSqft: gpPropertyTypeRates.constructionRatePerSqft,
      newConstructionRatePerSqft: gpPropertyTypeRates.newConstructionRatePerSqft,
      defaultLightingPaise: gpPropertyTypeRates.defaultLightingPaise,
      defaultSanitationPaise: gpPropertyTypeRates.defaultSanitationPaise,
      defaultWaterPaise: gpPropertyTypeRates.defaultWaterPaise,
    })
    .from(gpPropertyTypeRates)
    .where(eq(gpPropertyTypeRates.gpId, gpId))

  const rowByType = new Map(rows.map((row) => [row.propertyType, row]))
  const missingTypes = PROPERTY_TYPE_KEYS.filter((type) => !rowByType.has(type))
  const incompleteTypes = PROPERTY_TYPE_KEYS.filter((type) => {
    const row = rowByType.get(type)
    if (!row) return false
    const baseIncomplete = (
      row.landRatePerSqft == null ||
      row.constructionRatePerSqft == null ||
      row.defaultLightingPaise == null ||
      row.defaultSanitationPaise == null ||
      row.defaultWaterPaise == null
    )
    if (baseIncomplete) return true
    return type === 'navi_rcc' && row.newConstructionRatePerSqft == null
  })

  return {
    complete: missingTypes.length === 0 && incompleteTypes.length === 0,
    detail:
      missingTypes.length === 0 && incompleteTypes.length === 0
        ? `सर्व ${PROPERTY_TYPE_KEYS.length} property types complete`
        : [
            missingTypes.length > 0 ? `missing: ${missingTypes.join(', ')}` : null,
            incompleteTypes.length > 0 ? `incomplete: ${incompleteTypes.join(', ')}` : null,
          ].filter(Boolean).join(' · '),
  }
}

export const onboardingService = {
  async getStatus(gpId: string): Promise<OnboardingStatus> {
    const [tenant] = await db
      .select({
        id: gpTenants.id,
        nameMr: gpTenants.nameMr,
        nameEn: gpTenants.nameEn,
        logoUrl: gpTenants.logoUrl,
        contact: gpTenants.contact,
        profileCompleteAt: gpTenants.profileCompleteAt,
        openingBalanceImportedAt: gpTenants.openingBalanceImportedAt,
        onboardingComplete: gpTenants.onboardingComplete,
      })
      .from(gpTenants)
      .where(eq(gpTenants.id, gpId))
      .limit(1)

    if (!tenant) throw new ApiError(404, 'Tenant not found')

    const [{ count: citizenCount }, { count: propertyCount }, { count: adminCount }] = await Promise.all([
      db.select({ count: count() }).from(gpCitizens).where(eq(gpCitizens.gpId, gpId)).then((rows) => rows[0] ?? { count: 0 }),
      db.select({ count: count() }).from(gpProperties).where(eq(gpProperties.gpId, gpId)).then((rows) => rows[0] ?? { count: 0 }),
      db.select({ count: count() })
        .from(gpAdmins)
        .where(and(eq(gpAdmins.gpId, gpId), eq(gpAdmins.isActive, true), sql`${gpAdmins.deletedAt} IS NULL`))
        .then((rows) => rows[0] ?? { count: 0 }),
    ])

    const rateMaster = await getRateMasterStatus(gpId)
    const profileComplete = Boolean(tenant.profileCompleteAt) || hasTenantProfileData(tenant)

    const steps: OnboardingStep[] = [
      {
        key: 'profile',
        title: 'GP profile',
        description: 'Name, logo, and contact details in Settings',
        complete: profileComplete,
        detail: profileComplete ? 'Profile looks complete' : 'Fill name, logo, and at least one contact field',
        href: 'admin/settings',
      },
      {
        key: 'rateMaster',
        title: 'Rate master',
        description: 'All property types have tax rates and default flat heads',
        complete: rateMaster.complete,
        detail: rateMaster.detail,
        href: 'admin/namuna8',
      },
      {
        key: 'citizens',
        title: 'Citizens import',
        description: 'Citizen master uploaded',
        complete: citizenCount > 0,
        detail: `${citizenCount} नागरिक`,
        href: 'admin/masters/import',
      },
      {
        key: 'properties',
        title: 'Properties import',
        description: 'Property master uploaded',
        complete: propertyCount > 0,
        detail: `${propertyCount} मालमत्ता`,
        href: 'admin/masters/import',
      },
      {
        key: 'openingBalances',
        title: 'Opening balances',
        description: 'N09 arrears import completed',
        complete: Boolean(tenant.openingBalanceImportedAt),
        detail: tenant.openingBalanceImportedAt
          ? `Imported at ${tenant.openingBalanceImportedAt.toISOString()}`
          : 'Run N09 opening import once generation is ready',
        href: 'admin/namuna9',
      },
      {
        key: 'admins',
        title: 'Admin users',
        description: 'At least one active GP admin is present',
        complete: adminCount > 0,
        detail: `${adminCount} active admin user(s)`,
      },
    ]

    const completedSteps = steps.filter((step) => step.complete).length
    return {
      onboardingComplete: tenant.onboardingComplete,
      readyToMark: steps.every((step) => step.complete),
      completedSteps,
      totalSteps: steps.length,
      steps,
    }
  },

  async markReady(gpId: string): Promise<OnboardingStatus> {
    const status = await this.getStatus(gpId)
    if (status.onboardingComplete) return status
    if (!status.readyToMark) {
      throw new ApiError(409, 'Complete all onboarding steps before marking GP as ready')
    }

    await db
      .update(gpTenants)
      .set({
        onboardingComplete: true,
        updatedAt: new Date(),
      })
      .where(eq(gpTenants.id, gpId))

    return { ...status, onboardingComplete: true }
  },
}
