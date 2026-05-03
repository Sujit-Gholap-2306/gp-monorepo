import { BaseController } from '../common/base/base.controller.ts'
import { ApiError } from '../common/exceptions/http.exception.ts'
import { asyncHandler } from '../common/guards/async-handler.ts'
import { namuna10Service } from '../services/namuna10.service.ts'
import { namuna10CreateBodySchema, namuna10IdParamsSchema, namuna10ListQuerySchema, namuna10VoidBodySchema } from '../types/namuna10.dto.ts'

class Namuna10Controller extends BaseController {
  list = asyncHandler(async (req, res) => {
    const tenant = req.gpTenant
    if (!tenant) throw new ApiError(500, 'Tenant context missing')

    const parsed = namuna10ListQuerySchema.safeParse(req.query)
    if (!parsed.success) throw new ApiError(422, 'Invalid query params', parsed.error.issues)
    const { q, fiscal_year: fiscalYear, property_id: propertyId, water_connection_id: waterConnectionId, book_type: bookType, limit, offset } = parsed.data

    const data = await namuna10Service.list(tenant.id, {
      q,
      propertyId,
      waterConnectionId,
      bookType,
      fiscalYear,
      limit,
      offset,
    })
    return this.ok(res, data, 'Receipts loaded')
  })

  getById = asyncHandler(async (req, res) => {
    const tenant = req.gpTenant
    if (!tenant) throw new ApiError(500, 'Tenant context missing')

    const parsedParams = namuna10IdParamsSchema.safeParse(req.params)
    if (!parsedParams.success) throw new ApiError(422, 'Invalid receipt id', parsedParams.error.issues)

    const data = await namuna10Service.getById(tenant.id, parsedParams.data.id)
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

  voidReceipt = asyncHandler(async (req, res) => {
    const tenant = req.gpTenant
    if (!tenant) throw new ApiError(500, 'Tenant context missing')

    const actorId = req.supabaseUser?.id
    if (!actorId) throw new ApiError(401, 'Unauthorized')

    const parsedParams = namuna10IdParamsSchema.safeParse(req.params)
    if (!parsedParams.success) throw new ApiError(422, 'Invalid receipt id', parsedParams.error.issues)

    const parsed = namuna10VoidBodySchema.safeParse(req.body)
    if (!parsed.success) {
      throw new ApiError(422, 'Invalid body', parsed.error.issues)
    }

    const data = await namuna10Service.voidReceipt(tenant.id, actorId, parsedParams.data.id, parsed.data.reason)
    return this.ok(res, data, 'Receipt voided')
  })
}

export const namuna10Controller = new Namuna10Controller()
