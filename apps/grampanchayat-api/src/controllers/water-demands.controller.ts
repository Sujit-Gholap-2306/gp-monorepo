import { BaseController } from '../common/base/base.controller.ts'
import { ApiError } from '../common/exceptions/http.exception.ts'
import { asyncHandler } from '../common/guards/async-handler.ts'
import { waterDemandsService } from '../services/water-demands.service.ts'
import {
  waterDemandGenerateBodySchema,
  waterDemandListQuerySchema,
  waterDemandRateMasterStatusQuerySchema,
} from '../types/water-demands.dto.ts'

class WaterDemandsController extends BaseController {
  rateMasterStatus = asyncHandler(async (req, res) => {
    const tenant = req.gpTenant
    if (!tenant) throw new ApiError(500, 'Tenant context missing')
    const parsed = waterDemandRateMasterStatusQuerySchema.safeParse(req.query)
    if (!parsed.success) throw new ApiError(422, 'Invalid query params', parsed.error.issues)
    const data = await waterDemandsService.getRateMasterStatus(tenant.id, parsed.data.fiscal_year)
    return this.ok(res, data, 'Water demand rate-master status')
  })

  generate = asyncHandler(async (req, res) => {
    const tenant = req.gpTenant
    if (!tenant) throw new ApiError(500, 'Tenant context missing')
    const parsed = waterDemandGenerateBodySchema.safeParse(req.body ?? {})
    if (!parsed.success) throw new ApiError(422, 'Invalid request body', parsed.error.issues)
    const data = await waterDemandsService.generate(
      tenant.id,
      req.supabaseUser?.id ?? null,
      parsed.data.fiscal_year
    )
    return this.ok(res, data, 'Water demands generated')
  })

  list = asyncHandler(async (req, res) => {
    const tenant = req.gpTenant
    if (!tenant) throw new ApiError(500, 'Tenant context missing')
    const parsed = waterDemandListQuerySchema.safeParse(req.query)
    if (!parsed.success) throw new ApiError(422, 'Invalid query params', parsed.error.issues)
    const data = await waterDemandsService.list(tenant.id, parsed.data)
    return this.ok(res, data, 'Water demands list')
  })
}

export const waterDemandsController = new WaterDemandsController()
