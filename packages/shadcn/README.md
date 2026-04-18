# @repo/shadcn

**Repo-local** shadcn-based UI kit: generated primitives under `src/components/ui/`, optional feature wrappers under `src/components/gram/` (used today by Gram Panchayat; any app can add its own folder later).

**Naming:** `@repo/*` is a neutral scope — it means “belongs to this monorepo”, not FundSight, not Gram Panchayat. Same idea as many Turborepo examples.

**Alongside `@fundsight/ui`:** the older hand-built Radix package stays for existing apps. Prefer **adding new shadcn blocks here** so product-specific apps don’t all share one legacy surface.

## Registry (`components.json`)

Placeholder registry URL optional; see file. Use `pnpm dlx shadcn@latest add … --yes --overwrite` from `packages/shadcn`.

## Consumers

1. App `package.json`: `"@repo/shadcn": "workspace:*"`
2. App `globals.css`: `@source` → `packages/shadcn/src/**/*.{ts,tsx}`
3. `next.config`: `transpilePackages: ['@repo/shadcn']`
4. After CLI adds files: replace `@/` with **relative** imports inside `packages/shadcn` so TypeScript resolves from apps.

## Exports

`./globals.css`, `./gram-app-shell`, `./gram-sidebar-brand`, `./gram-sidebar-nav`, `./gram-types`, `./gram-nav-utils`

Dev-only: still uses `@fundsight/tsconfig` for `tsconfig` extends — that’s shared tooling, not the public package identity.
