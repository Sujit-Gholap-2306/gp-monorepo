import { asyncHandler }   from '../../common/guards/async-handler.js'
import { BaseController }  from '../../common/base/base.controller.js'
import { validate }        from '../../common/pipes/validation.pipe.js'
import { registerDto, loginDto } from './dto/index.js'
import type { IUserService } from './interfaces/user.interface.js'
import { COOKIE_OPTIONS }  from '../../config/index.js'

export class UserController extends BaseController {
  constructor(private readonly userService: IUserService) {
    super()
  }

  register = asyncHandler(async (req, res) => {
    const dto  = validate(registerDto, req.body)
    const user = await this.userService.register(dto)
    return this.created(res, user, 'User registered successfully')
  })

  login = asyncHandler(async (req, res) => {
    const dto    = validate(loginDto, req.body)
    const result = await this.userService.login(dto)
    return res
      .cookie('accessToken',  result.accessToken,  COOKIE_OPTIONS)
      .cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS)
      .status(200)
      .json({ statusCode: 200, data: result, success: true })
  })

  logout = asyncHandler(async (req, res) => {
    await this.userService.logout(req.user!.id)
    return res
      .clearCookie('accessToken',  COOKIE_OPTIONS)
      .clearCookie('refreshToken', COOKIE_OPTIONS)
      .status(200)
      .json({ statusCode: 200, data: {}, message: 'Logged out', success: true })
  })

  refreshTokens = asyncHandler(async (req, res) => {
    const incomingToken = req.cookies?.refreshToken ?? req.body.refreshToken
    if (!incomingToken) this.fail(401, 'Unauthorized')
    const tokens = await this.userService.refreshTokens(incomingToken)
    return res
      .cookie('accessToken',  tokens.accessToken,  COOKIE_OPTIONS)
      .cookie('refreshToken', tokens.refreshToken, COOKIE_OPTIONS)
      .status(200)
      .json({ statusCode: 200, data: tokens, success: true })
  })

  getCurrentUser = asyncHandler(async (req, res) => {
    return this.ok(res, req.user)
  })

  updateAvatar = asyncHandler(async (req, res) => {
    if (!req.file) this.fail(400, 'Avatar file required')
    const url = await this.userService.updateAvatar(req.user!.id, req.file!)
    return this.ok(res, { avatarUrl: url }, 'Avatar updated')
  })
}
