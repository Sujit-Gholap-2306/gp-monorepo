import { Router } from 'express'
import userRouter from './user.routes.ts'
import tenantRouter from './tenant.routes.ts'

const router = Router()

router.use('/users', userRouter)
router.use('/tenants', tenantRouter)

export default router
