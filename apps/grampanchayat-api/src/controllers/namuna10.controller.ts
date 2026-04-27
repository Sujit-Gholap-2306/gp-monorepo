import { BaseController } from '../common/base/base.controller.ts'
import { ApiError } from '../common/exceptions/http.exception.ts'
import { asyncHandler } from '../common/guards/async-handler.ts'
import { namuna10Service } from '../services/namuna10.service.ts'
import { namuna10CreateBodySchema } from '../types/namuna10.dto.ts'

class Namuna10Controller extends BaseController {
  list = asyncHandler(async (req, res) => {
    const tenant = req.gpTenant
    if (!tenant) throw new ApiError(500, 'Tenant context missing')

    const q = typeof req.query.q === 'string' ? req.query.q : undefined
    const fiscalYear = typeof req.query.fiscal_year === 'string' ? req.query.fiscal_year : undefined
    const limitRaw = typeof req.query.limit === 'string' ? Number(req.query.limit) : undefined
    const offsetRaw = typeof req.query.offset === 'string' ? Number(req.query.offset) : undefined
    const limit = Number.isFinite(limitRaw) ? limitRaw : undefined
    const offset = Number.isFinite(offsetRaw) ? offsetRaw : undefined

    const propertyIdRaw = typeof req.query.property_id === 'string' ? req.query.property_id : undefined
    if (propertyIdRaw !== undefined && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(propertyIdRaw)) {
      throw new ApiError(422, 'property_id must be a valid UUID')
    }
    const propertyId = propertyIdRaw

    const data = await namuna10Service.list(tenant.id, { q, propertyId, fiscalYear, limit, offset })
    return this.ok(res, data, 'Receipts loaded')
  })

  getById = asyncHandler(async (req, res) => {
    const tenant = req.gpTenant
    if (!tenant) throw new ApiError(500, 'Tenant context missing')

    const id = req.params.id as string | undefined
    if (!id) throw new ApiError(422, 'Receipt id is required')

    const data = await namuna10Service.getById(tenant.id, id)
    return this.ok(res, data, 'Receipt loaded')
  })

  create = asyncHandler(async (req, res) => {
    const tenant = req.gpTenant
    if (!tenant) throw new ApiError(500, 'Tenant context missing')

    const actorId = req.supabaseUser?.id
    if (!actorId) throw new ApiError(401, 'Unauthorized')

    const parsed = namuna10CreateBodySchema.safeParse(req.body)
    if (!parsed.success) {
      throw new ApiError(422, 'Invalid body', parsed.error.issues)
    }

    const data = await namuna10Service.create(tenant.id, actorId, parsed.data)
    return this.created(res, data, 'Receipt created')
  })
}

export const namuna10Controller = new Namuna10Controller()
