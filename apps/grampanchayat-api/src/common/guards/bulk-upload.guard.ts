import type { Request } from 'express'
import multer from 'multer'
import { ApiError } from '../exceptions/http.exception.ts'
import { MASTERS_BULK_MAX_FILE_MB } from '../../types/masters-bulk-template.meta.ts'

const MAX_SIZE = MASTERS_BULK_MAX_FILE_MB * 1024 * 1024

export const memoryUploadSingle = multer({
  storage:    multer.memoryStorage(),
  limits:     { fileSize: MAX_SIZE, files: 1 },
  fileFilter: (_req, file, cb) => {
    const name   = file.originalname.toLowerCase()
    const isXlsx =
      name.endsWith('.xlsx') ||
      file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    if (isXlsx) {
      cb(null, true)
      return
    }
    cb(new ApiError(400, 'Only .xlsx files are allowed'))
  },
})

/** Multer error → ApiError(400) for clean JSON body */
export function assertBulkFile(req: Request) {
  const f = req.file
  if (!f?.buffer) {
    throw new ApiError(400, 'Expected multipart field `file` with one .xlsx file')
  }
  if (f.size > MAX_SIZE) {
    throw new ApiError(400, `File exceeds ${String(MASTERS_BULK_MAX_FILE_MB)} MB limit`)
  }
}
