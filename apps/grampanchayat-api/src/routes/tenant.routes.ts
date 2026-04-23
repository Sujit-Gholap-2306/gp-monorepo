import { Router } from 'express'
import { tenantController } from '../controllers/tenant.controller.ts'
import { supabaseTenantAdminGuard } from '../common/guards/supabase-tenant.guard.ts'
import { upload } from '../common/guards/upload.guard.ts'

const router = Router()

// Public - Get tenant details
router.get('/:subdomain', tenantController.getTenant)

// Protected - Update tenant settings (used by admin)
router.put(
  '/:subdomain/settings',
  supabaseTenantAdminGuard,
  upload.single('logo'),
  tenantController.updateSettings
)

export default router
