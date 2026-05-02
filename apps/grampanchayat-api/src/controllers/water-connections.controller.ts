import { BaseController } from '../common/base/base.controller.ts'
import { ApiError } from '../common/exceptions/http.exception.ts'
import { asyncHandler } from '../common/guards/async-handler.ts'
import { waterConnectionsService } from '../services/water-connections.service.ts'
import {
  createWaterConnectionSchema,
  setWaterConnectionStatusSchema,
  updateWaterConnectionSchema,
  waterConnectionIdParamsSchema,
  waterConnectionListQuerySchema,
} from '../types/water-connections.dto.ts'

class WaterConnectionsController extends BaseController {
  list = asyncHandler(async (req, res) => {
    const tenant = req.gpTenant
    if (!tenant) throw new ApiError(500, 'Tenant context missing')
    const parsed = waterConnectionListQuerySchema.safeParse(req.query)
    if (!parsed.success) throw new ApiError(422, 'Invalid query params', parsed.error.issues)
    const data = await waterConnectionsService.list(tenant.id, parsed.data)
    return this.ok(res, data, 'Water connections retrieved')
  })

  getById = asyncHandler(async (req, res) => {
    const tenant = req.gpTenant
    if (!tenant) throw new ApiError(500, 'Tenant context missing')
    const parsed = waterConnectionIdParamsSchema.safeParse(req.params)
    if (!parsed.success) throw new ApiError(422, 'Invalid params', parsed.error.issues)
    const data = await waterConnectionsService.getById(tenant.id, parsed.data.id)
    return this.ok(res, data, 'Water connection retrieved')
  })

  create = asyncHandler(async (req, res) => {
    const tenant = req.gpTenant
    if (!tenant) throw new ApiError(500, 'Tenant context missing')
    const parsed = createWaterConnectionSchema.safeParse(req.body)
    if (!parsed.success) throw new ApiError(422, 'Invalid request body', parsed.error.issues)
    const data = await waterConnectionsService.create(tenant.id, parsed.data)
    return this.created(res, data, 'Water connection created')
  })

  update = asyncHandler(async (req, res) => {
    const tenant = req.gpTenant
    if (!tenant) throw new ApiError(500, 'Tenant context missing')
    const parsedParams = waterConnectionIdParamsSchema.safeParse(req.params)
    if (!parsedParams.success) throw new ApiError(422, 'Invalid params', parsedParams.error.issues)
    const parsedBody = updateWaterConnectionSchema.safeParse(req.body)
    if (!parsedBody.success) throw new ApiError(422, 'Invalid request body', parsedBody.error.issues)
    const data = await waterConnectionsService.update(tenant.id, parsedParams.data.id, parsedBody.data)
    return this.ok(res, data, 'Water connection updated')
  })

  setStatus = asyncHandler(async (req, res) => {
    const tenant = req.gpTenant
    if (!tenant) throw new ApiError(500, 'Tenant context missing')
    const parsedParams = waterConnectionIdParamsSchema.safeParse(req.params)
    if (!parsedParams.success) throw new ApiError(422, 'Invalid params', parsedParams.error.issues)
    const parsedBody = setWaterConnectionStatusSchema.safeParse(req.body)
    if (!parsedBody.success) throw new ApiError(422, 'Invalid request body', parsedBody.error.issues)
    const data = await waterConnectionsService.setStatus(tenant.id, parsedParams.data.id, parsedBody.data)
    return this.ok(res, data, 'Water connection status updated')
  })
}

export const waterConnectionsController = new WaterConnectionsController()
