# GP-Monorepo — CLAUDE.md

> Maharashtra Gram Panchayat accounting + public portal + marketing — one product.
> Separated from FundSight monorepo — no shared code between projects.
> Last updated: 2026-04-21 (preview map + doc sync)

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
│   │   │   ├── actions/       ← Legacy server actions; new domain writes use `grampanchayat-api` (see `docs/architecture/grampanchayat-mutations.md`)
│   │   │   ├── i18n/          ← Marathi/English strings
│   │   │   ├── toast/         ← `gpToast`, `AppToaster`, `useGpToast` (Sonner; app-wide defaults in `toast-defaults.ts`)
│   │   │   └── ...            ← existing: db.ts (IDB), masters/, namuna8.ts, nav.ts
│   │   └── middleware.ts      ← subdomain routing + Supabase auth refresh
│   └── grampanchayat-api/   ← Express 5 BE (port 3005) — Drizzle + JWT + bcrypt + Supabase Storage
└── packages/
    └── shadcn/              ← @gp/shadcn — gram/* shell/nav + ui/* primitives
```

## Stack
- **Frontend**: Next.js 16 (App Router, React Compiler), TypeScript, Tailwind v4, TanStack Query, Supabase SSR
- **Toasts (grampanchayat)**: `apps/grampanchayat/lib/toast/` only — import `gpToast` / `useGpToast` from `@/lib/toast` and mount a single `<AppToaster />` in `app/providers.tsx`. Do not import `sonner` directly in feature code; adjust defaults in `lib/toast/toast-defaults.ts` (`appToasterProps`, `GP_TOAST_DURATION_MS`).
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
- **Admin writes: API only (no new server actions for domain mutations)** → `docs/architecture/grampanchayat-mutations.md`

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

## Agent persona default (Codex + Claude + Cursor)

For this repository, apply a hybrid persona by default:
- Base assistant behavior stays enabled (collaborative, clear, safe execution).
- Overlay `skills/gp-persona/SKILL.md` on top for project tone/domain rules.

Expected output style:
- Senior full-stack peer tone, short and direct.
- Maharashtra GP domain-aware decisions (33 Namune + legal context).
- No preamble/trailing fluff unless complexity requires extra detail.

If platform supports explicit skill invocation, auto-load `gp-persona` first, then add task-specific skills.

## Rules
- Never auto-commit or auto-push
- Package scope is `@gp/*` — not `@repo/*` or `@fundsight/*`
- Domain logic lives in `apps/grampanchayat/lib/` — not in route handlers

---

## Marketing / Public Portal (Civic Elegant) — added 2026-04-20

**Intent.** A premium, standalone public-facing village portal that a GP can hand out
as its official website. Positioned as a **lead-magnet + upsell** for our admin /
namune / accounting product:
- **Free tier** — bundled free with any paid GP app subscription (marketing pull).
- **Standalone SKU** — offered at **₹7,000** one-time to GPs that only want the portal
  (no accounting product). Acts as an independent revenue stream + top-of-funnel.

**Where it lives.**
- Route: `/preview` on the grampanchayat app (no tenant lookup, no Supabase —
  pure showcase with mock data).
- All preview code is scoped and isolated — nothing leaks into the live
  `[tenant]/(public)` pages.

```
apps/grampanchayat/
├── app/preview/
│   ├── layout.tsx
│   ├── page.tsx            ← ?lang=en toggles English
│   └── preview.css         ← Civic Elegant tokens (scoped to .civic-root)
├── components/preview/
│   ├── preview-nav.tsx
│   ├── motion-primitives.tsx   ← Reveal, Counter, Parallax, MagneticHover, SplitText
│   ├── rangoli-motif.tsx
│   ├── section-header.tsx
│   └── sections/               ← hero, about, members, announcements,
│                                  achievements, events, gallery, progress,
│                                  map-section, contact-footer
└── lib/preview/mock-data.ts    ← bilingual mock tenant ("Deshmukhwadi")
```

**Map section (as of 2026-04-21).** Implemented in
`components/preview/sections/map-section.tsx` only: a hand-composed illustrated
SVG (1000×700 viewBox) — decorative “village” geometry, not cadastral accuracy.
**Pins** are data-driven: `previewMapPins` in `lib/preview/mock-data.ts` (six
`kind` values: office, school, temple, health, water, market) with `x`/`y` as
percentages of the canvas. **Colours** for land, river, fields, and pins come
from `PreviewTheme` (`lib/preview/theme.ts`, consumed via `useTheme()` for SVG
attributes). There is no separate `MapConfig` / OSM / custom-SVG pipeline in
the repo yet; that remains a productisation item when tenants need real
geometry.

**Stack additions.** `framer-motion@^12` added to `apps/grampanchayat` for the
premium animations (scroll-linked parallax, timeline draw-on, animated counters,
magnetic hover, lightbox physics, SVG map pin pulse).

**Design system.** Civic Elegant — cream paper bg, near-black ink, warm gold
accent, deep civic teal. Fraunces display serif + existing Plus Jakarta /
Noto Sans Devanagari. `prefers-reduced-motion` respected throughout.

**Status: tweaks pending.** The `/preview` build is directionally approved but
needs refinement passes before it ships as a sellable template. Outstanding
tweak dials (to decide on later):
- Gold intensity (current = accent, option = rare / seals-only)
- Vertical rhythm (option to tighten ~30%)
- Motion preset (current = rich, option = subtle)
- Member cards — swap conic-gradient monogram for real photo slot
- Map — replace illustrated SVG with real OSM, tenant-traced SVG, or a
  config-driven street layer (future; current build is illustration + pins only)
- Replace hero rangoli with a topographic village contour (alternative)

**Productisation path (not built yet).**
1. Parameterise `lib/preview/mock-data.ts` so a single config object drives
   a tenant's portal (name, colours, village photo slots, members, etc.).
2. Wire the 10 sections to live Supabase queries (shape already matches
   `[tenant]/(public)` — mostly a mechanical lift).
3. Add an admin toggle per tenant: `portal_theme: 'standard' | 'civic-elegant'`
   so the same codebase serves both tiers.

> When pricing / packaging is finalised, update this section with the SKU name,
> what's included free vs paid, and the upgrade trigger.
