---
name: gp-component-variants
description: >
  Build @gp/shadcn components with CVA-based variants, correct folder placement
  (gram/ vs ui/), and server/client split when needed. Use when creating or editing
  packages/shadcn/src/components/** or apps/grampanchayat/components/. Triggers on:
  "create a component", "add variant", "status badge", "stat card", "search input",
  or GP monorepo UI work. Prefer gp-theme tokens — avoid ad-hoc colors.
user-invocable: false
---

# GP component variants

Rules for React components in `@gp/shadcn`: **CVA**, **Tailwind v4**, **`cn()`**, and clear **naming / folder** boundaries.

**Stack:** TypeScript · Tailwind CSS v4 · `class-variance-authority` · `@gp/shadcn`

---

## Where a component lives

| Folder | Component names | Use for |
|--------|-----------------|--------|
| `packages/shadcn/src/components/gram/` | **`Gram*`** | GP **app chrome**: shell, sidebar brand, sidebar nav, navbar, context strip — layout IA specific to this product. |
| `packages/shadcn/src/components/ui/` | **Generic** (`SearchInput`, `StatCard`, …) | **Primitives** reusable on any page; **no** `Gram` prefix. |

**Tokens** in CSS keep the **`gp-`** prefix (`--gp-primary`, `text-gp-status-paid`). That is not the same as component naming.

---

## Folder structure (per component)

One folder per component; never a lone `.tsx` at the parent level.

**Example — generic primitive:**

```
packages/shadcn/src/components/ui/search-input/
├── index.ts
├── types.ts
└── search-input.tsx    ← 'use client' if hooks/events (this one is client)
```

**Example — GP chrome:**

```
packages/shadcn/src/components/gram/gram-sidebar-nav/
├── index.ts
├── types.ts
└── gram-sidebar-nav.tsx
```

### `index.ts` barrel

```ts
export { SearchInput } from './search-input'
export type { SearchInputProps } from './types'
```

### `types.ts`

Keep public types here so server code / tests can import types without pulling `'use client'` modules when possible.

---

## `package.json` exports

Add one export per public entry (tree-shaking friendly):

```json
"./ui/search-input": "./src/components/ui/search-input/index.ts",
"./gram-sidebar-nav": "./src/components/gram/gram-sidebar-nav/index.ts"
```

Import in apps: `import { SearchInput } from '@gp/shadcn/ui/search-input'`.

---

## Server vs client

**Default:** no `'use client'` unless you need state, effects, or event handlers.

| Example | Client? | Reason |
|---------|---------|--------|
| `StatusBadge`, `Amount`, `StatCard` | Usually no | Pure display |
| `DataTable` | Often no | Renders from props |
| `SearchInput` | Yes | Debounce, controlled updates, clear button |
| `HalfYearTabs` | Yes | Interaction |

Optional **server shell + client leaf** split (only if a Server Component parent must import the symbol without pulling client JS for the whole tree):

```tsx
// search-input.tsx — no directive; re-exports client implementation
export { SearchInput } from './search-input-client'
```

For most `ui` inputs used only under client parents, a **single** `'use client'` file is fine.

---

## CVA pattern

Define variants at **module level**; **`className` last in `cn()`** so callers win.

```tsx
export const statCardVariants = cva('rounded-lg border p-4 flex flex-col gap-1', {
  variants: {
    variant: {
      default: 'bg-card text-card-foreground border-border',
      warning: 'bg-warning-bg border-warning/30',
      success: 'bg-success-bg border-success/30',
    },
  },
  defaultVariants: { variant: 'default' },
})
```

---

## `forwardRef`

Use on primitives that wrap `<input>`, `<button>`, or other DOM nodes where parents need focus, RHF `ref`, or a11y `id` wiring — e.g. **`SearchInput`** → inner `Input`.

---

## Design tokens

Source of truth: **`packages/shadcn/src/styles/gp-theme-layer.css`**.

Use semantic Tailwind classes (`text-destructive`, `bg-success-bg`, `text-gp-status-paid`, …). Do **not** hardcode hex/hsl in components for brand or status.

---

## Forms (app layer)

Use **react-hook-form** in `apps/grampanchayat` with **`useController`** or **`register`**. Pass **`value` / `onChange` / `onBlur` / `ref`** into `ui` inputs. Do **not** add `FormProvider` or shadcn Form wrappers to `@gp/shadcn` unless we explicitly choose that dependency again.

---

## Checklist before commit

- [ ] Correct tree: **`gram/`** for `Gram*` chrome, **`ui/`** for generic primitives
- [ ] Generic components: **no** `Gram` in the **name**
- [ ] Own folder + `index.ts` + `types.ts` where it helps
- [ ] CVA at module level; `className` last in `cn()`
- [ ] `'use client'` only where needed
- [ ] `forwardRef` + `displayName` on DOM-field components when RHF/a11y needs it
- [ ] Token-based colors only
- [ ] New export in `packages/shadcn/package.json` `exports` map
