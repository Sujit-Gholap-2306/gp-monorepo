import { BaseController } from '../common/base/base.controller.ts'
import { ApiError } from '../common/exceptions/http.exception.ts'
import { asyncHandler } from '../common/guards/async-handler.ts'
import { namuna8Service } from '../services/namuna8.service.ts'
import { namuna8ListQuerySchema, namuna8PropertyParamsSchema } from '../types/namuna8.dto.ts'

class Namuna8Controller extends BaseController {
  list = asyncHandler(async (req, res) => {
    const tenant = req.gpTenant
    if (!tenant) throw new ApiError(500, 'Tenant context missing')

    const parsed = namuna8ListQuerySchema.safeParse(req.query)
    if (!parsed.success) {
      throw new ApiError(422, 'Invalid query params', parsed.error.issues)
    }

    const data = await namuna8Service.list(tenant.id, parsed.data)
    return this.ok(res, data, 'Namuna 8 list')
  })

  getByPropertyId = asyncHandler(async (req, res) => {
    const tenant = req.gpTenant
    if (!tenant) throw new ApiError(500, 'Tenant context missing')

    const parsed = namuna8PropertyParamsSchema.safeParse(req.params)
    if (!parsed.success) {
      throw new ApiError(422, 'Invalid path params', parsed.error.issues)
    }

    const data = await namuna8Service.getByPropertyId(tenant.id, parsed.data.propertyId)
    return this.ok(res, data, 'Namuna 8 property detail')
  })
}

export const namuna8Controller = new Namuna8Controller()
