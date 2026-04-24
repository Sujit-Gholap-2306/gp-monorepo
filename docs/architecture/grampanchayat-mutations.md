# Gram Panchayat app — data writes and the Express API

## Rule

**Do not add** new **`'use server'`** mutators in `apps/grampanchayat/lib/actions/*` for domain data, and **do not** use `supabase.from()` against tenant domain tables in the Next app (anything beyond auth and the `gp_tenants` row used for routing).

- **Auth only** in the app: Supabase session cookies, `getUser()`, login.
- **Subdomain / tenant** lookup may use Supabase **`gp_tenants` only** (`lib/tenant.ts`) — a frontend routing concern.
- **All other reads and writes** (announcements, events, gallery, post-holders, GP admins, masters, tax chain, tenant settings) go through **`@gp/grampanchayat-api`**: RSC and client use `fetch` to the API (see `apps/grampanchayat/lib/api/*`); the API uses `supabaseTenantAdminGuard` and Drizzle.

## Current split

| Area | Read path (Next) | Write path |
|------|------------------|------------|
| `gp_tenants` (routing, portal metadata) | `getTenant` (Supabase) | **API** `PUT /api/v1/tenants/:subdomain/settings` (logo, config) |
| Announcements, events, gallery, post-holders, GP admins, masters | **API** with cookie or public routes as designed | **API** only (no new server actions for these) |
| `gp-media` storage | Upload via **Next** `POST /api/gp/media/*` then persist URL through **API** | Same |

## Admin auth for the API

The API verifies Supabase sessions and enforces `gp_admins` membership for the tenant. Access requires **`is_active = true`** and **`deleted_at IS NULL`**. **Roles** are `admin` (read/write) and `viewer` (read-only) — see `GP_ADMIN_ROLES` in `apps/grampanchayat-api/src/db/schema/gp-admins.ts`.

Apply app-schema changes with Drizzle migrations in `apps/grampanchayat-api/drizzle/migrations/`. See **`docs/MIGRATIONS.md`** for migration ownership and journal checks.

## Portal config in the DB

- `gp_tenants.portal_config` (JSONB) — public hero text, optional hero background URL, `show_stats_strip`, meta title/description, `og_image_url`.
- `gp_tenants.feature_flags` (JSONB) — `showProgress`, `showMap`, `showAchievements` (used for future themed / preview surfaces).

Drizzle schema: `apps/grampanchayat-api/src/db/schema/tenants.ts`.  
Type shapes for the Next app: `apps/grampanchayat/lib/portal-config.ts`.

## SEO

Public tenant layout uses `generateMetadata` with `getTenantPublicMetadata` (`lib/portal-meta.ts`). For absolute Open Graph image URLs, set `NEXT_PUBLIC_APP_ORIGIN` when using path-only image URLs (optional).
