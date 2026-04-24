import { asyncHandler } from '../common/guards/async-handler.ts'
import { BaseController } from '../common/base/base.controller.ts'
import { eventsService } from '../services/events.service.ts'
import { createEventSchema, updateEventSchema } from '../types/events.dto.ts'
import { ApiError } from '../common/exceptions/http.exception.ts'

class EventsController extends BaseController {
  list = asyncHandler(async (req, res) => {
    const tenant = req.gpTenant
    if (!tenant) throw new ApiError(500, 'Tenant context missing')
    const isPublished = req.query.published === 'true' ? true : req.query.published === 'false' ? false : undefined
    const data = await eventsService.list(tenant.id, isPublished)
    return this.ok(res, data, 'Events retrieved')
  })

  getById = asyncHandler(async (req, res) => {
    const tenant = req.gpTenant
    if (!tenant) throw new ApiError(500, 'Tenant context missing')
    const data = await eventsService.getById(tenant.id, req.params.id as string)
    return this.ok(res, data, 'Event retrieved')
  })

  create = asyncHandler(async (req, res) => {
    const tenant = req.gpTenant
    if (!tenant) throw new ApiError(500, 'Tenant context missing')
    const parsed = createEventSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new ApiError(422, 'Invalid request body', parsed.error.issues)
    }
    const data = await eventsService.create(tenant.id, parsed.data)
    return this.created(res, data, 'Event created')
  })

  update = asyncHandler(async (req, res) => {
    const tenant = req.gpTenant
    if (!tenant) throw new ApiError(500, 'Tenant context missing')
    const parsed = updateEventSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new ApiError(422, 'Invalid request body', parsed.error.issues)
    }
    const data = await eventsService.update(tenant.id, req.params.id as string, parsed.data)
    return this.ok(res, data, 'Event updated')
  })

  delete = asyncHandler(async (req, res) => {
    const tenant = req.gpTenant
    if (!tenant) throw new ApiError(500, 'Tenant context missing')
    await eventsService.delete(tenant.id, req.params.id as string)
    return this.noContent(res)
  })
}

export const eventsController = new EventsController()
