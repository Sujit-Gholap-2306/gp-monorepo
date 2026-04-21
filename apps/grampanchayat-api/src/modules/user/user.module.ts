import { UserRepository } from './user.repository.js'
import { UserService }    from './user.service.js'
import { UserController } from './user.controller.js'
import { authService }    from '../auth/auth.module.js'
import { storageService } from '../storage/storage.module.js'

const userRepository = new UserRepository()
const userService    = new UserService(userRepository, authService, storageService)
export const userController = new UserController(userService)
