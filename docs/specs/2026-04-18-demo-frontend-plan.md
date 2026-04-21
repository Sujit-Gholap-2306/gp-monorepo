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

## Phase progress

| Phase | Status |
|-------|--------|
| F0 — Theme | Done |
| F1 — App shell + navigation | Done |
| F2 — Shared UI primitives (6) | Done |
| F3 — Static demo pages (11 in plan) | In progress — see F3 task table |
| F4 — Incremental data wiring (per plan) | Not started |

### Status grid (at a glance)

| Task | Page | Status |
|------|------|--------|
| F3.1 | Dashboard | Done |
| F3.2 | Tax demand (N09) | Done |
| F3.3 | Collect payment | Partial |
| F3.4 | Receipt view | Todo |
| F3.5 | Citizens list | Todo |
| F3.6 | Properties list | Todo |
| F3.7 | Assessment (N08) | Done |
| F3.8 | Cash book (N05) | Todo |
| F3.9 | Classified register (N06) | Todo |
| F3.10 | Citizen detail | Todo |
| F3.11 | Property detail | Todo |

**F3 rollup:** 3 done · 1 partial · 7 todo.

| F2 primitive | Export | Status |
|--------------|--------|--------|
| `SearchInput` | `@gp/shadcn/ui/search-input` | Done |
| `StatusBadge` | `@gp/shadcn/ui/status-badge` | Done |
| `Amount` | `@gp/shadcn/ui/amount` | Done |
| `StatCard` | `@gp/shadcn/ui/stat-card` | Done |
| `DataTable` | `@gp/shadcn/ui/data-table` | Done |
| `HalfYearTabs` | `@gp/shadcn/ui/half-year-tabs` | Done |

### Backend / master data (current repo)

There is **no server-side RDBMS/API** for masters yet. **Client persistence** today:

| Area | Persistence |
|------|-------------|
| **Tier-1 masters** (GP profile, FY, AY, heads, banks, citizens, elected) | Browser **IndexedDB** store `masters` — seeded from `lib/masters/demo-seed.ts`, read via `lib/masters/repository.ts`; UI at `/masters` |
| Utaras (demo register) | Browser **IndexedDB** `utaras` (`lib/db.ts`) |
| Namuna 8 assessment demo | **TypeScript seed** (`lib/data/namuna8-seed`) |
| Tax demand demo | **In-page mocks** |
| Other screens (F3 placeholders) | **None / placeholder copy** |

Full production **master modules** remain defined in `docs/specs/2026-04-18-maharashtra-gp-master-modules.md`; replace seeds with **F4 Server Actions + real DB** when the backend is chosen.

---

## Naming — `gram/*` vs `ui/*`

| Location | Prefix / names | Purpose |
|----------|----------------|---------|
| `packages/shadcn/src/components/gram/` | **`Gram*`** (`GramAppShell`, `GramSidebarNav`, …) | GP **application chrome**: shell, sidebar, navbar, context strip — tied to this product’s layout IA. |
| `packages/shadcn/src/components/ui/` | **Generic** (`SearchInput`, `Button`, `Amount`, …) | **Reusable primitives** usable in any screen; no `Gram` in the component name. |
| `gp-theme-layer.css` / Tailwind | **`gp-*`, `sidebar-*`** | **Design tokens** (not components) — keep the `gp-` token prefix for brand/status. |

Do **not** prefix every component with `Gram` or `GP`. Only the gram-folder layout family uses `Gram*`.

---

## What Already Exists in `@gp/shadcn`

- `gram-app-shell.tsx` — main layout shell (sidebar + main area)
- `gram-sidebar-nav.tsx` — nav item renderer
- `gram-sidebar-brand.tsx` — top branding area in sidebar
- `gram-types.ts` — nav item type definitions
- shadcn/ui: `button`, `input`, `search-input`, `sidebar`, `skeleton`, `tooltip`, `sheet`, `scroll-area`
- `gp-theme-layer.css` — GP brand + semantic Tailwind tokens (imported via `@gp/shadcn/globals.css`)

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

## Phase F2 — Shared UI primitives

**Package:** `packages/shadcn/src/components/ui/` (generic names; export map `@gp/shadcn/ui/*`)

Build these before touching any page. Each is independently testable. RHF: parents use `useController` / `register` and pass **controlled props** into primitives — no `FormProvider` requirement in `@gp/shadcn`.

### F2 progress

| Task | Component | Path / export | Status |
|------|-----------|----------------|--------|
| F2.5 | `SearchInput` | `@gp/shadcn/ui/search-input` | Done |
| F2.1 | `StatusBadge` (demand: UNPAID / PARTIAL / PAID) | `@gp/shadcn/ui/status-badge` | Done |
| F2.2 | `Amount` (INR formatter) | `@gp/shadcn/ui/amount` | Done |
| F2.3 | `StatCard` | `@gp/shadcn/ui/stat-card` | Done |
| F2.4 | `DataTable` | `@gp/shadcn/ui/data-table` | Done |
| F2.6 | `HalfYearTabs` | `@gp/shadcn/ui/half-year-tabs` | Done |

---

### F2.1 — `status-badge.tsx` → **`StatusBadge`**

```tsx
type DemandStatus = 'UNPAID' | 'PARTIAL' | 'PAID'

const CONFIG = {
  UNPAID:  { label: { mr: 'न भरलेले', en: 'Unpaid'  }, color: 'gp-status-unpaid'  },
  PARTIAL: { label: { mr: 'अंशतः',    en: 'Partial' }, color: 'gp-status-partial' },
  PAID:    { label: { mr: 'भरलेले',   en: 'Paid'    }, color: 'gp-status-paid'    },
}

export function StatusBadge({ status, locale }: { status: DemandStatus; locale: 'mr'|'en' })
```

Used on: demand register, property detail, citizen detail.

---

### F2.2 — `amount.tsx` → **`Amount`**

Formats monetary amounts consistently across the app.

```tsx
// ₹1,200.00 — always INR, always 2 decimal places, right-aligned in tables
export function Amount({ value, className }: { value: number; className?: string })
```

Used on: every table with a money column.

---

### F2.3 — `stat-card.tsx` → **`StatCard`**

Dashboard stat card with label, value, and optional trend/delta.

```tsx
export function StatCard({
  label: string,      // Marathi label
  value: string,      // formatted value e.g. "₹1,24,500"
  sub?: string,       // e.g. "या महिन्यात" (this month)
  icon?: LucideIcon,
  variant?: 'default' | 'warning' | 'success'
})
```

---

### F2.4 — `data-table.tsx` → **`DataTable`**

**Stack:** [TanStack Table v8](https://tanstack.com/table/v8) (headless) — `createColumnHelper` + typed `ColumnDef`, stable `data`/`columns` refs from the app, `getCoreRowModel` / `getSortedRowModel`. **API calls stay in the app** (e.g. React Query); the table only renders props.

**Package layout** (`packages/shadcn/src/components/ui/data-table/`):
- `types.ts` — props + `ColumnMeta` typing
- `table-augmentation.ts` — `ColumnMeta` merge (`align`, header/cell class names)
- `data-table-utils.ts` — header/cell alignment class helpers
- `use-data-table.ts` — `useReactTable` wiring
- `data-table.tsx` — GP-styled `<table>` shell

**UX:** Sticky header row, row hover, `meta.align: 'right'` for amounts, optional `isLoading` skeleton rows, `emptyState`, header sort indicators (where sorting enabled).

---

### F2.5 — `search-input.tsx` → **`SearchInput`** (done)

Search input with:
- Magnifying glass icon prefix
- Clear (×) button when value is non-empty
- Debounce built in (300ms default, configurable)
- Marathi placeholder passed as prop

**Implemented:** `packages/shadcn/src/components/ui/search-input/`, import `@gp/shadcn/ui/search-input`.

Used on: citizens list, properties list, search page, collection citizen search.

---

### F2.6 — `half-year-tabs.tsx` → **`HalfYearTabs`**

Reusable tab set for half-year selection. Used on demand register page.

```tsx
// Tab 1: सहामाही १  (एप्रिल - सप्टेंबर)
// Tab 2: सहामाही २  (ऑक्टोबर - मार्च)
export function HalfYearTabs({ value, onChange })
```

**Package layout:** `half-year-utils.ts` (pure `HalfYearIndex`, labels, calendar-month → half, guards), `types.ts` (props), `half-year-tabs.tsx` (client, roving tabindex, Arrow/Home/End keys). Optional `HalfYearTabPanel` for `role="tabpanel"` wiring. Locale-specific option tuples cached at module scope.

---

**Acceptance for F2:** All six primitives render in isolation with props only. No DB dependency. Each exported in `packages/shadcn/package.json` under `./ui/<name>` (and existing `./gram-*` entries stay for layout chrome only).

---

## Phase F3 — Static Page Builds (mock data, no DB)

Build every page with hardcoded mock data arrays. One task per page. Do **not** wire Server Actions yet — use `MOCK_*` constants at the top of the file.

Order: highest demo-impact pages first.

| Task | Page | Mock data shape | Status |
|------|------|-----------------|--------|
| F3.1 | Dashboard | 4 stat numbers, 5 receipt rows | Done |
| F3.2 | Tax Demand (N09) | 10 demand rows, half-year tabs | Done |
| F3.3 | Collect Payment | Citizen search result + 4 demand rows | Partial |
| F3.4 | Receipt View | 1 receipt with demand breakdown | Todo |
| F3.5 | Citizens List | 20 citizen rows | Todo |
| F3.6 | Properties List | 20 property rows | Todo |
| F3.7 | Assessment (N08) | 10 properties × 4 tax rows, grouped | Done |
| F3.8 | Cash Book (N05) | 10 entries with running balance | Todo |
| F3.9 | Classified Register (N06) | 4 heads × 6 months | Todo |
| F3.10 | Citizen Detail | 1 citizen, 2 properties, 3 receipts | Todo |
| F3.11 | Property Detail | 1 property, assessment + demand history | Todo |

**Mock data conventions:**
- Use realistic Marathi names and amounts
- Include at least one UNPAID, one PARTIAL, one PAID row in demand mocks
- Include one property with arrear_bf > 0 in demand mocks
- All amounts in realistic GP range: ₹200–₹5,000 per tax per half-year

**Acceptance for F3:** Every page renders without errors. `StatCard`, `StatusBadge`, `Amount`, `DataTable` (and other F2 primitives) visible and styled correctly across all pages. Zero DB calls.

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
F0  Theme + font setup                    ← done
F1  App shell + nav wiring                ← done
F2  UI primitives (6)                     ← done
F3  All pages static (11 pages)           ← in progress (3 done, 1 partial, 7 todo)
    ── demo-ready UI checkpoint ──
F4  Incremental data wiring               ← not started; runs alongside main impl plan
    (one F4 task per main impl task)
```

After F3 is complete, the demo is **visually presentable** to a Gram Sevak even without live data. The "wow" of the UI is visible before the backend is complete.

---

## Component export checklist

**GP chrome (existing pattern):** one export per folder under `./gram-*` in `packages/shadcn/package.json` (e.g. `GramAppShell`, `GramSidebarNav`, `GramSidebarBrand`).

**Generic primitives:** one export per `./ui/*` entry — no central `gram/index.ts` barrel required.

```text
@gp/shadcn/gram-app-shell
@gp/shadcn/gram-sidebar-nav
@gp/shadcn/gram-sidebar-brand
…
@gp/shadcn/ui/search-input     ✅ F2.5
@gp/shadcn/ui/status-badge     ✅ F2.1
@gp/shadcn/ui/amount           ✅ F2.2
@gp/shadcn/ui/stat-card        ✅ F2.3
@gp/shadcn/ui/data-table       ✅ F2.4
@gp/shadcn/ui/half-year-tabs   ✅ F2.6
```
