import { Router } from 'express'
import { namuna8Controller } from '../controllers/namuna8.controller.ts'

const router = Router()

router.get('/8', namuna8Controller.list)
router.get('/8/:propertyId', namuna8Controller.getByPropertyId)

export default router
