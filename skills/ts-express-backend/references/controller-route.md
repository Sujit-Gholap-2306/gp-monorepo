# Controller & Route Patterns

## Controller Structure (class-based)

Controllers extend `BaseController` and use arrow methods (not regular methods) so `this` binding is preserved when passed to Express route handlers.

Pattern per method:
1. Validate input with `validate(dto, req.body)`
2. Call service method
3. Return via `this.ok()` / `this.created()` / `this.fail()`

```ts
// src/modules/video/video.controller.ts
import { asyncHandler }   from '../../common/guards/async-handler'
import { BaseController } from '../../common/base/base.controller'
import { validate }       from '../../common/pipes/validation.pipe'
import { createVideoDto, updateVideoDto } from './dto'
import type { IVideoService } from './interfaces/video.interface'

export class VideoController extends BaseController {
  constructor(private readonly videoService: IVideoService) {
    super()
  }

  // Arrow methods — REQUIRED for correct `this` binding in Express
  getAll = asyncHandler(async (req, res) => {
    const page  = Math.max(1, Number(req.query.page) || 1)
    const limit = Math.min(50, Number(req.query.limit) || 20)
    const q     = String(req.query.q || '')

    const result = await this.videoService.findAll({ page, limit, q })
    return this.ok(res, result)
  })

  getById = asyncHandler(async (req, res) => {
    const video = await this.videoService.findById(req.params.videoId)
    if (!video) this.fail(404, 'Video not found')
    return this.ok(res, video)
  })

  publish = asyncHandler(async (req, res) => {
    const dto   = validate(createVideoDto, req.body)
    const files = req.files as { [k: string]: Express.Multer.File[] }

    if (!files?.videoFile?.[0]) this.fail(400, 'Video file is required')

    const video = await this.videoService.publish({
      ...dto,
      ownerId:       req.user!.id,
      videoFile:     files.videoFile[0],
      thumbnailFile: files.thumbnail?.[0],
    })
    return this.created(res, video, 'Video published')
  })

  update = asyncHandler(async (req, res) => {
    const dto     = validate(updateVideoDto, req.body)
    const updated = await this.videoService.update(req.params.videoId, req.user!.id, dto)
    return this.ok(res, updated, 'Video updated')
  })

  remove = asyncHandler(async (req, res) => {
    await this.videoService.remove(req.params.videoId, req.user!.id)
    return this.noContent(res)
  })

  togglePublish = asyncHandler(async (req, res) => {
    const updated = await this.videoService.togglePublish(req.params.videoId, req.user!.id)
    return this.ok(res, updated, `Video ${updated.isPublished ? 'published' : 'unpublished'}`)
  })
}
```

---

## Module Composition

```ts
// src/modules/video/video.module.ts
import { VideoRepository }  from './video.repository'
import { VideoService }     from './video.service'
import { VideoController }  from './video.controller'
import { storageService }   from '../storage/storage.module'

const videoRepository = new VideoRepository()
const videoService    = new VideoService(videoRepository, storageService)
export const videoController = new VideoController(videoService)
```

---

## Route Definition

```ts
// src/modules/video/video.routes.ts
import { Router } from 'express'
import { authGuard }       from '../../common/guards/auth.guard'
import { upload }          from '../../common/guards/upload.guard'
import { videoController } from './video.module'

const router = Router()

// Public
router.get('/',          videoController.getAll)
router.get('/:videoId',  videoController.getById)

// Protected
router.use(authGuard)
router.post('/', upload.fields([
  { name: 'videoFile',  maxCount: 1 },
  { name: 'thumbnail',  maxCount: 1 },
]), videoController.publish)
router.patch('/:videoId',               videoController.update)
router.delete('/:videoId',              videoController.remove)
router.patch('/:videoId/toggle-publish', videoController.togglePublish)

export default router
```

---

## Routes Index (mount all modules)

```ts
// src/routes/index.ts
import { Router } from 'express'
import userRouter  from '../modules/user/user.routes'
import videoRouter from '../modules/video/video.routes'

const router = Router()
router.use('/users',  userRouter)
router.use('/videos', videoRouter)
export default router
```

In `app.ts`:
```ts
import routes from './routes'
app.use('/api/v1', routes)
```

---

## DTO Pattern (zod schemas + inferred types)

```ts
// src/modules/video/dto/create-video.dto.ts
import { z } from 'zod'

export const createVideoDto = z.object({
  title:       z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
})

export type CreateVideoDto = z.infer<typeof createVideoDto>

// src/modules/video/dto/update-video.dto.ts
import { createVideoDto } from './create-video.dto'
export const updateVideoDto = createVideoDto.partial()
export type UpdateVideoDto  = z.infer<typeof updateVideoDto>
```

---

## VideoService (service layer example)

Shows how a service handles authorization logic (ownership check) — controllers never do this:

```ts
// src/modules/video/video.service.ts
export class VideoService implements IVideoService {
  constructor(
    private readonly videoRepo: IVideoRepository,
    private readonly storageService: IStorageService,
  ) {}

  async findAll({ page, limit, q }: FindAllParams) {
    return this.videoRepo.findPublished({ page, limit, q })
  }

  async findById(videoId: string) {
    const video = await this.videoRepo.findById(videoId)
    if (video) await this.videoRepo.incrementViews(videoId)
    return video
  }

  async publish(params: PublishVideoParams) {
    const [videoUrl, thumbnailUrl] = await Promise.all([
      this.storageService.upload(
        params.videoFile.path, BUCKETS.VIDEOS,
        `${params.ownerId}/${Date.now()}-${params.videoFile.originalname}`,
        params.videoFile.mimetype,
      ),
      params.thumbnailFile
        ? this.storageService.upload(
            params.thumbnailFile.path, BUCKETS.THUMBNAILS,
            `${params.ownerId}/${Date.now()}-${params.thumbnailFile.originalname}`,
            params.thumbnailFile.mimetype,
          )
        : Promise.resolve(null),
    ])

    if (!videoUrl) throw new ApiError(500, 'Video upload failed')
    return this.videoRepo.create({ ...params, videoUrl, thumbnailUrl })
  }

  async update(videoId: string, requesterId: string, dto: UpdateVideoDto) {
    const video = await this.videoRepo.findById(videoId)
    if (!video) throw new ApiError(404, 'Video not found')
    if (video.ownerId !== requesterId) throw new ApiError(403, 'Forbidden')
    return this.videoRepo.update(videoId, dto)
  }

  async remove(videoId: string, requesterId: string) {
    const video = await this.videoRepo.findById(videoId)
    if (!video) throw new ApiError(404, 'Video not found')
    if (video.ownerId !== requesterId) throw new ApiError(403, 'Forbidden')
    await this.videoRepo.delete(videoId)
  }

  async togglePublish(videoId: string, requesterId: string) {
    const video = await this.videoRepo.findById(videoId)
    if (!video) throw new ApiError(404, 'Video not found')
    if (video.ownerId !== requesterId) throw new ApiError(403, 'Forbidden')
    return this.videoRepo.update(videoId, { isPublished: !video.isPublished })
  }
}
```

---

## Upload Guard (multer config)

```ts
// src/common/guards/upload.guard.ts
import multer from 'multer'
import path from 'path'

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, './public/temp'),
  filename:    (_req, file, cb) => {
    const ext      = path.extname(file.originalname)
    const basename = path.basename(file.originalname, ext)
    cb(null, `${basename}-${Date.now()}${ext}`)
  },
})

export const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm']
    allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error(`${file.mimetype} not allowed`))
  },
})
```
