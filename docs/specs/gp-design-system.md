# GP Design System
## Color, Typography, and Component Tokens

> Maharashtra Gram Panchayat — Accounting & Audit Tools
> Last updated: 2026-04-18
> Source of truth: `packages/shadcn/src/styles/gp-theme-layer.css`

---

## Component naming vs tokens

| Kind | Convention | Examples |
|------|--------------|----------|
| **CSS / Tailwind tokens** | Keep **`gp-*`** (and `sidebar-*`) | `--gp-primary`, `text-gp-status-paid`, `bg-cta` |
| **GP layout chrome** | **`Gram*`** in `components/gram/` | `GramAppShell`, `GramSidebarNav`, `GramAppNavbar` |
| **Reusable UI primitives** | **Generic PascalCase** in `components/ui/` | `SearchInput`, `Button`, `StatCard`, `Amount` |

Primitives do **not** get a `Gram` prefix. The `Gram` prefix means “this file is part of the GP app shell / nav composition,” not “this is used in a GP product.”

Forms: use **react-hook-form** in the app (`useController`, `register`); pass **controlled props** into `ui` inputs. `@gp/shadcn` does not ship `FormProvider` wrappers.

---

## Rationale

### Why Teal, Not Navy

Navy is the default choice for every Indian government portal (NIC, mahaonline, eDistrict). For a tool used daily by Gram Sevaks — who govern land, water, agriculture — teal is more contextually grounded. It signals:

- **Civic + land**: teal sits between the blue of governance and the green of agriculture
- **Accounting identity**: major accounting tools (Xero, Zoho Books) use teal-blue for the same reason — financial health, growth
- **Distinctiveness**: immediately differentiates this tool from the sea of navy government portals
- **eGramSwaraj alignment**: the national GP digitization platform uses a green-teal direction — familiar to our users

### Why Harvest Gold CTA

- Gold = authority + value in civic/legal contexts ("authority navy + trust gold" pattern)
- Harvest time is historically when village taxes were collected — subconscious resonance for Gram Sevaks
- Avoids political saffron associations (muted amber-gold, not bright saffron)
- Creates strong visual contrast against teal for CTAs

### Why the Accent Token Change Matters

In shadcn's design system, `bg-accent` is used for:
- Ghost and outline button hover backgrounds
- Skeleton loading animation backgrounds
- Badge hover states

The previous value was orange `#ea580c` — every button hover and every skeleton was orange. Changed to a neutral teal-gray `hsl(180 14% 94%)` which is the correct shadcn usage.

---

## Color Tokens

### Brand Primitives (`:root`)

| Token | HSL | Hex (approx) | Usage |
|---|---|---|---|
| `--gp-primary` | `175 73% 19%` | `#0C5E57` | Deep teal — primary brand, icons, active states |
| `--gp-primary-hover` | `175 73% 14%` | `#084540` | Hover state of primary |
| `--gp-primary-fg` | `0 0% 100%` | `#FFFFFF` | Text on primary bg |
| `--gp-cta` | `43 97% 39%` | `#C38A03` | Harvest gold — CTAs, highlights |
| `--gp-surface` | `180 20% 98%` | `#F5FAFA` | Page background (warm teal-white) |
| `--gp-border` | `180 12% 88%` | `#D7E2E2` | Card/divider borders |
| `--gp-muted` | `180 6% 46%` | `#6F8080` | Muted text, labels |

### Status Colors (semantic, do not change)

| Token | HSL | Hex | Meaning |
|---|---|---|---|
| `--gp-status-paid` | `142 71% 45%` | `#1FAF51` | Tax paid — green |
| `--gp-status-paid-bg` | `142 71% 97%` | `#F0FFF5` | Paid badge background |
| `--gp-status-partial` | `38 92% 50%` | `#F5A004` | Partial payment — amber |
| `--gp-status-partial-bg` | `38 92% 97%` | `#FFFBF0` | Partial badge background |
| `--gp-status-unpaid` | `0 72% 51%` | `#E03030` | Unpaid — red |
| `--gp-status-unpaid-bg` | `0 72% 97%` | `#FFF5F5` | Unpaid badge background |

> Status green (`142°`) and primary teal (`175°`) are 33° apart in hue — clearly distinct visually. No collision.

### Sidebar Tokens (`:root`)

| Token | Value | Note |
|---|---|---|
| `--sidebar` | `0 0% 100%` | White sidebar |
| `--sidebar-foreground` | `175 40% 10%` | Dark teal-tinted text |
| `--sidebar-primary` | `var(--gp-primary)` | Brand teal |
| `--sidebar-accent` | `180 20% 96%` | Hover/active bg in sidebar |
| `--sidebar-border` | `180 15% 90%` | Sidebar separator |
| `--sidebar-ring` | `var(--gp-primary)` | Focus ring |

### Dark Mode Sidebar (`.dark`)

| Token | Value |
|---|---|
| `--sidebar-primary` | `175 73% 52%` — lighter teal |
| `--sidebar-accent` | `175 10% 18%` — dark muted surface |
| `--sidebar-accent-foreground` | `175 20% 90%` |
| `--sidebar-border` | `175 10% 20%` |
| `--sidebar-ring` | `175 73% 52%` |

### Semantic Tailwind Tokens (`@theme inline`)

These map to `bg-*`, `text-*`, `border-*` etc. in Tailwind classes.

| Tailwind token | Value | Purpose |
|---|---|---|
| `background` | `hsl(--gp-surface)` | Page bg |
| `foreground` | `hsl(175 40% 8%)` | Body text |
| `card` | `hsl(0 0% 100%)` | Card surface |
| `primary` | `hsl(--gp-primary)` | Brand teal |
| `primary-foreground` | `hsl(--gp-primary-fg)` | Text on teal |
| `primary-light` | `hsl(175 73% 95%)` | Tinted bg (chips, badges) |
| `secondary` | `hsl(--gp-surface)` | Same as bg — subtle variant |
| `muted` | `hsl(--gp-surface)` | Muted surface |
| `muted-foreground` | `hsl(--gp-muted)` | Muted text |
| `accent` | `hsl(180 14% 94%)` | Hover bg (ghost buttons, skeletons) |
| `accent-foreground` | `hsl(175 40% 10%)` | Text on accent hover |
| `cta` | `hsl(--gp-cta)` | Harvest gold — action buttons |
| `cta-foreground` | `hsl(0 0% 100%)` | Text on gold |
| `border` | `hsl(--gp-border)` | Default border |
| `ring` | `hsl(--gp-primary)` | Focus ring |
| `destructive` | `hsl(--gp-status-unpaid)` | Error / unpaid |
| `success` | `hsl(--gp-status-paid)` | Paid / success |
| `warning` | `hsl(--gp-status-partial)` | Partial / warning |

---

## Token Usage Rules

### `bg-primary` vs `bg-cta`

| Token | Use for |
|---|---|
| `bg-primary` | Brand icons, active nav indicators, filled buttons |
| `bg-cta` | High-emphasis action buttons (Save, Submit, Pay Now) |

Never use `bg-accent` for prominent UI — it is intentionally low-contrast for hover states only.

### `bg-accent` — hover/muted only

```tsx
// ✅ correct — ghost button hover (handled by shadcn internally)
<Button variant="ghost">Cancel</Button>

// ❌ wrong — using accent as a visible decorative bg
<div className="bg-accent rounded-lg p-4">...</div>
// use bg-muted or bg-primary-light instead
```

### Status badges — always use semantic tokens

```tsx
// ✅
<Badge className="bg-success-bg text-success">Paid</Badge>
<Badge className="bg-destructive-bg text-destructive">Unpaid</Badge>
<Badge className="bg-warning-bg text-warning">Partial</Badge>
```

---

## Typography

### Font Stack

```css
--font-sans: 'Noto Sans Devanagari', ui-sans-serif, system-ui, sans-serif;
```

Noto Sans Devanagari is the default for all text — it handles both Devanagari (Marathi) and Latin scripts cleanly. Loaded at weights 400, 500, 600, 700.

**Why not separate Latin/Devanagari fonts?**  
GP offices run Windows with slow/patchy internet. Adding a second font (e.g. Lexend for Latin) doubles font load requests. Noto Sans Devanagari's Latin coverage is clean enough for this use case.

**Marathi-specific override** (`[lang='mr'] body`):
```css
font-family: var(--font-devanagari);
```

### Scale

| Role | Size | Weight | Class |
|---|---|---|---|
| Page heading | `24px` | 700 | `text-2xl font-bold` |
| Section heading | `18px` | 600 | `text-lg font-semibold` |
| Card title | `14px` | 600 | `text-sm font-semibold` |
| Body | `14px` | 400 | `text-sm` |
| Marathi label | `13px` | 600 | `text-[13px] font-semibold` |
| Marathi sub-label | `11px` | 400 | `text-[11px]` |
| Badge / micro | `10px` | 600 | `text-[10px] font-semibold uppercase tracking-wider` |

---

## Sidebar Component Tokens

The sidebar uses its own parallel token set (`--sidebar-*`) so it can be styled independently from the main content area.

### Active nav item

```
bg-sidebar-accent          ← teal-tinted hover/active bg
text-sidebar-accent-foreground
ring-1 ring-primary/25     ← subtle teal glow
```

### Brand icon wrap

```
bg-primary text-primary-foreground    ← teal square
size-10 rounded-lg shadow-sm
```

Collapsed icon rail: `size-8 shadow-none` (no bg/border on card, just the icon wrap).

### Brand card gradient

```css
bg-linear-to-br from-primary/[0.07] via-transparent to-accent/6
```

Primary teal at 7% opacity → accent neutral at 6% opacity. Barely visible — adds warmth without competing with content.

---

## Anti-patterns

| Avoid | Why | Use instead |
|---|---|---|
| `bg-accent` as decorative bg | It's a hover token — will look washed out | `bg-muted` or `bg-primary-light` |
| Hardcoded hex in components | Breaks dark mode, theming | Tailwind semantic tokens |
| `text-primary` on small text | May fail WCAG AA at small sizes | Test contrast — use `text-foreground` if in doubt |
| Orange for brand/CTA | Was the original bug — orange ≠ shadcn accent | `bg-cta` for harvest gold CTAs |
| Navy (`hsl(215 52% 24%)`) | Generic gov-portal look | Teal `hsl(175 73% 19%)` |
| Mixing status green with primary teal | Could confuse state | Hues are 33° apart — always check visually |

---

## Editing the Theme

All token changes go in `packages/shadcn/src/styles/gp-theme-layer.css`.

**To change the brand color**: update `--gp-primary` and `--gp-primary-hover` in `:root`, and `--sidebar-primary` / `--sidebar-ring` in `.dark`. `--color-primary-light` in `@theme inline` needs a manual hue update too.

**To change the CTA**: update `--gp-cta` only. All `bg-cta` uses update automatically.

**Never change status colors** — they are semantically locked to Maharashtra GP accounting states (paid/partial/unpaid).
