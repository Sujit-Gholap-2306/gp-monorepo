import { BaseController } from '../common/base/base.controller.ts'
import { ApiError } from '../common/exceptions/http.exception.ts'
import { asyncHandler } from '../common/guards/async-handler.ts'
import { waterConnectionRatesService } from '../services/water-connection-rates.service.ts'
import {
  waterConnectionRatesListQuerySchema,
  waterConnectionRatesUpsertBodySchema,
} from '../types/water-connection-rates.dto.ts'

class WaterConnectionRatesController extends BaseController {
  list = asyncHandler(async (req, res) => {
    const tenant = req.gpTenant
    if (!tenant) throw new ApiError(500, 'Tenant context missing')
    const parsed = waterConnectionRatesListQuerySchema.safeParse(req.query)
    if (!parsed.success) {
      throw new ApiError(422, 'Invalid query params', parsed.error.issues)
    }
    const data = await waterConnectionRatesService.listForGp(tenant.id, parsed.data)
    return this.ok(res, data, 'Water connection rates')
  })

  upsert = asyncHandler(async (req, res) => {
    const tenant = req.gpTenant
    if (!tenant) throw new ApiError(500, 'Tenant context missing')
    const parsed = waterConnectionRatesUpsertBodySchema.safeParse(req.body)
    if (!parsed.success) {
      throw new ApiError(422, 'Invalid request body', parsed.error.issues)
    }
    const data = await waterConnectionRatesService.upsertForGp(tenant.id, parsed.data.rates)
    return this.ok(res, data, 'Water connection rates saved')
  })
}

export const waterConnectionRatesController = new WaterConnectionRatesController()
