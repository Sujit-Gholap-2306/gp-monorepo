# GP Monorepo

Maharashtra Gram Panchayat accounting and audit tools.  
Built on the Maharashtra Village Panchayats Act 1958 and Lekha Sanhita (Accounting Code) 2011.

---

## What Is This

A monorepo for building software tools that help Gram Panchayat staff manage the 33 mandatory accounting registers (Namune), comply with audit requirements, and track budgets and expenditure.

**The core knowledge base:** A fully structured, dependency-mapped documentation of all 33 Namune — what each register is, who fills it, what it feeds into, and where audits commonly fail.

---

## Repo Structure

```
GP-Monorepo/
├── apps/
│   └── grampanchayat/          ← Next.js 16 app (port 3004)
├── packages/
│   └── shadcn/                 ← @gp/shadcn — GP-specific UI components
└── docs/
    ├── namune-vault/           ← Obsidian vault (primary knowledge base)
    │   ├── MOC-Master.md       ← Start here — full system overview
    │   └── Namune/             ← 33 notes + 11 category MOC files
    │       ├── Budget/
    │       ├── Cash/
    │       ├── Tax/
    │       ├── Receipt/
    │       ├── Expenditure/
    │       ├── Works/
    │       ├── Staff/
    │       ├── Property/
    │       ├── Advances/
    │       ├── Reporting/
    │       └── Audit/
    ├── namune-vault-cursor/    ← Cursor-generated reference vault (for comparison)
    ├── specs/                  ← Machine-readable master requirements
    │   └── 2026-04-18-maharashtra-gp-33-namune-reconciled.md  ← single source of truth
    └── Gram Panchayat Namune Requirements Document.txt  ← original Gemini draft
```

---

## Understanding the 33 Namune — Two Ways

The knowledge base supports two navigation modes. Use whichever fits your workflow.

---

### Option A — Graph View (Obsidian)

Best for understanding **how registers connect to each other** — who feeds whom, what the audit chain looks like, which registers are hubs.

**Setup (one-time):**

1. Download Obsidian — https://obsidian.md (free)
2. Open Obsidian → **Open folder as vault**
3. Navigate to: `GP-Monorepo/docs/namune-vault/`
4. Click **Open**

**Enable Dataview plugin (for queryable metadata):**

1. In Obsidian: Settings → Community plugins → Turn off Safe mode
2. Browse → search **Dataview** → Install → Enable
3. Restart Obsidian

**Open the graph:**

- Press `Cmd+Shift+G` (Mac) or `Ctrl+Shift+G` (Windows)
- Or: `Cmd+P` → type `Open graph view` → Enter
- Each node is one Namuna. Lines show data dependencies.

**Navigate the vault:**

| Starting point | How to open |
|---|---|
| Full system overview | Open `MOC-Master.md` |
| Budget chain | `Namune/Budget/MOC-Budget.md` |
| Daily cash flow | `Namune/Cash/MOC-Cash.md` |
| Tax collection cycle | `Namune/Tax/MOC-Tax.md` |
| Works / project registers | `Namune/Works/MOC-Works.md` |
| Audit trail | `Namune/Audit/MOC-Audit.md` |
| Any single register | `Namune/<Category>/Namuna-XX.md` |

Click any `[[Namuna-XX]]` wikilink to jump between connected registers.

---

### Option B — Mermaid Flow Diagrams (no install required)

Best for understanding **workflow sequences** — what happens first, what triggers what, what the daily/monthly process looks like.

Every MOC file contains a Mermaid `flowchart` diagram. These render natively in:

- **GitHub** — open any MOC file directly on github.com
- **VS Code** — install the [Markdown Preview Mermaid Support](https://marketplace.visualstudio.com/items?itemName=bierner.markdown-mermaid) extension
- **Obsidian** — renders automatically (no plugin needed)

**Files to read for each workflow:**

| Workflow | File |
|---|---|
| Full system (all chains) | `docs/namune-vault/MOC-Master.md` |
| Budget planning cycle | `docs/namune-vault/Namune/Budget/MOC-Budget.md` |
| Daily cash recording | `docs/namune-vault/Namune/Cash/MOC-Cash.md` |
| Tax demand → collection | `docs/namune-vault/Namune/Tax/MOC-Tax.md` |
| Receipts to cash book | `docs/namune-vault/Namune/Receipt/MOC-Receipt.md` |
| Payment approvals | `docs/namune-vault/Namune/Expenditure/MOC-Expenditure.md` |
| Works / scheme execution | `docs/namune-vault/Namune/Works/MOC-Works.md` |
| Staff & establishment | `docs/namune-vault/Namune/Staff/MOC-Staff.md` |
| Property records | `docs/namune-vault/Namune/Property/MOC-Property.md` |
| Loans & advances | `docs/namune-vault/Namune/Advances/MOC-Advances.md` |
| Monthly reporting | `docs/namune-vault/Namune/Reporting/MOC-Reporting.md` |
| Audit objections | `docs/namune-vault/Namune/Audit/MOC-Audit.md` |

---

## Master Requirements Spec

The single source of truth for all 33 registers is:

```
docs/specs/2026-04-18-maharashtra-gp-33-namune-reconciled.md
```

For every Namuna it documents:
- Legal reference (MVP Act 1958 / Lekha Sanhita 2011)
- Who maintains it, who approves it
- All fields in the physical register
- Dependency graph (`DEPENDS_ON` / `FEEDS_INTO`)
- Validation rules and cross-checks
- Audit risk rating and common objection points

Items marked `[VERIFY]` need confirmation against the physical Lekha Sanhita document or with a Gram Sevak.

---

## Dev Setup

**Requirements:** Node.js 20+, pnpm

```bash
# Install dependencies
pnpm install

# Run the GP app (port 3004)
pnpm dev

# Or run only the app
cd apps/grampanchayat && pnpm dev
```

**Type check:**
```bash
cd apps/grampanchayat && pnpm typecheck
```

---

## Stack

| Layer | Tech |
|---|---|
| App | Next.js 16, TypeScript, Tailwind CSS v4 |
| UI components | `@gp/shadcn` (packages/shadcn) |
| Monorepo | pnpm workspaces + Turborepo |
| Package scope | `@gp/*` |

---

## Legal Basis

| Document | Scope |
|---|---|
| Maharashtra Village Panchayats Act, 1958 | Governance structure, powers, obligations |
| Maharashtra GP Lekha Sanhita (Accounting Code), 2011 | All 33 Namune, formats, submission rules |
