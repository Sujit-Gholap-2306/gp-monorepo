# @gp/shadcn

GP monorepo UI: shadcn primitives under `src/components/ui/`, GP-specific components under `src/components/gram/` (see `skills/gp-component-variants/SKILL.md` — one folder per component: `index.ts`, `types.ts`, `variants.ts`, `gram-*.tsx`).

## Registry (`components.json`)

Run `pnpm dlx shadcn@latest add …` from `packages/shadcn`.

## Consumers

1. App: `"@gp/shadcn": "workspace:*"`
2. Layout: `@gp/shadcn/globals.css` first, then app `globals.css` (with `@source` for app + this package)
3. `next.config`: `transpilePackages: ['@gp/shadcn']`

## Exports

`./globals.css`, `./gp-theme-layer.css`, `./ui/badge`, `./gram-app-shell`, `./gram-app-chrome` (re-exports), `./gram-app-context-strip`, `./gram-app-navbar`, `./gram-sidebar-brand`, `./gram-sidebar-nav`, `./gram-types`, `./gram-nav-utils`
