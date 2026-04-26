import { BaseController } from '../common/base/base.controller.ts'
import { ApiError } from '../common/exceptions/http.exception.ts'
import { asyncHandler } from '../common/guards/async-handler.ts'
import { onboardingService } from '../services/onboarding.service.ts'

class OnboardingController extends BaseController {
  getStatus = asyncHandler(async (req, res) => {
    const tenant = req.gpTenant
    if (!tenant) throw new ApiError(500, 'Tenant context missing')

    const data = await onboardingService.getStatus(tenant.id)
    return this.ok(res, data, 'Onboarding status loaded')
  })

  markReady = asyncHandler(async (req, res) => {
    const tenant = req.gpTenant
    if (!tenant) throw new ApiError(500, 'Tenant context missing')

    const data = await onboardingService.markReady(tenant.id)
    return this.ok(res, data, 'GP marked as ready')
  })
}

export const onboardingController = new OnboardingController()
