# Gram Panchayat app — data writes and the Express API

## Rule

**Do not add new “server action” mutators in `apps/grampanchayat/lib/actions/*` for domain data.**

Mutations (create / update / delete) that change tenant data, content, or settings must go through **`@gp/grampanchayat-api`** (Express + Drizzle) so that:

- Business rules and auth live in one place.
- The browser calls `fetch` with `Authorization: Bearer <Supabase access token>` (see tenant settings: `PUT /api/v1/tenants/:subdomain/settings` and `supabaseTenantAdminGuard`).

`next/headers` + Supabase server client may still be used for **read-only** RSC data (`getTenant`, listing pages) unless you move reads to the API as well.

## Current split

| Area | Read path (Next) | Write path |
|------|------------------|------------|
| Tenant settings, `portal_config`, `feature_flags` | `getTenant` (Supabase in RSC) | **API** `PUT /api/v1/tenants/:subdomain/settings` |
| Announcements, events, gallery, post-holders | RSC + `lib/actions/*` (server actions) today | **Planned: migrate to API** — follow the same pattern as settings (client `fetch` + API routes). |

## Admin auth for the API

The API verifies Supabase sessions with the service key and enforces `gp_admins` membership for the tenant. See `apps/grampanchayat-api/src/common/guards/supabase-tenant.guard.ts`.

## Portal config in the DB

- `gp_tenants.portal_config` (JSONB) — public hero text, optional hero background URL, `show_stats_strip`, meta title/description, `og_image_url`.
- `gp_tenants.feature_flags` (JSONB) — `showProgress`, `showMap`, `showAchievements` (used for future themed / preview surfaces).

Drizzle schema: `apps/grampanchayat-api/src/db/schema/tenants.ts`.  
Type shapes for the Next app: `apps/grampanchayat/lib/portal-config.ts`.

## SEO

Public tenant layout uses `generateMetadata` with `getTenantPublicMetadata` (`lib/portal-meta.ts`). For absolute Open Graph image URLs, set `NEXT_PUBLIC_APP_ORIGIN` when using path-only image URLs (optional).
