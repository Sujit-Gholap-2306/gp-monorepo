import { BaseController } from '../common/base/base.controller.ts'
import { ApiError } from '../common/exceptions/http.exception.ts'
import { asyncHandler } from '../common/guards/async-handler.ts'
import { namuna56Service } from '../services/namuna56.service.ts'
import { namuna5ListQuerySchema, namuna6ListQuerySchema } from '../types/namuna56.dto.ts'

class Namuna56Controller extends BaseController {
  listNamuna5 = asyncHandler(async (req, res) => {
    const tenant = req.gpTenant
    if (!tenant) throw new ApiError(500, 'Tenant context missing')

    const parsed = namuna5ListQuerySchema.safeParse(req.query)
    if (!parsed.success) {
      throw new ApiError(422, 'Invalid query params', parsed.error.issues)
    }

    const data = await namuna56Service.listNamuna5(tenant.id, parsed.data)
    return this.ok(res, data, 'Namuna 5 cashbook list')
  })

  listNamuna6 = asyncHandler(async (req, res) => {
    const tenant = req.gpTenant
    if (!tenant) throw new ApiError(500, 'Tenant context missing')

    const parsed = namuna6ListQuerySchema.safeParse(req.query)
    if (!parsed.success) {
      throw new ApiError(422, 'Invalid query params', parsed.error.issues)
    }

    const data = await namuna56Service.listNamuna6(tenant.id, parsed.data)
    return this.ok(res, data, 'Namuna 6 classified monthly list')
  })
}

export const namuna56Controller = new Namuna56Controller()
