import { Router } from 'express'
import { userController } from '../controllers/user.controller.ts'
import { authGuard } from '../common/guards/auth.guard.ts'
import { upload } from '../common/guards/upload.guard.ts'

const router = Router()

router.post('/register', userController.register)
router.post('/login', userController.login)
router.post('/logout', authGuard, userController.logout)
router.post('/refresh-token', userController.refreshTokens)
router.get('/me', authGuard, userController.getCurrentUser)
router.patch('/avatar', authGuard, upload.single('avatar'), userController.updateAvatar)

export default router
