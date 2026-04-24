import { asyncHandler } from '../common/guards/async-handler.ts'
import { BaseController } from '../common/base/base.controller.ts'
import { gpAdminsService } from '../services/gp-admins.service.ts'
import { createGpAdminSchema, updateGpAdminSchema } from '../types/gp-admins.dto.ts'
import { ApiError } from '../common/exceptions/http.exception.ts'

class GpAdminsController extends BaseController {
  list = asyncHandler(async (req, res) => {
    const tenant = req.gpTenant
    if (!tenant) throw new ApiError(500, 'Tenant context missing')
    const data = await gpAdminsService.list(tenant.id)
    return this.ok(res, data, 'GP Admins retrieved')
  })

  getMe = asyncHandler(async (req, res) => {
    const tenant = req.gpTenant
    const user = req.supabaseUser
    if (!tenant || !user) throw new ApiError(500, 'Context missing')
    const data = await gpAdminsService.getMe(tenant.id, user.id)
    return this.ok(res, data, 'Current GP Admin retrieved')
  })

  getById = asyncHandler(async (req, res) => {
    const tenant = req.gpTenant
    if (!tenant) throw new ApiError(500, 'Tenant context missing')
    const data = await gpAdminsService.getById(tenant.id, req.params.id as string)
    return this.ok(res, data, 'GP Admin retrieved')
  })

  create = asyncHandler(async (req, res) => {
    const tenant = req.gpTenant
    if (!tenant) throw new ApiError(500, 'Tenant context missing')
    const parsed = createGpAdminSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new ApiError(422, 'Invalid request body', parsed.error.issues)
    }
    const data = await gpAdminsService.create(tenant.id, parsed.data)
    return this.created(res, data, 'GP Admin created')
  })

  update = asyncHandler(async (req, res) => {
    const tenant = req.gpTenant
    if (!tenant) throw new ApiError(500, 'Tenant context missing')
    const parsed = updateGpAdminSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new ApiError(422, 'Invalid request body', parsed.error.issues)
    }
    const data = await gpAdminsService.update(tenant.id, req.params.id as string, parsed.data)
    return this.ok(res, data, 'GP Admin updated')
  })

  delete = asyncHandler(async (req, res) => {
    const tenant = req.gpTenant
    if (!tenant) throw new ApiError(500, 'Tenant context missing')
    await gpAdminsService.delete(tenant.id, req.params.id as string)
    return this.noContent(res)
  })
}

export const gpAdminsController = new GpAdminsController()
