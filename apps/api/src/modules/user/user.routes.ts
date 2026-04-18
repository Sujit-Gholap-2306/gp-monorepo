import { Router } from 'express'
import { authGuard }      from '../../common/guards/auth.guard.js'
import { authRateLimit }  from '../../common/guards/rate-limit.guard.js'
import { upload }         from '../../common/guards/upload.guard.js'
import { userController } from './user.module.js'

const router = Router()

router.post('/register',       authRateLimit, userController.register)
router.post('/login',          authRateLimit, userController.login)
router.post('/refresh-tokens', authRateLimit, userController.refreshTokens)

router.use(authGuard)
router.post('/logout',      userController.logout)
router.get('/current-user', userController.getCurrentUser)
router.patch('/avatar', upload.single('avatar'), userController.updateAvatar)

export default router
