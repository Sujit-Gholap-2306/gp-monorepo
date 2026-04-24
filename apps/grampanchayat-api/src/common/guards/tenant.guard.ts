import { ApiError } from '../exceptions/http.exception.ts'
import { asyncHandler } from './async-handler.ts'
import { tenantModel } from '../../models/tenant.model.ts'

function firstString(value: string | string[] | undefined): string | undefined {
  if (value === undefined) return undefined
  return Array.isArray(value) ? value[0] : value
}

export const tenantGuard = asyncHandler(async (req, _res, next) => {
  const subdomain = firstString(req.params.subdomain)
  if (!subdomain) throw new ApiError(400, 'Subdomain is required')

  const tenant = await tenantModel.findBySubdomain(subdomain)
  if (!tenant) throw new ApiError(404, 'Tenant not found')

  req.gpTenant = tenant
  next()
})
