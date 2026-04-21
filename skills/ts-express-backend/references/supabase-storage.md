# Supabase Storage (replaces Cloudinary)

## storage.service.ts

```ts
// src/services/storage.service.ts
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!   // service_role key — server only, never expose to client
)

export const uploadToSupabase = async (
  localPath: string,
  bucket: string,
  destPath: string,
  contentType?: string
): Promise<string | null> => {
  try {
    const file = fs.readFileSync(localPath)

    const { error } = await supabase.storage
      .from(bucket)
      .upload(destPath, file, {
        upsert:       true,
        contentType:  contentType ?? 'application/octet-stream',
      })

    if (error) throw error

    const { data } = supabase.storage.from(bucket).getPublicUrl(destPath)
    return data.publicUrl
  } catch (err) {
    console.error('Supabase upload error:', err)
    return null
  } finally {
    // always remove temp file whether upload succeeded or failed
    if (fs.existsSync(localPath)) fs.unlinkSync(localPath)
  }
}

export const deleteFromSupabase = async (
  bucket: string,
  filePath: string
): Promise<boolean> => {
  const { error } = await supabase.storage.from(bucket).remove([filePath])
  return !error
}

// Extract storage path from a public URL (needed for deletion)
export const getStoragePath = (publicUrl: string): string => {
  const url = new URL(publicUrl)
  // format: /storage/v1/object/public/<bucket>/<path>
  const parts = url.pathname.split('/public/')
  return parts[1] ?? ''
}
```

---

## Bucket Constants

```ts
// src/constants.ts
export const BUCKETS = {
  AVATARS:    'avatars',
  COVERS:     'covers',
  VIDEOS:     'videos',
  THUMBNAILS: 'thumbnails',
} as const
```

---

## multer Config (disk → temp → Supabase)

```ts
// src/middlewares/upload.middleware.ts
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
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm']
    if (allowed.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error(`File type ${file.mimetype} not allowed`))
    }
  },
})
```

Make sure `./public/temp` exists:
```bash
mkdir -p public/temp
echo '*' > public/temp/.gitignore
```

---

## Usage in Controller

```ts
// avatar update — single file
export const updateAvatar = asyncHandler(async (req, res) => {
  const file = req.file
  if (!file) throw new ApiError(400, 'Avatar file is required')

  const destPath = `${req.user!.id}/avatar-${Date.now()}${path.extname(file.originalname)}`
  const avatarUrl = await uploadToSupabase(file.path, BUCKETS.AVATARS, destPath, file.mimetype)

  if (!avatarUrl) throw new ApiError(500, 'Avatar upload failed')

  // delete old avatar from storage if exists
  const [existing] = await db.select({ avatarUrl: users.avatarUrl }).from(users).where(eq(users.id, req.user!.id)).limit(1)
  if (existing?.avatarUrl) {
    const oldPath = getStoragePath(existing.avatarUrl)
    if (oldPath) await deleteFromSupabase(BUCKETS.AVATARS, oldPath)
  }

  const [updated] = await db
    .update(users)
    .set({ avatarUrl, updatedAt: new Date() })
    .where(eq(users.id, req.user!.id))
    .returning({ id: users.id, avatarUrl: users.avatarUrl })

  return res.status(200).json(new ApiResponse(200, updated, 'Avatar updated'))
})
```

---

## Supabase Bucket Setup (one-time)

In Supabase dashboard → Storage → New bucket:
- Name: `avatars`, `videos`, etc.
- Public: ✅ (for serving URLs directly)
- File size limit: match `multer` limits
- Allowed MIME types: restrict appropriately

Or via Supabase CLI:
```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true);
```

---

## Environment Variables

```env
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
# NEVER use the anon key on the server — always service_role
```
