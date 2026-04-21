# Storage Strategy — Images, Videos & Documents

> Where file uploads actually live, why we chose this stack, and when to migrate.
> Last updated: 2026-04-19

---

## TL;DR

| Phase | DB / Auth | File storage | Monthly cost | Trigger to switch |
|-------|-----------|--------------|--------------|-------------------|
| **Now** (prototype, <10 GPs) | Supabase Free | Supabase Storage Free (1 GB) | **$0** | Storage usage approaches 800 MB |
| **Phase 2** (pilot, 10-50 GPs) | Supabase Free | **Cloudflare R2** (10 GB free) | **$0** | R2 usage approaches 8 GB or DB hits 500 MB |
| **Phase 3** (growth, 50-200 GPs) | Supabase Pro ($25/mo) | Cloudflare R2 (~$2/mo for 130 GB) | **$27/mo** | 200+ GPs or long-form video |

**Keep media separate from DB.** Storage and DB scale differently; forcing both through Supabase Pro prematurely wastes money.

---

## The storage math (portfolio-only traffic, no viral sharing)

Per GP per year:
- 30 events × 15 photos × 2 MB = **~900 MB**
- Short videos (3-4 clips × 50 MB) = **~200 MB**
- Announcements with PDFs (50 × 500 KB) = **~25 MB**
- Gallery + misc = **~200 MB**
- **≈ 1.3 GB per GP per year**

Bandwidth per GP per month (pure portfolio, browser-cached):
- ~50 visitors × 5 pageviews × ~500 KB images = **~250 MB/month**
- 10 GPs = 2.5 GB/month bandwidth
- 100 GPs = 25 GB/month bandwidth

**Storage is the cost driver. Bandwidth is negligible at portfolio scale.**

---

## Why NOT just use Supabase Storage

Supabase free gives 1 GB storage. That's **less than one GP-year**. Upgrading to Pro ($25/mo) gets 100 GB — fine, but:

- At <10 GPs, $25/mo pays for maybe 2 paying customers' worth of infra — bad unit economics early
- DB and Auth limits on Free tier (500 MB DB, 50K MAU) are generous enough for our first 50 GPs — no other reason to upgrade
- **Storage is the forcing function** for Pro. Offload storage elsewhere → delay Pro → save $25/mo × 12 months while pre-revenue

## Why Cloudflare R2 for media

- **10 GB free** (10× Supabase's 1 GB)
- **$0.015/GB/mo** after — $1.50/mo for 100 GB
- **Zero egress fees** (unique among major providers) — future-proofs us against traffic spikes if a tenant site goes viral
- **S3-compatible API** — standard SDK, swap-in friendly
- **CloudFlare CDN built-in** — fast delivery across India
- **No vendor lock-in in our code** — already abstracted behind `lib/storage.ts`

## Options we considered and rejected

| Option | Why not |
|--------|---------|
| Supabase Pro (storage only) | $25/mo too expensive pre-revenue |
| Backblaze B2 | Cheapest at $0.006/GB/mo, but $0.01/GB egress adds friction. R2's zero-egress wins. |
| AWS S3 + CloudFront | $0.09/GB egress is the killer. Not worth the complexity. |
| Cloudinary | Starts at $89/mo. Overkill — we don't need advanced image transformations yet. |
| Self-hosted MinIO | Operational overhead not worth it at this scale. |
| BunnyCDN Storage | Good option ($0.01/GB storage + cheap egress), but R2's zero egress is a stronger hedge. |

---

## Current implementation

All storage access goes through **one file**: `apps/grampanchayat/lib/storage.ts`.

```ts
// apps/grampanchayat/lib/storage.ts
import { createSupabaseServerClient } from './supabase/server'

const BUCKET = 'gp-media'

export async function uploadFile(
  gpId: string,
  folder: 'gallery' | 'events' | 'logo',
  file: File,
): Promise<string> {
  const supabase = await createSupabaseServerClient()
  const ext = file.name.split('.').pop() ?? 'bin'
  const path = `${gpId}/${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const bytes = await file.arrayBuffer()
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, bytes, { contentType: file.type, upsert: false })

  if (error) throw new Error(`Upload failed: ${error.message}`)
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
}

export async function deleteFile(publicUrl: string): Promise<void> { /* ... */ }
```

**DB stores URL strings, not blobs.** Every table that references media (`gallery.url`, `event_media.url`, `post_holders.photo_url`, `gp_tenants.logo_url`) stores a public URL string. Browsers fetch directly from the CDN — bytes never pass through Next.js.

### Current storage bucket layout (Supabase)

```
gp-media/                                    (Supabase bucket, public read)
├── <nashik-gp-uuid>/
│   ├── gallery/
│   │   └── 1713540000-temple.jpg
│   ├── events/
│   │   └── 1713541000-republicday.jpg
│   └── logo/
│       └── 1713542000-panchayat-logo.png
├── <satara-gp-uuid>/
│   └── ...
```

Each tenant's files live under their own `<gp_id>/` prefix. Storage policies restrict write access per tenant.

---

## Migration plan: Supabase Storage → Cloudflare R2

Trigger: usage approaches 800 MB / tenant asks for more / first real customer ready to onboard.

### Steps

**1. Create R2 bucket**
- Cloudflare dashboard → R2 → Create bucket: `gp-media`
- Generate API token with "Object Read & Write" scope
- Enable public bucket access via public R2.dev URL OR custom domain (e.g., `cdn.grampanchayat.co.in`)

**2. Install S3 client in portal**

```bash
pnpm --filter grampanchayat add @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

**3. Rewrite `lib/storage.ts`** — swap Supabase client for S3 client pointed at R2 endpoint. Single file change, identical function signatures.

```ts
// apps/grampanchayat/lib/storage.ts (migration target)
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'

const R2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId:     process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

const BUCKET = 'gp-media'
const PUBLIC_BASE = process.env.R2_PUBLIC_BASE_URL!   // e.g., https://cdn.grampanchayat.co.in

export async function uploadFile(
  gpId: string,
  folder: 'gallery' | 'events' | 'logo',
  file: File,
): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'bin'
  const key = `${gpId}/${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const bytes = await file.arrayBuffer()

  await R2.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: new Uint8Array(bytes),
    ContentType: file.type,
  }))

  return `${PUBLIC_BASE}/${key}`
}

export async function deleteFile(publicUrl: string): Promise<void> {
  const key = publicUrl.replace(`${PUBLIC_BASE}/`, '')
  await R2.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }))
}
```

**4. Add R2 envs** to `.env.local`:

```
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_PUBLIC_BASE_URL=https://cdn.grampanchayat.co.in
```

**5. Migrate existing files** (one-time script):

```ts
// scripts/migrate-supabase-to-r2.ts
// 1. List all files in Supabase 'gp-media' bucket
// 2. For each: download → upload to R2 → update DB URL string
// 3. Verify counts match
// 4. Keep Supabase bucket for rollback; delete after 7 days of stability
```

**6. Update `next.config.ts` `remotePatterns`** to include R2 public domain:

```ts
images: {
  remotePatterns: [
    { protocol: 'https', hostname: '*.supabase.co', pathname: '/storage/v1/object/public/**' },
    { protocol: 'https', hostname: 'cdn.grampanchayat.co.in', pathname: '/**' },  // NEW
  ],
}
```

**7. Deploy, smoke test, monitor R2 dashboard**

Estimated migration effort: **~1 day** of work for <100 GB of existing data. No app code outside `storage.ts` changes.

---

## Access control

### Current (Supabase)
- Bucket is **public read** — anyone with the URL sees the file. Acceptable for a public portal.
- Write access gated by RLS-like **storage policies** on the bucket:
  - Admin can INSERT/UPDATE/DELETE under their own `<gp_id>/` prefix only
  - Requires `storage.objects` policy referencing `gp_admins` table

### Post-R2 migration
- R2 bucket set to public read via Cloudflare
- Write access controlled **server-side only** — never expose R2 credentials to browser
- All uploads go through Server Actions → our server has the R2 creds → R2 auth happens server-to-server
- No client-side SDK needed; matches current Supabase pattern

### URL security
- URLs contain randomness (`Date.now()-<random>`) — not enumerable
- But: URL IS the ACL. Anyone with a link can view.
- For sensitive docs (audit reports, payroll), use **signed URLs** with expiry (both Supabase and R2 support this) — out of scope for public portal MVP

---

## Video handling

### Current scope (MVP)
- Direct `<video src="...mp4">` tags
- Works fine for short clips (<100 MB, <2 min)
- No transcoding, no adaptive bitrate
- Upload limit enforced at Server Action level (reject files > 100 MB)

### Future: long-form video (Gram Sabha recordings)
If GPs start uploading hour-long speeches, direct MP4 fails on rural 3G (buffering, huge files). Options:

| Option | Cost | When |
|--------|------|------|
| **Cloudflare Stream** | $5 per 1000 min stored + $1 per 1000 min delivered | Serious video workflow — adaptive bitrate, HLS, built-in player |
| **Mux** | $0.005/min encoded + $0.0025/min delivered | Same as Stream but more DX-friendly; pricier |
| **Compress at upload** | Free, minimal | Short clips only — not a real video solution |

Deferred until real demand surfaces. MVP doesn't need it.

---

## Monitoring

Watch for:
- **Supabase Storage usage** (Dashboard → Storage) — alert at 800 MB
- **DB storage** (Dashboard → Project) — alert at 400 MB  
- **MAU** (Dashboard → Auth) — alert at 40K (free tier cap: 50K)
- **R2 usage** (after migration) — alert at 8 GB

When any trips, review upgrade path below.

---

## Upgrade path (cost ladder)

```
Current:
  Supabase Free (DB + Auth + Storage 1 GB) +  $0/mo
                                                                      TOTAL: $0/mo

↓ Storage fills (~800 MB used)

Phase 2:
  Supabase Free (DB + Auth, 1 GB Storage unused) +  $0/mo
  Cloudflare R2 (media, 10 GB free then $0.015/GB) +  $0-2/mo
                                                                      TOTAL: $0-2/mo

↓ DB fills OR 50K MAU OR need backups

Phase 3:
  Supabase Pro (DB + Auth + 100 GB Storage, unused) +  $25/mo
  Cloudflare R2 (media, ~$2/mo for 130 GB) +  $2/mo
                                                                      TOTAL: $27/mo

↓ Long-form video demand

Phase 4:
  Supabase Pro +                                $25/mo
  Cloudflare R2 (images/docs) +                  $5/mo
  Cloudflare Stream (videos) +                   $10-30/mo
                                                                      TOTAL: $40-60/mo
```

By the time you're paying $60/mo, you should have 100+ paying GPs at ₹500-2000/mo each. Margins are fine.

---

## Key principles

1. **DB stores URLs, not blobs.** Always. Keeps migration cheap.
2. **All storage access goes through `lib/storage.ts`.** One file = one swap point.
3. **Never expose storage credentials to browser.** All uploads/deletes via Server Actions.
4. **Separate scaling axes:** DB growth ≠ storage growth ≠ bandwidth growth. Route each to the cheapest provider for that axis.
5. **Defer complexity.** R2 when storage fills. Stream when video demands it. Don't pre-optimize.

---

## References

- [Cloudflare R2 pricing](https://www.cloudflare.com/products/r2/)
- [Supabase Storage pricing](https://supabase.com/pricing)
- [R2 S3 API compatibility](https://developers.cloudflare.com/r2/api/s3/api/)
- Our storage abstraction: `apps/grampanchayat/lib/storage.ts`
- Subdomain routing architecture: [`./subdomain-routing.md`](./subdomain-routing.md)
