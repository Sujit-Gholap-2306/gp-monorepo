import { asyncHandler } from '../common/guards/async-handler.ts'
import { BaseController } from '../common/base/base.controller.ts'
import { tenantService } from '../services/tenant.service.ts'
import { parseTenantSettingsBody } from '../types/tenant-settings.dto.ts'

function firstString(value: string | string[] | undefined): string | undefined {
  if (value === undefined) return undefined
  return Array.isArray(value) ? value[0] : value
}

export class TenantController extends BaseController {
  getTenant = asyncHandler(async (req, res) => {
    const subdomain = firstString(req.params.subdomain) ?? firstString(req.headers['x-tenant'])
    if (!subdomain) {
      return this.fail(400, 'Subdomain is required')
    }

    const tenant = await tenantService.getTenantBySubdomain(subdomain)
    if (!tenant) {
      return this.fail(404, 'Tenant not found')
    }

    return this.ok(res, tenant)
  })

  updateSettings = asyncHandler(async (req, res) => {
    const subdomain = firstString(req.params.subdomain) ?? firstString(req.headers['x-tenant'])
    if (!subdomain) {
      this.fail(400, 'Subdomain is required')
    }

    let payload: ReturnType<typeof parseTenantSettingsBody>
    try {
      payload = parseTenantSettingsBody(
        (req.body ?? {}) as Record<string, unknown>
      )
    } catch (e) {
      this.fail(400, (e as Error).message)
    }

    const updatedTenant = await tenantService.updateSettings(
      subdomain,
      payload,
      req.file
    )

    return this.ok(res, updatedTenant, 'Tenant settings updated successfully')
  })
}

export const tenantController = new TenantController()
