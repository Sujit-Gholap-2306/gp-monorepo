import { asyncHandler } from '../common/guards/async-handler.ts'
import { BaseController } from '../common/base/base.controller.ts'
import { galleryService } from '../services/gallery.service.ts'
import { createGalleryItemSchema, updateGalleryItemSchema } from '../types/gallery.dto.ts'
import { ApiError } from '../common/exceptions/http.exception.ts'

class GalleryController extends BaseController {
  list = asyncHandler(async (req, res) => {
    const tenant = req.gpTenant
    if (!tenant) throw new ApiError(500, 'Tenant context missing')
    const data = await galleryService.list(tenant.id)
    return this.ok(res, data, 'Gallery items retrieved')
  })

  getById = asyncHandler(async (req, res) => {
    const tenant = req.gpTenant
    if (!tenant) throw new ApiError(500, 'Tenant context missing')
    const data = await galleryService.getById(tenant.id, req.params.id as string)
    return this.ok(res, data, 'Gallery item retrieved')
  })

  create = asyncHandler(async (req, res) => {
    const tenant = req.gpTenant
    if (!tenant) throw new ApiError(500, 'Tenant context missing')
    const parsed = createGalleryItemSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new ApiError(422, 'Invalid request body', parsed.error.issues)
    }
    const data = await galleryService.create(tenant.id, parsed.data)
    return this.created(res, data, 'Gallery item created')
  })

  update = asyncHandler(async (req, res) => {
    const tenant = req.gpTenant
    if (!tenant) throw new ApiError(500, 'Tenant context missing')
    const parsed = updateGalleryItemSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new ApiError(422, 'Invalid request body', parsed.error.issues)
    }
    const data = await galleryService.update(tenant.id, req.params.id as string, parsed.data)
    return this.ok(res, data, 'Gallery item updated')
  })

  delete = asyncHandler(async (req, res) => {
    const tenant = req.gpTenant
    if (!tenant) throw new ApiError(500, 'Tenant context missing')
    await galleryService.delete(tenant.id, req.params.id as string)
    return this.noContent(res)
  })
}

export const galleryController = new GalleryController()
