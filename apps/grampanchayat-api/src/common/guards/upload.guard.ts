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
    allowed.includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error(`File type ${file.mimetype} not allowed`))
  },
})
