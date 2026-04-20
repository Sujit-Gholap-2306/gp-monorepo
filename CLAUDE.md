# GP-Monorepo — CLAUDE.md

> Maharashtra Gram Panchayat accounting + public portal + marketing — one product.
> Separated from FundSight monorepo — no shared code between projects.
> Last updated: 2026-04-19

---

## What Is This

A monorepo for building software tools for Maharashtra Gram Panchayat. Single unified product covering:
1. **Public tenant sites** (multi-tenant, subdomain-based) — citizens see announcements, events, gallery, post-holders. Also serves as organic marketing.
2. **Admin panel** — Gram Sevak manages content (free tier) + namune/certificates/audit (paid tiers).
3. **Marketing** — apex-domain landing, pricing, live customer spotlight grid.

Based on the Maharashtra Village Panchayats Act 1958 and Lekha Sanhita 2011.

---

## Monorepo Structure

```
GP-Monorepo/
├── apps/
│   ├── grampanchayat/        ← Next.js 16 frontend (port 3004) — single app, three zones
│   │   ├── app/
│   │   │   ├── (dashboard)/  ← 33 namune routes (IDB-backed, demo)
│   │   │   └── [tenant]/     ← multi-tenant public + admin (Supabase-backed)
│   │   │       ├── (public)/  ← citizens: announcements, events, gallery, post-holders, about
│   │   │       ├── (admin)/   ← Gram Sevak admin: same entities + settings
│   │   │       └── login/
│   │   ├── lib/
│   │   │   ├── tiers.ts       ← TIER_FEATURES map, canAccess(), featureForPath()
│   │   │   ├── tenant.ts      ← getTenant(subdomain) — cached
│   │   │   ├── supabase/      ← server/client/middleware clients + generated types
│   │   │   ├── actions/       ← Server Actions (announcements, events, gallery, etc.)
│   │   │   ├── i18n/          ← Marathi/English strings
│   │   │   └── ...            ← existing: db.ts (IDB), masters/, namuna8.ts, nav.ts
│   │   └── middleware.ts      ← subdomain routing + Supabase auth refresh
│   └── grampanchayat-api/   ← Express 5 BE (port 3005) — Drizzle + JWT + bcrypt + Supabase Storage
└── packages/
    └── shadcn/              ← @gp/shadcn — gram/* shell/nav + ui/* primitives
```

## Stack
- **Frontend**: Next.js 16 (App Router, React Compiler), TypeScript, Tailwind v4, TanStack Query, Supabase SSR
- **Backend**: Express 5, Drizzle ORM, Postgres (Supabase DB), JWT + bcrypt, Supabase Storage
- **Monorepo**: pnpm workspaces + Turborepo
- **Package scope**: `@gp/*`

## Three-Zone Routing

Configurable via `NEXT_PUBLIC_ROOT_DOMAIN` env var (default `grampanchayat.co.in`):

| Host | Rewrites to | Zone |
|------|-------------|------|
| `yourdomain.co.in` | `/` (marketing — TBD) | Marketing |
| `{subdomain}.yourdomain.co.in` | `/{subdomain}/*` → `[tenant]/(public)/*` | Public tenant site |
| `{subdomain}.yourdomain.co.in/admin` | same + login-gated `(admin)` | Admin panel |
| Local dev | `?tenant=nashik` param overrides subdomain | Dev |

## Tier Gating (see `apps/grampanchayat/lib/tiers.ts`)

| Tier | Features unlocked |
|------|-------------------|
| `free` | content (announcements, events, gallery, post-holders, settings) |
| `pro` | + certificates (उतारे), namune, audit, tax collection |
| `enterprise` | + multi_gp (block/taluka aggregation) |

Enforcement layers: middleware (redirect) → UI (lock icon + upgrade CTA) → BE (security boundary).

## Domain Knowledge
- **33 Namune**: Physical accounting registers maintained at GP level
- **Reconciled spec**: `docs/specs/2026-04-18-maharashtra-gp-33-namune-reconciled.md`
- **Obsidian vault**: `docs/namune-vault/` — open as vault in Obsidian for graph view

## Architecture Docs
- **Subdomain routing & multi-tenant** → `docs/architecture/subdomain-routing.md`
- **Storage strategy (media)** → `docs/architecture/storage-strategy.md`

## Dev
```bash
pnpm install
pnpm dev                                        # runs all apps (turbo)
pnpm --filter grampanchayat dev                 # FE only (port 3004)
pnpm --filter @gp/grampanchayat-api dev         # BE only (port 3005)
```

### Required env vars (not checked in)
- `apps/grampanchayat/.env.local` — `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_ROOT_DOMAIN`
- `apps/grampanchayat-api/.env` — see `apps/grampanchayat-api/.env.example`

## Cursor agent skills (this repo)

Project-local skills live under **`.cursor/skills/`**. For Supabase (DB, Auth, RLS, migrations, `supabase-js`, MCP):

- `.cursor/skills/supabase/SKILL.md` — primary Supabase workflow
- `.cursor/skills/supabase-postgres-best-practices/SKILL.md` — Postgres performance & RLS on Supabase

Enable or `@`-reference these in Cursor so the agent loads them. **MCP:** `user-supabase` (project-linked) complements the skills for live schema/migrations.

## Rules
- Never auto-commit or auto-push
- Package scope is `@gp/*` — not `@repo/*` or `@fundsight/*`
- Domain logic lives in `apps/grampanchayat/lib/` — not in route handlers
