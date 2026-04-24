import { asyncHandler } from '../common/guards/async-handler.ts'
import { BaseController } from '../common/base/base.controller.ts'
import { postHoldersService } from '../services/post-holders.service.ts'
import { createPostHolderSchema, updatePostHolderSchema } from '../types/post-holders.dto.ts'
import { ApiError } from '../common/exceptions/http.exception.ts'

class PostHoldersController extends BaseController {
  list = asyncHandler(async (req, res) => {
    const tenant = req.gpTenant
    if (!tenant) throw new ApiError(500, 'Tenant context missing')
    const data = await postHoldersService.list(tenant.id)
    return this.ok(res, data, 'Post holders retrieved')
  })

  getById = asyncHandler(async (req, res) => {
    const tenant = req.gpTenant
    if (!tenant) throw new ApiError(500, 'Tenant context missing')
    const data = await postHoldersService.getById(tenant.id, req.params.id as string)
    return this.ok(res, data, 'Post holder retrieved')
  })

  create = asyncHandler(async (req, res) => {
    const tenant = req.gpTenant
    if (!tenant) throw new ApiError(500, 'Tenant context missing')
    const parsed = createPostHolderSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new ApiError(422, 'Invalid request body', parsed.error.issues)
    }
    const data = await postHoldersService.create(tenant.id, parsed.data)
    return this.created(res, data, 'Post holder created')
  })

  update = asyncHandler(async (req, res) => {
    const tenant = req.gpTenant
    if (!tenant) throw new ApiError(500, 'Tenant context missing')
    const parsed = updatePostHolderSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new ApiError(422, 'Invalid request body', parsed.error.issues)
    }
    const data = await postHoldersService.update(tenant.id, req.params.id as string, parsed.data)
    return this.ok(res, data, 'Post holder updated')
  })

  delete = asyncHandler(async (req, res) => {
    const tenant = req.gpTenant
    if (!tenant) throw new ApiError(500, 'Tenant context missing')
    await postHoldersService.delete(tenant.id, req.params.id as string)
    return this.noContent(res)
  })
}

export const postHoldersController = new PostHoldersController()
