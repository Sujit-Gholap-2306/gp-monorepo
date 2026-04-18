---
name: gp-component-variants
description: >
  Build GP monorepo components with CVA-based variant systems, proper folder structure,
  and server/client split. Use this skill whenever creating or editing files in
  packages/shadcn/src/components/gram/ or apps/grampanchayat/components/.
  Triggers on: "create a component", "add variant", "make it configurable via props",
  "status badge", "stat card", or any component work in the GP monorepo.
  Always apply — don't write ad-hoc className strings when variants are involved.
user-invocable: false
---

# GP Component Variants

Rules for building GP-specific React components with CVA, clean folder layout, and
Next.js App Router–compatible server/client split.

**Stack:** TypeScript · Tailwind CSS v4 · `class-variance-authority` · `cn()` · `@gp/shadcn`

---

## Folder Structure

Every component lives in its own folder. Never a single flat `.tsx` file.

```
packages/shadcn/src/components/gram/
└── gram-status-badge/
    ├── index.ts               ← barrel: re-export component + public types
    ├── types.ts               ← VariantProps, domain types, config maps
    └── gram-status-badge.tsx  ← component implementation
```

For components with a client/server split (see below):

```
└── gram-search-input/
    ├── index.ts
    ├── types.ts
    ├── gram-search-input.tsx         ← server-safe shell (no directive)
    └── gram-search-input-client.tsx  ← 'use client' — interactive core only
```

**Why separate files:** `types.ts` is pure TypeScript — importable by server code, tests,
and Prisma mappers without pulling in React. The `index.ts` barrel gives a stable public
surface; internal structure can change without touching import paths.

### index.ts shape

```ts
// gram-status-badge/index.ts
export { GramStatusBadge } from './gram-status-badge'
export type { GramStatusBadgeProps, DemandStatus } from './types'
```

### types.ts shape

```ts
// gram-status-badge/types.ts
import type { VariantProps } from 'class-variance-authority'
import type { statusBadgeVariants } from './gram-status-badge'

export type DemandStatus = 'UNPAID' | 'PARTIAL' | 'PAID'

export type GramStatusBadgeProps = VariantProps<typeof statusBadgeVariants> & {
  status: DemandStatus
  locale?: 'mr' | 'en'
  className?: string
}
```

Note: `statusBadgeVariants` is exported from the component file (not default-exported
from index) so `types.ts` can reference its type without a circular import.

---

## package.json — Per-Component Exports

Add one export entry per component, pointing to the subfolder index. This is what
enables tree shaking — bundlers follow the export map and only pull in what is imported.

```json
"./gram-status-badge": "./src/components/gram/gram-status-badge/index.ts",
"./gram-amount":       "./src/components/gram/gram-amount/index.ts",
"./gram-stat-card":    "./src/components/gram/gram-stat-card/index.ts"
```

Importing the component file directly also works because the subfolder `index.ts` is a
thin barrel that adds no runtime cost.

---

## Server vs Client — The Key Rule

**Default: no `'use client'`.**  
Only add it when the component uses React state, effects, event handlers, or browser APIs.

| Component | Directive | Reason |
|---|---|---|
| `GramStatusBadge` | none | pure display, no state |
| `GramAmount` | none | pure display, no state |
| `GramStatCard` | none | pure display, no state |
| `GramDataTable` | none | pure display — passes data in, renders rows |
| `GramSearchInput` | `'use client'` on `*-client.tsx` | debounce state, onChange handler |
| `GramHalfYearTabs` | `'use client'` on `*-client.tsx` | controlled tab state |

**The split pattern** — push `'use client'` down to the smallest possible file:

```tsx
// gram-search-input.tsx  — no directive, Server Component-safe
import type { GramSearchInputProps } from './types'

export function GramSearchInput(props: GramSearchInputProps) {
  // If this needs any static wrappers/slots, put them here.
  // Delegate interactive part to the client file.
  return <GramSearchInputClient {...props} />
}

// ↑ importing a Client Component from a Server Component is fine —
// Next.js automatically handles the boundary.
```

```tsx
// gram-search-input-client.tsx
'use client'

import { useState, useCallback } from 'react'
// ... implementation with state
```

**Why bother?** Pages and layouts that import `GramSearchInput` stay as Server Components.
The JS bundle only ships the `-client.tsx` file, not the full component tree.

**Next.js caveat:** A Client Component cannot import a Server Component. If a leaf is “pure display”
(no hooks) but is **only ever imported from** a client parent (e.g. `GramAppShell`), that file still
needs `'use client'` — document why in a one-line comment (boundary), not because it uses state.

---

## CVA Core Pattern

CVA definition at **module level** (not inside the function — it's created once):

```tsx
// gram-stat-card.tsx
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../../lib/utils'
import type { GramStatCardProps } from './types'

export const statCardVariants = cva(
  'rounded-lg border p-4 flex flex-col gap-1',
  {
    variants: {
      variant: {
        default: 'bg-card text-card-foreground border-border',
        warning: 'bg-gp-status-partial-bg border-gp-status-partial/30',
        success: 'bg-gp-status-paid-bg border-gp-status-paid/30',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export function GramStatCard({ label, value, sub, icon: Icon, variant, className }: GramStatCardProps) {
  return (
    <div className={cn(statCardVariants({ variant }), className)}>
      {Icon && <Icon className="size-4 text-gp-muted" />}
      <p className="text-xs text-gp-muted">{label}</p>
      <p className="text-2xl font-bold tabular-nums">{value}</p>
      {sub && <p className="text-xs text-gp-muted">{sub}</p>}
    </div>
  )
}
```

**`className` always last in `cn()`** so caller overrides win:

```tsx
cn(statCardVariants({ variant }), className)  // correct — caller wins
cn(className, statCardVariants({ variant }))  // wrong  — variant wins
```

---

## forwardRef — Only for DOM-touching Components

Required when a parent needs `.focus()`, `.value`, or a ref for animation/measurement.

```tsx
// gram-search-input-client.tsx
'use client'

import { forwardRef, useState, useCallback } from 'react'
import type { ComponentPropsWithoutRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../../lib/utils'

const searchInputVariants = cva(
  'flex w-full rounded-md border bg-background px-3 py-2 text-sm',
  {
    variants: {
      state: {
        default: 'border-input',
        error:   'border-destructive',
      },
    },
    defaultVariants: { state: 'default' },
  }
)

export const GramSearchInputClient = forwardRef<
  HTMLInputElement,
  ComponentPropsWithoutRef<'input'> & VariantProps<typeof searchInputVariants>
>(({ state, className, ...rest }, ref) => (
  <input
    ref={ref}
    className={cn(searchInputVariants({ state }), className)}
    {...rest}
  />
))
GramSearchInputClient.displayName = 'GramSearchInputClient'
```

`forwardRef` on pure display components (GramStatusBadge, GramAmount, GramStatCard) is
unnecessary — skip it.

---

## GP Brand Tokens

Defined in `packages/shadcn/src/styles/globals.css`. Use them — never hardcode hsl/hex values.

```
bg-gp-primary              text-gp-primary-fg
bg-gp-primary-hover

bg-gp-surface              border-gp-border
text-gp-muted

bg-gp-status-unpaid-bg     text-gp-status-unpaid     border-gp-status-unpaid/30
bg-gp-status-partial-bg    text-gp-status-partial    border-gp-status-partial/30
bg-gp-status-paid-bg       text-gp-status-paid       border-gp-status-paid/30
```

Status pattern: pair `*-bg` (light wash) + `text-gp-status-*` (saturated). They're
designed to read on white backgrounds at the GP office screen brightness.

---

## Composing shadcn Primitives

Wrap existing shadcn primitives when they exist. Raw `<div>` only when there's no match.

```tsx
// gram-status-badge.tsx — wraps Badge (no 'use client' needed)
import { Badge } from '../../ui/badge'
import { cn } from '../../../lib/utils'
import type { GramStatusBadgeProps } from './types'

export const statusBadgeVariants = cva('border font-medium', {
  variants: {
    status: {
      UNPAID:  'bg-gp-status-unpaid-bg  text-gp-status-unpaid  border-gp-status-unpaid/30',
      PARTIAL: 'bg-gp-status-partial-bg text-gp-status-partial border-gp-status-partial/30',
      PAID:    'bg-gp-status-paid-bg    text-gp-status-paid    border-gp-status-paid/30',
    },
  },
  defaultVariants: { status: 'UNPAID' },
})

const LABELS: Record<'UNPAID'|'PARTIAL'|'PAID', { mr: string; en: string }> = {
  UNPAID:  { mr: 'न भरलेले', en: 'Unpaid'  },
  PARTIAL: { mr: 'अंशतः',    en: 'Partial' },
  PAID:    { mr: 'भरलेले',   en: 'Paid'    },
}

export function GramStatusBadge({ status, locale = 'mr', className }: GramStatusBadgeProps) {
  return (
    <Badge className={cn(statusBadgeVariants({ status }), className)}>
      {LABELS[status][locale]}
    </Badge>
  )
}
```

---

## Compound Variants

Only when two axes genuinely interact in the design:

```tsx
compoundVariants: [
  { variant: 'warning', size: 'sm', className: 'font-semibold text-xs' },
]
```

Don't add speculatively. Add when the designer spec says a specific combination looks different.

---

## Checklist Before Committing

- [ ] Component lives in its own folder (`gram-<name>/`)
- [ ] `types.ts` has all types + `VariantProps` export
- [ ] `index.ts` is a clean barrel — no logic
- [ ] CVA definition is at module level, exported (for `VariantProps` ref in types.ts)
- [ ] `defaultVariants` covers all variant keys
- [ ] `className` prop accepted, applied last in `cn()`
- [ ] No `'use client'` on pure display components
- [ ] Interactive state/effects isolated to `-client.tsx` file
- [ ] `forwardRef` + `displayName` only on input/button wrappers
- [ ] GP brand tokens used — no hardcoded colors
- [ ] New export added to `packages/shadcn/package.json` exports map
