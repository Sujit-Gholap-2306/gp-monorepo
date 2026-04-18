---
title: GP Demo — Frontend Build Plan
date: 2026-04-18
companion: 2026-04-18-demo-prototype-impl-plan.md
tags: [frontend, ui, theming, components, demo]
---

# GP Demo — Frontend Build Plan

Companion to the main impl plan. Covers everything before and around data wiring:
theme → components → static pages → incremental DB connection.

Work through these phases **in parallel with or before** the main impl plan phases.
The goal: every page is visually complete with mock data before a single Server Action is wired.

---

## What Already Exists in `@gp/shadcn`

- `gram-app-shell.tsx` — main layout shell (sidebar + main area)
- `gram-sidebar-nav.tsx` — nav item renderer
- `gram-sidebar-brand.tsx` — top branding area in sidebar
- `gram-types.ts` — nav item type definitions
- shadcn/ui: `button`, `input`, `sidebar`, `skeleton`, `tooltip`, `sheet`, `scroll-area`
- `globals.css` — sidebar CSS tokens only, no GP brand tokens yet

Start from these. Do not rebuild what exists.

---

## Phase F0 — Theme

**File:** `packages/shadcn/src/styles/globals.css`

### F0.1 — Devanagari font

Add Noto Sans Devanagari for all Marathi UI text. This is separate from the PDF font (Lohit Devanagari).

```css
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap');

@theme inline {
  --font-devanagari: 'Noto Sans Devanagari', sans-serif;
}
```

Apply to body when locale is `mr`:
```css
[lang="mr"] body {
  font-family: var(--font-devanagari);
}
```

**Why not system font:** System Devanagari rendering on Windows (common in GP offices) is inconsistent. Noto Sans Devanagari is the reference implementation.

---

### F0.2 — GP brand color tokens

GP software should feel like a government tool — trustworthy, not flashy. Use a deep indigo primary with warm neutrals.

Add to `globals.css` `:root` block:

```css
:root {
  /* GP brand */
  --gp-primary:          hsl(231 48% 38%);   /* deep indigo — trust, authority */
  --gp-primary-fg:       hsl(0 0% 100%);
  --gp-primary-hover:    hsl(231 48% 32%);

  /* Status — demand/payment states */
  --gp-status-unpaid:    hsl(0 72% 51%);     /* red */
  --gp-status-unpaid-bg: hsl(0 72% 97%);
  --gp-status-partial:   hsl(38 92% 50%);    /* amber */
  --gp-status-partial-bg:hsl(38 92% 97%);
  --gp-status-paid:      hsl(142 71% 45%);   /* green */
  --gp-status-paid-bg:   hsl(142 71% 97%);

  /* Surfaces */
  --gp-surface:          hsl(220 14% 96%);
  --gp-border:           hsl(220 13% 88%);
  --gp-muted:            hsl(220 9% 46%);
}
```

Expose via Tailwind `@theme inline` so they're usable as `bg-gp-primary`, `text-gp-status-unpaid` etc.

---

### F0.3 — Update sidebar tokens to use GP brand

```css
:root {
  --sidebar-primary: var(--gp-primary);
  --sidebar-primary-foreground: var(--gp-primary-fg);
}
```

**Acceptance:** Sidebar header background is deep indigo. Body uses Noto Sans Devanagari when `lang="mr"`.

---

## Phase F1 — App Shell + Navigation

**Package:** `packages/shadcn/src/components/gram/`  
**App:** `apps/grampanchayat/app/[locale]/(demo)/layout.tsx`

### F1.1 — Wire gram-sidebar-nav with GP routes

In `apps/grampanchayat/components/nav.tsx`, define the nav items using `GramNavItem[]` type from `gram-types.ts`:

```ts
const GP_NAV_ITEMS: GramNavItem[] = [
  { labelKey: 'nav.dashboard',   href: '/',           icon: LayoutDashboard },
  { labelKey: 'nav.citizens',    href: '/citizens',   icon: Users },
  { labelKey: 'nav.properties',  href: '/properties', icon: Building2 },
  { labelKey: 'nav.assessment',  href: '/assessment', icon: ClipboardList, badge: 'N08' },
  { labelKey: 'nav.demand',      href: '/demand',     icon: FileText,      badge: 'N09' },
  { labelKey: 'nav.collect',     href: '/collect',    icon: Banknote,      badge: 'N10' },
  { labelKey: 'nav.cashbook',    href: '/cashbook',   icon: BookOpen,      badge: 'N05' },
  { labelKey: 'nav.classified',  href: '/classified', icon: Table2,        badge: 'N06' },
]
```

Namune badge (N05, N08 etc.) displayed as a small muted chip next to the label — helps Gram Sevaks connect UI to their physical registers.

### F1.2 — GP name + FY header bar

Top of main area (not sidebar): GP name in large Marathi text + active FY label.

```
रामोशी ग्रामपंचायत                    आर्थिक वर्ष: २०२५-२६  |  मराठी / English
```

Server Component — reads from `gp_profile` and `financial_year` at layout level.

### F1.3 — Mobile/tablet sidebar behaviour

Use `sheet` (existing) for mobile drawer. Sidebar is always visible at ≥1024px. GP offices typically use shared laptops — 1280px is the target viewport.

**Acceptance:** Nav renders with Marathi labels + N-number badges. GP name in header. Sidebar collapses to sheet on smaller viewports.

---

## Phase F2 — GP-Specific Components

**Package:** `packages/shadcn/src/components/gram/`

Build these before touching any page. Each is independently testable.

---

### F2.1 — `gram-status-badge.tsx`

```tsx
type DemandStatus = 'UNPAID' | 'PARTIAL' | 'PAID'

const CONFIG = {
  UNPAID:  { label: { mr: 'न भरलेले', en: 'Unpaid'  }, color: 'gp-status-unpaid'  },
  PARTIAL: { label: { mr: 'अंशतः',    en: 'Partial' }, color: 'gp-status-partial' },
  PAID:    { label: { mr: 'भरलेले',   en: 'Paid'    }, color: 'gp-status-paid'    },
}

export function GramStatusBadge({ status, locale }: { status: DemandStatus; locale: 'mr'|'en' })
```

Used on: demand register, property detail, citizen detail.

---

### F2.2 — `gram-amount.tsx`

Formats monetary amounts consistently across the app.

```tsx
// ₹1,200.00 — always INR, always 2 decimal places, right-aligned in tables
export function GramAmount({ value, className }: { value: number | Decimal; className?: string })
```

Used on: every table with a money column.

---

### F2.3 — `gram-stat-card.tsx`

Dashboard stat card with label, value, and optional trend/delta.

```tsx
export function GramStatCard({
  label: string,      // Marathi label
  value: string,      // formatted value e.g. "₹1,24,500"
  sub?: string,       // e.g. "या महिन्यात" (this month)
  icon?: LucideIcon,
  variant?: 'default' | 'warning' | 'success'
})
```

---

### F2.4 — `gram-data-table.tsx`

Thin wrapper around an HTML `<table>` with GP-consistent styling:
- Sticky header
- Row hover highlight
- Right-aligned amount columns (pass `align="right"` on column def)
- Empty state slot (pass `emptyState` prop with Marathi message)
- Loading skeleton (pass `isLoading` prop)

This is not a full headless table lib — just consistent styling for the 6–7 tables in this app.

---

### F2.5 — `gram-search-input.tsx`

Search input with:
- Magnifying glass icon prefix
- Clear (×) button when value is non-empty
- Debounce built in (300ms default, configurable)
- Marathi placeholder passed as prop

Used on: citizens list, properties list, collection citizen search.

---

### F2.6 — `gram-half-year-tabs.tsx`

Reusable tab set for half-year selection. Used on demand register page.

```tsx
// Tab 1: सहामाही १  (एप्रिल - सप्टेंबर)
// Tab 2: सहामाही २  (ऑक्टोबर - मार्च)
export function GramHalfYearTabs({ value, onChange })
```

---

**Acceptance for F2:** All 6 components render in isolation with props. No DB dependency. Export from `packages/shadcn/src/components/gram/index.ts`.

---

## Phase F3 — Static Page Builds (mock data, no DB)

Build every page with hardcoded mock data arrays. One task per page. Do **not** wire Server Actions yet — use `MOCK_*` constants at the top of the file.

Order: highest demo-impact pages first.

| Task | Page | Mock data shape |
|------|------|----------------|
| F3.1 | Dashboard | 4 stat numbers, 5 receipt rows |
| F3.2 | Tax Demand (N09) | 10 demand rows, half-year tabs |
| F3.3 | Collect Payment | Citizen search result + 4 demand rows |
| F3.4 | Receipt View | 1 receipt with demand breakdown |
| F3.5 | Citizens List | 20 citizen rows |
| F3.6 | Properties List | 20 property rows |
| F3.7 | Assessment (N08) | 10 properties × 4 tax rows, grouped |
| F3.8 | Cash Book (N05) | 10 entries with running balance |
| F3.9 | Classified Register (N06) | 4 heads × 6 months |
| F3.10 | Citizen Detail | 1 citizen, 2 properties, 3 receipts |
| F3.11 | Property Detail | 1 property, assessment + demand history |

**Mock data conventions:**
- Use realistic Marathi names and amounts
- Include at least one UNPAID, one PARTIAL, one PAID row in demand mocks
- Include one property with arrear_bf > 0 in demand mocks
- All amounts in realistic GP range: ₹200–₹5,000 per tax per half-year

**Acceptance for F3:** Every page renders without errors. GramStatCard, GramStatusBadge, GramAmount, GramDataTable components visible and styled correctly across all pages. Zero DB calls.

---

## Phase F4 — Incremental Data Wiring

Replace mock data one page at a time, in the same demo-impact order as F3.
Each task: delete the `MOCK_*` constant, import the Server Action, pass real data.

| Task | Page | Server Action |
|------|------|--------------|
| F4.1 | Dashboard | `getDashboardStats()` |
| F4.2 | Tax Demand | `getDemands(fyId, halfYear)` |
| F4.3 | Collect — citizen search | `getOutstandingDemands(citizenId)` |
| F4.4 | Receipt View | `getReceipt(id)` |
| F4.5 | Citizens List | `getCitizens(search)` |
| F4.6 | Properties List | `getProperties(filters)` |
| F4.7 | Assessment | `getAssessments(ayId)` |
| F4.8 | Cash Book | raw SQL query from Task 6.1 |
| F4.9 | Classified Register | `getClassifiedReceipts(fyId)` |
| F4.10 | Citizen Detail | `getCitizen(id)` |
| F4.11 | Property Detail | `getProperty(id)` |

**Acceptance for F4:** Each page shows real seed data. Static mocks completely removed. Skeleton loading state shown while Server Action resolves.

---

## Build Sequence Summary

```
F0  Theme + font setup                    ← 1 day
F1  App shell + nav wiring                ← 0.5 day
F2  GP components (6 components)          ← 1.5 days
F3  All pages static (11 pages)           ← 3 days
    ── demo-ready UI checkpoint ──
F4  Incremental data wiring               ← runs alongside main impl plan phases 2–6
    (one F4 task per main impl task)
```

After F3 is complete, the demo is **visually presentable** to a Gram Sevak even without live data. The "wow" of the UI is visible before the backend is complete.

---

## Component Export Checklist

Add to `packages/shadcn/src/components/gram/index.ts`:

```ts
export { GramAppShell }      from './gram-app-shell'
export { GramSidebarNav }    from './gram-sidebar-nav'
export { GramSidebarBrand }  from './gram-sidebar-brand'
export { GramStatusBadge }   from './gram-status-badge'   // F2.1
export { GramAmount }        from './gram-amount'          // F2.2
export { GramStatCard }      from './gram-stat-card'       // F2.3
export { GramDataTable }     from './gram-data-table'      // F2.4
export { GramSearchInput }   from './gram-search-input'    // F2.5
export { GramHalfYearTabs }  from './gram-half-year-tabs'  // F2.6
```
