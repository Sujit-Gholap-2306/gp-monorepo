# GP-Monorepo — CLAUDE.md

> Maharashtra Gram Panchayat accounting and audit tools.
> Separated from FundSight monorepo — no shared code between projects.
> Last updated: 2026-04-18

---

## What Is This

A monorepo for building software tools for Maharashtra Gram Panchayat accounting, audit compliance, and namune (register) management. Based on the Maharashtra Village Panchayats Act 1958 and Lekha Sanhita 2011.

---

## Monorepo Structure

```
GP-Monorepo/
├── apps/
│   └── grampanchayat/     ← Next.js 16, port 3004
├── packages/
│   └── shadcn/            ← @gp/shadcn — `gram/*` (Gram* shell/nav) + `ui/*` (generic primitives)
└── docs/
    ├── namune-vault/      ← Obsidian vault — all 33 namune notes + MOCs
    └── specs/             ← Machine-readable requirements + reconciled spec
```

## Stack
- Next.js 16, TypeScript, Tailwind CSS v4
- pnpm workspaces + Turborepo
- Package scope: `@gp/*`

## Domain Knowledge
- **33 Namune**: Physical accounting registers maintained at GP level
- **Reconciled spec**: `docs/specs/2026-04-18-maharashtra-gp-33-namune-reconciled.md`
- **Obsidian vault**: `docs/namune-vault/` — open as vault in Obsidian for graph view

## Dev
```bash
pnpm install
pnpm dev          # runs all apps
# or
cd apps/grampanchayat && pnpm dev   # port 3004
```

## Rules
- Never auto-commit or auto-push
- Package scope is `@gp/*` — not `@repo/*` or `@fundsight/*`
- Domain logic lives in `apps/grampanchayat/lib/` — not in route handlers
