import { eq, asc, sql } from 'drizzle-orm'
import { db } from '../db/index.ts'
import { gpPropertyTypeRates, PROPERTY_TYPE_KEYS } from '../db/schema/property-type-rates.ts'
import { ApiError } from '../common/exceptions/http.exception.ts'
import { z } from 'zod'

const rateValue = z.preprocess(
  (v) => (v === '' || v == null ? null : v),
  z.union([z.coerce.number().nonnegative(), z.null()])
)
const paiseValue = z.preprocess(
  (v) => (v === '' || v == null ? null : v),
  z.union([z.coerce.number().int().nonnegative(), z.null()])
)

export const propertyTypeRateRowSchema = z
  .object({
    property_type:                  z.enum(PROPERTY_TYPE_KEYS),
    min_rate:                       rateValue,
    max_rate:                       rateValue,
    land_rate_per_sqft:             rateValue,
    construction_rate_per_sqft:     rateValue,
    new_construction_rate_per_sqft: rateValue,
    default_lighting_paise:         paiseValue,
    default_sanitation_paise:       paiseValue,
    default_water_paise:            paiseValue,
  })
  .superRefine((r, ctx) => {
    const { min_rate: min, max_rate: max } = r
    if (min != null && max != null && min > max) {
      ctx.addIssue({
        code:    z.ZodIssueCode.custom,
        path:    ['max_rate'],
        message: 'max_rate must be >= min_rate',
      })
    }

    const within = (value: number | null, field: string) => {
      if (value == null) return
      if (min != null && value < min) {
        ctx.addIssue({
          code:    z.ZodIssueCode.custom,
          path:    [field],
          message: `${field} must be >= min_rate (${min})`,
        })
      }
      if (max != null && value > max) {
        ctx.addIssue({
          code:    z.ZodIssueCode.custom,
          path:    [field],
          message: `${field} must be <= max_rate (${max})`,
        })
      }
    }

    within(r.land_rate_per_sqft, 'land_rate_per_sqft')
    within(r.construction_rate_per_sqft, 'construction_rate_per_sqft')
    within(r.new_construction_rate_per_sqft, 'new_construction_rate_per_sqft')
  })

export type PropertyTypeRateRow = z.infer<typeof propertyTypeRateRowSchema>

export const propertyTypeRatesService = {
  async listForGp(gpId: string) {
    return db
      .select()
      .from(gpPropertyTypeRates)
      .where(eq(gpPropertyTypeRates.gpId, gpId))
      .orderBy(asc(gpPropertyTypeRates.propertyType))
  },

  async upsertForGp(gpId: string, rows: PropertyTypeRateRow[]) {
    const keys = rows.map((r) => r.property_type)
    const seen = new Set(keys)
    if (seen.size !== keys.length) {
      throw new ApiError(422, 'Duplicate property_type entries in request')
    }

    const values = rows.map((r) => ({
      gpId,
      propertyType:               r.property_type,
      minRate:                    r.min_rate != null ? String(r.min_rate) : null,
      maxRate:                    r.max_rate != null ? String(r.max_rate) : null,
      landRatePerSqft:            r.land_rate_per_sqft != null ? String(r.land_rate_per_sqft) : null,
      constructionRatePerSqft:    r.construction_rate_per_sqft != null ? String(r.construction_rate_per_sqft) : null,
      newConstructionRatePerSqft: r.new_construction_rate_per_sqft != null ? String(r.new_construction_rate_per_sqft) : null,
      defaultLightingPaise:      r.default_lighting_paise != null ? r.default_lighting_paise : null,
      defaultSanitationPaise:    r.default_sanitation_paise != null ? r.default_sanitation_paise : null,
      defaultWaterPaise:         r.default_water_paise != null ? r.default_water_paise : null,
    }))

    await db
      .insert(gpPropertyTypeRates)
      .values(values)
      .onConflictDoUpdate({
        target: [gpPropertyTypeRates.gpId, gpPropertyTypeRates.propertyType],
        set: {
          minRate:                    sql`excluded.min_rate`,
          maxRate:                    sql`excluded.max_rate`,
          landRatePerSqft:            sql`excluded.land_rate_per_sqft`,
          constructionRatePerSqft:    sql`excluded.construction_rate_per_sqft`,
          newConstructionRatePerSqft: sql`excluded.new_construction_rate_per_sqft`,
          defaultLightingPaise:       sql`excluded.default_lighting_paise`,
          defaultSanitationPaise:     sql`excluded.default_sanitation_paise`,
          defaultWaterPaise:          sql`excluded.default_water_paise`,
          updatedAt:                  sql`now()`,
        },
      })

    return this.listForGp(gpId)
  },
}
