---
name: gp-dev
description: GP-Monorepo development standards for the grampanchayat Next.js app. Use whenever building or modifying components, pages, API routes, or lib logic in apps/grampanchayat/ or packages/shadcn/. Covers @gp/shadcn usage, Tailwind v4, API-only mutations (no new server actions for domain writes), domain conventions, and monorepo rules.
---

# GP-Monorepo Dev Standards

## Stack

- **App:** Next.js 16, TypeScript, Tailwind CSS v4
- **UI package:** `@gp/shadcn` (packages/shadcn) — GP-specific components only
- **Monorepo:** pnpm workspaces + Turborepo
- **Package scope:** `@gp/*` — never `@repo/*` or `@fundsight/*`

## Folder Conventions

```
apps/grampanchayat/
├── app/                  ← Next.js App Router pages and layouts
│   └── api/              ← Route handlers (thin — no business logic here)
├── components/           ← React components
├── lib/                  ← All domain logic — calculations, validation, GP rules
│   └── nav.ts            ← Navigation items (APP_NAV)
└── ...

packages/shadcn/
└── src/
    ├── components/gram/  ← GP-specific UI components
    └── styles/           ← globals.css
```

**Rules:**
- Domain logic goes in `apps/grampanchayat/lib/` — never in route handlers or page files
- Business logic never in `page.tsx` or `layout.tsx`
- Route handlers are thin pass-throughs only

## @gp/shadcn Components

Import from the package exports — never from relative paths:

```tsx
import { GramAppShell } from '@gp/shadcn/gram-app-shell'
import { GramSidebarBrand } from '@gp/shadcn/gram-sidebar-brand'
import { GramSidebarNav } from '@gp/shadcn/gram-sidebar-nav'
import type { GramNavItem } from '@gp/shadcn/gram-types'
```

When adding new shared components, add them to `packages/shadcn/src/components/gram/` and export from `packages/shadcn/package.json`.

## Tailwind CSS v4

- Tailwind is initialized from `packages/shadcn/src/styles/globals.css` (`@gp/shadcn/globals.css`) — no `tailwind.config.js`
- **`@gp/shadcn` must not `@source` app paths** — the app depends on the package, not the reverse
- `app/globals.css` adds `@source` for `apps/grampanchayat` **and** `packages/shadcn/src` so class scans cover both trees
- CSS variables for design tokens — never hardcode colours
- Root layout: import **`@gp/shadcn/globals.css` first**, then `app/globals.css` (`@theme` extensions + base/print)

## Next.js 16 Specifics

- `next.config.ts` must include `transpilePackages: ['@gp/shadcn']`
- React Compiler is enabled (`reactCompiler: true`) — avoid patterns that break memoisation
- Turbopack root points to monorepo root: `root: path.join(__dirname, '..', '..')`

## Domain Rules — 33 Namune

- Each Namuna (register) maps to a category: Budget, Cash, Tax, Receipt, Expenditure, Works, Staff, Property, Advances, Reporting, Audit
- All 33 Namune are documented in `docs/namune-vault/` (Obsidian) and `docs/specs/2026-04-18-maharashtra-gp-33-namune-reconciled.md`
- Legal basis: Maharashtra Village Panchayats Act 1958 + Lekha Sanhita 2011
- When building register UI: the `FIELDS_IN_REGISTER` section of the reconciled spec is the source of truth for column names

## TypeScript

- Strict mode — no `any` without a comment explaining why
- All shared types in `lib/types.ts` (or `lib/<domain>/types.ts` for complex domains)
- No implicit `any` in function parameters

## Mutations: Express API only (no new server actions)

- **Do not** add new **`'use server'`** form actions or `lib/actions/*.ts` **mutations** for tenant content, settings, or portal data.
- **Do** implement writes in **`apps/grampanchayat-api`** (Drizzle + routes), and call the API from the **client** with `fetch` and `Authorization: Bearer <Supabase access token>`, or from a minimal BFF if we add one later.
- **Reads** in Server Components (e.g. `getTenant` via Supabase) are fine.
- Auth for tenant admin routes: Supabase session + `gp_admins` check (see `supabaseTenantAdminGuard` on the API).
- Full rationale: `docs/architecture/grampanchayat-mutations.md`

## Never Do

- Import from `@repo/shadcn` or `@fundsight/*` — wrong scope for this repo
- Put business logic in route handlers
- Add new server actions in `lib/actions/` for domain writes (use `grampanchayat-api` instead)
- Hardcode register field names — derive from domain lib
- Auto-commit or auto-push — always ask first
