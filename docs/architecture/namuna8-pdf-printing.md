# Wide Namune — Printing & PDF Strategy

> Status: plan / not yet implemented
> Last updated: 2026-04-25
> Owner: grampanchayat FE

## Goal

Let Gram Sevaks print and download wide Namune cleanly, starting with Namuna 8
and Namuna 9.

These registers are **horizontally wide** and **bilingual** (Marathi Devanagari
+ English/numerals). Fidelity matters — these are legal/audit registers, not
marketing PDFs.

Initial scope:

- **N08** — property assessment / उतारा, ~25–30 columns in register form.
- **N09** — demand register, fewer columns than N08 but with grouped tax-head
  columns: 4 heads × `{मागील | चालू | एकूण}` plus owner/property/status fields.

## Decision

**Phase 1 — Native browser print (`window.print()` + `@media print` CSS).**
Zero dependencies. Ship this first for N08 and N09.

**Phase 2 — `jspdf` + `jspdf-autotable`** (only if Phase 1 isn't enough).
This is the preferred client-side PDF library for N08/N09-style table exports
because it has table primitives, repeated headers, custom fonts, and horizontal
page breaking.

**Phase 3 — Server-side Chromium PDF** (later, only if needed).
Use Playwright/Chromium PDF generation when we need exact HTML/CSS parity,
batch exports, or a server endpoint that returns an official PDF without asking
the user's browser/printer to behave consistently.

**Rejected:**
- `html2canvas` / `html2pdf.js` — rasterises table, kills text search,
  Devanagari kerning breaks, file size explodes. No.
- `@react-pdf/renderer` for wide registers — too much manual layout for 19–30
  column legal tables. Good for certificates, receipts, covers, and notices.

---

## Namuna 9 fit check

N09 should use this same strategy.

Why it fits:

- N09 is a table-first document.
- Real N09 layout is grouped by tax head:
  `घरपट्टी`, `सफाईपट्टी`, `दिवाबत्ती`, `पाणीपट्टी`, plus totals.
- Each head needs `{मागील | चालू | एकूण}`. This maps cleanly to grouped table
  headers in HTML and to `colSpan`/`rowSpan` in `jspdf-autotable` later.
- N09 is narrower than the full N08 physical register. A3 landscape is safe;
  A4 landscape may work with compact typography, but A3 should be the default
  for full-register parity.

N09 print route should eventually follow the same pattern:

- `app/[tenant]/(admin)/admin/namuna9/print/page.tsx`
- reusable table component, e.g. `components/admin/namuna9-register-table.tsx`
- `data-print-region="namuna9"`
- register-specific print CSS, or a shared `wide-namuna-print.css` with a
  `data-print-region` selector per register.

For N09, do not rasterise the table. We need searchable/copyable text and stable
numbers for audit review.

## Phase 1 — Native print (implement now)

### Where it plugs in

- `apps/grampanchayat/components/admin/namuna8-print-actions.tsx` — wire the
  print button to `window.print()`.
- `apps/grampanchayat/components/admin/namuna8-utara-table.tsx` — add a
  print-only wrapper class, e.g. `data-print-region="namuna8"`.
- New file: `apps/grampanchayat/app/[tenant]/(admin)/admin/namuna8/print.css`
  (or co-locate as `namuna8-print.css` next to the table component).

### Print stylesheet — minimum requirements

```css
@media print {
  @page {
    size: A3 landscape;
    margin: 10mm 8mm;
  }

  /* hide app chrome */
  body * { visibility: hidden; }
  [data-print-region="namuna8"],
  [data-print-region="namuna8"] * { visibility: visible; }
  [data-print-region="namuna8"] {
    position: absolute;
    inset: 0;
  }

  /* table behaviour */
  table { border-collapse: collapse; width: 100%; font-size: 9pt; }
  thead { display: table-header-group; }   /* repeats on every page */
  tfoot { display: table-footer-group; }
  tr    { page-break-inside: avoid; }
  th, td { padding: 4px 6px; border: 0.5px solid #333; }

  /* hide interactive UI inside the region */
  .no-print { display: none !important; }
}
```

### Devanagari rendering

- No font embed needed for native print — browser uses installed system fonts.
- Already loading Noto Sans Devanagari globally (verify in `app/layout.tsx`).
- Keep `font-family` consistent in the print stylesheet; don't rely on web
  fonts that may not resolve in the print pipeline (Safari can drop them).

### A3 vs A4 decision

- Default: **A3 landscape** for full wide-register parity.
- N08 full register: A3 landscape.
- N08 single-property उतारा: A4 landscape may be acceptable after visual QA.
- N09 register: A3 landscape default; A4 landscape compact mode can be added
  only after a real print test passes.
- Optional: **A4 landscape** with a "compact" toggle that hides 5–6 derived
  columns (e.g., subtotals). Add later if Gram Sevaks ask.

### Edge cases to handle

- **Header repeats**: `thead { display: table-header-group; }` — do not
  apply `position: sticky` to `thead` for print, it breaks repetition.
- **Row break**: `tr { page-break-inside: avoid; }` keeps a row from
  splitting across pages.
- **Numeric alignment**: right-align money columns (`text-align: right`)
  in print CSS too — easy miss.
- **Column widths**: use `table-layout: fixed` + explicit `<colgroup>` for
  predictable wrapping. Auto layout will jitter between print previews.
- **Currency / decimal**: render as plain string (already Decimal-safe via
  the API), don't rely on JS-side formatting at print time.
- **Page numbers**: `@page { @bottom-right { content: counter(page) " / " counter(pages); } }`
  — Chromium supports this; Safari ignores it. Acceptable.

### Acceptance checklist

- [ ] Print button triggers `window.print()` with no app chrome visible
- [ ] Header row repeats on every page
- [ ] No row splits across pages
- [ ] Marathi text renders correctly in Chrome + Edge (Safari best-effort)
- [ ] A3 landscape is the default
- [ ] "Save as PDF" via OS dialog produces a clean, searchable PDF
- [ ] File size for 100-row register stays under 500 KB

---

## Phase 2 — `jspdf` + `jspdf-autotable` (defer)

### When to add

Trigger upgrading to Phase 2 only when one of these is true:

1. We need a **download** without a print dialog (one-click "Download PDF").
2. We need to **bulk-export** all properties at once (cron / batch).
3. Audit requires **byte-identical output** across browsers.
4. Server-side PDF generation enters scope (same lib runs in Node).

### Bundle / install

```bash
pnpm --filter grampanchayat add jspdf jspdf-autotable
```

- `jspdf` ~ 100 KB gzip
- `jspdf-autotable` ~ 30 KB gzip
- Lazy-load the route — don't ship in the main bundle.

### Devanagari font setup (one-time)

1. Download Noto Sans Devanagari TTF (Regular + Bold).
2. Convert to base64 once and commit as
   `apps/grampanchayat/lib/fonts/noto-devanagari.ts` (export the strings).
3. Register inside the lazy-loaded PDF module:

```ts
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { notoDevanagariRegular, notoDevanagariBold } from '@/lib/fonts/noto-devanagari';

export function buildNamuna8Pdf(rows: Namuna8Row[]) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a3' });

  doc.addFileToVFS('NotoDevanagari-Regular.ttf', notoDevanagariRegular);
  doc.addFont('NotoDevanagari-Regular.ttf', 'NotoDevanagari', 'normal');
  doc.addFileToVFS('NotoDevanagari-Bold.ttf', notoDevanagariBold);
  doc.addFont('NotoDevanagari-Bold.ttf', 'NotoDevanagari', 'bold');
  doc.setFont('NotoDevanagari');

  autoTable(doc, {
    head: [NAMUNA8_COLUMNS_MR],     // Marathi headers
    body: rows.map(toRowArray),
    styles: { font: 'NotoDevanagari', fontSize: 8, cellPadding: 1.5 },
    headStyles: { fillColor: [240, 240, 240], textColor: 20, fontStyle: 'bold' },
    showHead: 'everyPage',          // repeating header
    margin: { top: 12, right: 8, bottom: 12, left: 8 },
    didDrawPage: (data) => {
      const pageNo = doc.getNumberOfPages();
      doc.setFontSize(8);
      doc.text(`Page ${data.pageNumber} / ${pageNo}`, data.settings.margin.left, 8);
    },
  });

  return doc;
}
```

### Wide table handling

`autoTable` has native support for horizontal page breaking. Two strategies:

- **Single wide A3 page (preferred)**: let autoTable lay all columns on one
  landscape A3 page. Set `tableWidth: 'auto'` and trust column flex.
- **Horizontal page break**: for full N08 / extra-wide reports, use
  `horizontalPageBreak: true` and repeat key identity columns such as property
  no + owner using `horizontalPageBreakRepeat`.

### Server-side option (later)

Same `buildNamuna8Pdf` can run inside `apps/grampanchayat-api` (Node) since
`jspdf` is isomorphic. Lets us return a PDF stream from an API route for
bulk export. Defer until needed.

---

## Tool options reviewed

| Option | Good for | Weak for | Decision |
|---|---|---|---|
| Browser print + CSS | immediate local desktop print/download via OS dialog, Devanagari text, no bundle cost | cross-browser exactness, one-click PDF download | **Use now** |
| `jspdf` + `jspdf-autotable` | N08/N09/N06-style tables, grouped headers, repeated headers, horizontal page breaks, client-side download | requires font embedding + custom table layout work | **Best FE PDF library if native print is not enough** |
| `pdfmake` | structured PDFs, custom table layouts, repeated headers | weak for very wide horizontal splitting; more manual strip logic | Keep as backup, not first choice |
| `@react-pdf/renderer` | receipts, certificates, notices, covers, server/client React PDF components | wide statutory tables require hand-building layout; large browser PDFs can block UI | Use for N10 receipt / notice-style docs, not N08/N09 registers |
| Playwright / Chromium `page.pdf()` | exact HTML/CSS parity, batch/server exports, official PDF endpoint | server dependency, heavier infra, not pure FE | Best later server-side export path |

Practical rule:

- **Local print only**: native browser print.
- **One-click client download for a table**: `jspdf` + `jspdf-autotable`.
- **Receipt/certificate PDF**: `@react-pdf/renderer` or native print, depending
  on desired visual control.
- **Official generated PDF endpoint / batch export**: Playwright/Chromium on
  the server.

## Implementation order

1. Wire `data-print-region="namuna8"` on the table wrapper.
2. Add print stylesheet (above) and import it in the namuna8 admin page.
3. Implement `print()` handler in `namuna8-print-actions.tsx`.
4. Manual QA against checklist above on Chrome + Edge + Safari.
5. Stop. Ship.
6. Revisit Phase 2 only when a real trigger appears (see "When to add").

## Excel exports — keep client-side (initial product phase)

> Decision: 2026-04-25. Revisit when paying customers + real load justify a
> server-side export pipeline.

For masters and large registers (N05, N06, N10), Excel/CSV exports run
**entirely on the client** during initial product development. No Express
endpoint, no Supabase Storage signed URLs, no server CPU spent on xlsx
serialization.

### Why client-side for now

- Initial GP load is low — 1–3 concurrent admins per tenant, not 20.
- Free-tier API hosting (Render/Railway) has 512 MB RAM and throttled CPU;
  ExcelJS XML serialization is CPU-bound and would starve real API writes
  under any concurrency.
- Each user pays their own browser compute → infinite horizontal scaling
  for free.
- RLS on Supabase already restricts queries to the admin's own tenant, so
  pulling rows directly into the browser is safe.

### Pattern

```ts
import * as XLSX from 'xlsx';
import { supabase } from '@/lib/supabase/client';

const { data } = await supabase
  .from('properties')
  .select('*')
  .eq('tenant_id', tenantId);

const sheet = XLSX.utils.json_to_sheet(data);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, sheet, 'Properties');
XLSX.writeFile(wb, `properties-${tenantId}.xlsx`);
```

- Library: SheetJS (`xlsx`) community edition.
- Lazy-load it in the export handler; do not ship in the main bundle.
- Comfortable up to ~10k rows. Past ~50k, performance degrades.

### CSV fallback

For raw dumps where formatting doesn't matter, build CSV string in the
browser and trigger a `Blob` download — zero library cost.

### When to revisit (Phase 2 — server-side)

Move to server-side ExcelJS streaming + Supabase Storage signed URLs only
when one of these is true:

1. A single export regularly exceeds ~50k rows and chokes the browser.
2. Paying customers ask for scheduled / bulk / archived exports.
3. We need server-stamped audit workbooks (locked cells, signatures,
   formulas) that must not be tampered with client-side.

Until then, do not build the server export pipeline. Keep API focused on
domain writes and namuna calculations.

## References

- Namuna 8 column reconciled spec: `docs/specs/2026-04-18-maharashtra-gp-33-namune-reconciled.md`
- Tax chain implementation: `docs/specs/2026-04-24-tax-chain-implementation-plan.md`
- jspdf-autotable docs: https://github.com/simonbengtsson/jsPDF-AutoTable
- SheetJS (xlsx) docs: https://docs.sheetjs.com/
