import { asyncHandler } from '../common/guards/async-handler.ts'
import { BaseController } from '../common/base/base.controller.ts'
import { announcementsService } from '../services/announcements.service.ts'
import { createAnnouncementSchema, updateAnnouncementSchema } from '../types/announcements.dto.ts'
import { ApiError } from '../common/exceptions/http.exception.ts'

class AnnouncementsController extends BaseController {
  list = asyncHandler(async (req, res) => {
    const tenant = req.gpTenant
    if (!tenant) throw new ApiError(500, 'Tenant context missing')
    const isPublished = req.query.published === 'true' ? true : req.query.published === 'false' ? false : undefined
    const data = await announcementsService.list(tenant.id, isPublished)
    return this.ok(res, data, 'Announcements retrieved')
  })

  getById = asyncHandler(async (req, res) => {
    const tenant = req.gpTenant
    if (!tenant) throw new ApiError(500, 'Tenant context missing')
    const data = await announcementsService.getById(tenant.id, req.params.id as string)
    return this.ok(res, data, 'Announcement retrieved')
  })

  create = asyncHandler(async (req, res) => {
    const tenant = req.gpTenant
    if (!tenant) throw new ApiError(500, 'Tenant context missing')
    const parsed = createAnnouncementSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new ApiError(422, 'Invalid request body', parsed.error.issues)
    }
    const data = await announcementsService.create(tenant.id, parsed.data)
    return this.created(res, data, 'Announcement created')
  })

  update = asyncHandler(async (req, res) => {
    const tenant = req.gpTenant
    if (!tenant) throw new ApiError(500, 'Tenant context missing')
    const parsed = updateAnnouncementSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new ApiError(422, 'Invalid request body', parsed.error.issues)
    }
    const data = await announcementsService.update(tenant.id, req.params.id as string, parsed.data)
    return this.ok(res, data, 'Announcement updated')
  })

  delete = asyncHandler(async (req, res) => {
    const tenant = req.gpTenant
    if (!tenant) throw new ApiError(500, 'Tenant context missing')
    await announcementsService.delete(tenant.id, req.params.id as string)
    return this.noContent(res)
  })
}

export const announcementsController = new AnnouncementsController()
