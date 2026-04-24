import { asyncHandler } from '../common/guards/async-handler.ts'
import { BaseController } from '../common/base/base.controller.ts'
import { eventMediaService } from '../services/event-media.service.ts'
import { createEventMediaSchema, updateEventMediaSchema } from '../types/event-media.dto.ts'
import { ApiError } from '../common/exceptions/http.exception.ts'

class EventMediaController extends BaseController {
  list = asyncHandler(async (req, res) => {
    const tenant = req.gpTenant
    if (!tenant) throw new ApiError(500, 'Tenant context missing')
    const data = await eventMediaService.list(tenant.id, req.params.eventId as string)
    return this.ok(res, data, 'Event media retrieved')
  })

  getById = asyncHandler(async (req, res) => {
    const tenant = req.gpTenant
    if (!tenant) throw new ApiError(500, 'Tenant context missing')
    const data = await eventMediaService.getById(tenant.id, req.params.eventId as string, req.params.id as string)
    return this.ok(res, data, 'Event media retrieved')
  })

  create = asyncHandler(async (req, res) => {
    const tenant = req.gpTenant
    if (!tenant) throw new ApiError(500, 'Tenant context missing')
    const parsed = createEventMediaSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new ApiError(422, 'Invalid request body', parsed.error.issues)
    }
    const data = await eventMediaService.create(tenant.id, req.params.eventId as string, parsed.data)
    return this.created(res, data, 'Event media created')
  })

  update = asyncHandler(async (req, res) => {
    const tenant = req.gpTenant
    if (!tenant) throw new ApiError(500, 'Tenant context missing')
    const parsed = updateEventMediaSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new ApiError(422, 'Invalid request body', parsed.error.issues)
    }
    const data = await eventMediaService.update(tenant.id, req.params.eventId as string, req.params.id as string, parsed.data)
    return this.ok(res, data, 'Event media updated')
  })

  delete = asyncHandler(async (req, res) => {
    const tenant = req.gpTenant
    if (!tenant) throw new ApiError(500, 'Tenant context missing')
    await eventMediaService.delete(tenant.id, req.params.eventId as string, req.params.id as string)
    return this.noContent(res)
  })
}

export const eventMediaController = new EventMediaController()
