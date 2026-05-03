import { asyncHandler } from '../common/guards/async-handler.ts'
import { BaseController } from '../common/base/base.controller.ts'
import { propertyTypeRatesService, propertyTypeRateRowSchema } from '../services/property-type-rates.service.ts'
import { PROPERTY_TYPE_KEYS } from '../db/schema/property-type-rates.ts'
import { ApiError } from '../common/exceptions/http.exception.ts'
import { z } from 'zod'

const putBodySchema = z
  .object({
    rates: z.array(propertyTypeRateRowSchema).length(PROPERTY_TYPE_KEYS.length, {
      message: `All ${String(PROPERTY_TYPE_KEYS.length)} property types must be configured`,
    }),
  })
  .superRefine((body, ctx) => {
    const provided = new Set(body.rates.map((r) => r.property_type))
    const missing = PROPERTY_TYPE_KEYS.filter((k) => !provided.has(k))
    if (missing.length > 0) {
      ctx.addIssue({
        code:    z.ZodIssueCode.custom,
        path:    ['rates'],
        message: `Missing property_type entries: ${missing.join(', ')}`,
      })
    }
  })

class PropertyTypeRatesController extends BaseController {
  list = asyncHandler(async (req, res) => {
    const tenant = req.gpTenant
    if (!tenant) throw new ApiError(500, 'Tenant context missing')
    const data = await propertyTypeRatesService.listForGp(tenant.id)
    return this.ok(res, data, 'Property type rates')
  })

  getByPropertyType = asyncHandler(async (req, res) => {
    const tenant = req.gpTenant
    if (!tenant) throw new ApiError(500, 'Tenant context missing')
    const propertyType = String(req.params.propertyType ?? '')
    if (!PROPERTY_TYPE_KEYS.includes(propertyType as (typeof PROPERTY_TYPE_KEYS)[number])) {
      throw new ApiError(422, 'Invalid propertyType')
    }
    const data = await propertyTypeRatesService.getForGpByPropertyType(tenant.id, propertyType)
    return this.ok(res, data, 'Property type rate')
  })

  upsert = asyncHandler(async (req, res) => {
    const tenant = req.gpTenant
    if (!tenant) throw new ApiError(500, 'Tenant context missing')
    const parsed = putBodySchema.safeParse(req.body)
    if (!parsed.success) {
      throw new ApiError(422, 'Invalid request body', parsed.error.issues)
    }
    const data = await propertyTypeRatesService.upsertForGp(tenant.id, parsed.data.rates)
    return this.ok(res, data, 'Property type rates saved')
  })
}

export const propertyTypeRatesController = new PropertyTypeRatesController()
