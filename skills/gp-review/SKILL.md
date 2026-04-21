---
name: gp-review
description: Code review checklist for GP-Monorepo. Use when reviewing, auditing, or critiquing any code in apps/grampanchayat/ or packages/shadcn/. Covers architecture violations, component structure, CVA compliance, server/client boundaries, Prisma/Decimal correctness, cross-register integrity, and monorepo hygiene. Also triggers on "review this", "audit", "check my PR", or "what's wrong with this code".
---

# GP-Monorepo Code Review

Run through each section when reviewing a PR or auditing code. Skip sections that are not relevant to the diff.

---

## Architecture

- [ ] No business logic in route handlers (`app/api/`) — only call `lib/` functions
- [ ] No business logic in `page.tsx` or `layout.tsx`
- [ ] Domain logic lives in `apps/grampanchayat/lib/` — not scattered in components or routes
- [ ] Components are UI-only: they receive data, they don't fetch or compute it
- [ ] Server Actions live in `lib/actions/`, not inlined in page files

---

## Component Structure

Each `gram/` component must follow the folder layout:

- [ ] Component lives in its own folder: `gram/<name>/`
- [ ] `types.ts` exists and contains all TypeScript types + exported `VariantProps`
- [ ] `index.ts` is a clean barrel — re-exports only, no logic
- [ ] Implementation file is `gram-<name>.tsx` — no logic in `index.ts`
- [ ] If interactive: interactive parts in `gram-<name>-client.tsx`, shell in `gram-<name>.tsx`
- [ ] New component added to `packages/shadcn/package.json` exports map

---

## CVA / Variant Compliance

- [ ] CVA definition is at **module level** — not inside the component function
- [ ] `VariantProps<typeof xVariants>` is exported from `types.ts`
- [ ] `defaultVariants` covers every variant key — no undefined states
- [ ] `className` prop accepted on every component
- [ ] `className` is applied **last** in `cn()` so caller overrides win
- [ ] Compound variants only where two axes genuinely interact in the design
- [ ] No ad-hoc conditional className strings where a CVA variant would be cleaner

---

## Server / Client Boundaries

- [ ] Pure display components (`GramStatusBadge`, `GramAmount`, `GramStatCard`, `GramDataTable`) have **no** `'use client'`
- [ ] `'use client'` only on files that actually use `useState`, `useEffect`, event handlers, or browser APIs
- [ ] Interactive state isolated to `-client.tsx` file — shell stays directive-free
- [ ] Page and layout files default to Server Components — no unnecessary `'use client'` at the top
- [ ] `forwardRef` + `displayName` used only on input/button wrappers, not display components

---

## Styling

- [ ] No hardcoded colour values — use GP brand tokens (`gp-primary`, `gp-status-*`, etc.) or shadcn semantic tokens (`bg-background`, `text-muted-foreground`)
- [ ] No inline `style` objects for anything Tailwind handles
- [ ] No `space-x-*` / `space-y-*` — use `flex gap-*` instead
- [ ] `@gp/shadcn/globals.css` imported before any custom styles
- [ ] `cn()` used for conditional classes — not template literal ternaries

---

## Prisma / Database

- [ ] Monetary values never passed through `Number()` — use `new Decimal(x).plus(y)` (decimal.js)
- [ ] No `parseFloat` or arithmetic operators (`+`, `-`) directly on `Prisma.Decimal` fields
- [ ] All multi-table writes (N10 → N09 + N05 + N06) run inside a single `prisma.$transaction()`
- [ ] Receipt number uses `SELECT nextval('receipt_seq_...')` — never `MAX(receipt_no) + 1`
- [ ] No N+1: related records fetched as maps before loops, not inside loops
- [ ] Overpayment guard: `dp.amount > demand.balance` checked before writing

---

## Cross-Register Integrity (Domain)

- [ ] Field names match the reconciled spec (`docs/specs/2026-04-18-maharashtra-gp-33-namune-reconciled.md`)
- [ ] N09 demand generation: arrear carried from **previous FY** `SUM(balance)` across both half-years — not current FY
- [ ] N10 receipt transaction covers all four writes: tax_receipt → tax_demand update → cash_book_entry → classified_receipt upsert
- [ ] `cash_book_entry` created per `tax_receipt_demand` row, not per receipt
- [ ] `classified_receipt` upserted on `(fy_id, month, account_head_id)` — not inserted
- [ ] `tax_type → account_head` mapping used correctly (house=0101, water=0102, sanitation=0103, lighting=0104)
- [ ] Cash Book running balance window function scoped to full FY — not filtered by month (filter in app layer)
- [ ] Any `[VERIFY]` items from the spec are not assumed confirmed

---

## Package Hygiene

- [ ] Imports from `@gp/shadcn` — not `@repo/shadcn` or relative `../../packages`
- [ ] No new packages added without a stated reason (check `package.json` diff)
- [ ] New shared components go in `packages/shadcn/` — not duplicated inside the app
- [ ] `packages/shadcn/package.json` exports map updated for any new component folder

---

## TypeScript

- [ ] No `any` without a comment explaining why
- [ ] Props types defined and exported for all components
- [ ] `pnpm typecheck` passes

---

## Next.js

- [ ] `transpilePackages` in `next.config.ts` includes `@gp/shadcn`
- [ ] PDF routes have `export const dynamic = 'force-dynamic'` and `export const runtime = 'nodejs'`
- [ ] QR URLs use `/mr/` locale prefix: `/mr/receipts/verify/[token]`
- [ ] No `console.log` left in production code

---

## Security

- [ ] No secrets, keys, or credentials in source files
- [ ] `.env.local` never committed
- [ ] User input validated at Server Action boundary before DB writes

---

## Git

- [ ] No auto-commit or auto-push without explicit user instruction
- [ ] Commit messages describe the "why", not just the "what"
