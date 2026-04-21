import { Router } from 'express'
import { tenantController } from '../controllers/tenant.controller.ts'
import { authGuard } from '../common/guards/auth.guard.ts'
import { upload } from '../common/guards/upload.guard.ts'

const router = Router()

// Public - Get tenant details
router.get('/:subdomain', tenantController.getTenant)

// Protected - Update tenant settings (used by admin)
router.put(
  '/:subdomain/settings',
  authGuard,
  upload.single('logo'),
  tenantController.updateSettings
)

export default router
