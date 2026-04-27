import { Router } from 'express'
import { memoryUploadSingle } from '../common/guards/bulk-upload.guard.ts'
import { bulkImportRateLimit } from '../common/guards/rate-limit.guard.ts'
import { requireFeature } from '../common/guards/tier.guard.ts'
import { namuna8Controller } from '../controllers/namuna8.controller.ts'
import { namuna10Controller } from '../controllers/namuna10.controller.ts'
import { namuna9Controller } from '../controllers/namuna9.controller.ts'

const router = Router()

router.get('/8', requireFeature('tax'), namuna8Controller.list)
router.get('/8/:propertyId', requireFeature('tax'), namuna8Controller.getByPropertyId)
router.get('/9', requireFeature('tax'), namuna9Controller.list)
router.get('/9/citizens', requireFeature('tax'), namuna9Controller.listCitizens)
router.get('/9/opening-template', requireFeature('tax'), namuna9Controller.downloadOpeningTemplate)
router.post(
  '/9/opening-balances',
  requireFeature('tax'),
  bulkImportRateLimit,
  memoryUploadSingle.single('file'),
  namuna9Controller.importOpeningBalances
)
router.post('/9/generate', requireFeature('tax'), namuna9Controller.generate)
router.get('/9/:id', requireFeature('tax'), namuna9Controller.getById)
router.get('/10', requireFeature('tax'), namuna10Controller.list)
router.get('/10/:id', requireFeature('tax'), namuna10Controller.getById)
router.post('/10', requireFeature('tax'), namuna10Controller.create)

export default router
