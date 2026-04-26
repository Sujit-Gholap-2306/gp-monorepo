# Namuna 9 — N+1 Batch Fix

**Files changed:**
- `apps/grampanchayat-api/src/services/namuna9.service.ts` — `generate()`
- `apps/grampanchayat-api/src/services/namuna9-opening-balances.service.ts` — `importFile()`

---

## Fix 1 — `generate()` : N×2 → 2 DB hits

### Problem

Old code looped per property inside a transaction:
- `INSERT demand` → get ID → `INSERT 4 lines` → repeat

100 properties = 200 sequential DB hits inside one TX.

### Fix

1. Batch-insert all demand headers: `INSERT ... VALUES (all rows) RETURNING id, property_id`
2. Calculate tax per property in memory (pure function, no DB)
3. Batch-insert all lines: `INSERT ... VALUES (all rows)`

```
Before: N × (INSERT demand + INSERT 4 lines) = N×2 DB hits
After:  INSERT all demands + INSERT all lines = 2 DB hits
```

### Key detail

`onConflictDoNothing` with `.returning()` only returns **actually inserted** rows (not skipped ones).
`headersSkipped = properties.length - insertedHeaders.length`

If all properties already have demands for the fiscal year → `headersGenerated === 0` → early return, no line insert attempted.

---

## Fix 2 — `importFile()` : 6×N → 2 DB hits

### Problem

Old code looped per property inside a transaction:
- `UPDATE` 4 demand lines one-by-one (4 hits)
- `SELECT notes` from header (1 hit)
- `UPDATE` header notes (1 hit)

100 properties = 600 sequential DB hits.

### Fix

Build all updates in memory first (no DB, no await), then:

**Hit 1 — all demand lines in one UPDATE via `UNNEST`:**

```sql
UPDATE gp_namuna9_demand_lines AS t
SET previous_paise = v.previous_paise, updated_at = $now
FROM (
  SELECT UNNEST($lineIds::uuid[])     AS id,
         UNNEST($lineValues::bigint[]) AS previous_paise
) AS v
WHERE t.id = v.id
```

**Hit 2 — all demand headers in one UPDATE via `ANY`:**

```sql
UPDATE gp_namuna9_demands
SET notes      = CASE
                   WHEN notes IS NULL OR TRIM(notes) = '' THEN $auditLine
                   ELSE notes || E'\n' || $auditLine
                 END,
    updated_at = $now
WHERE id = ANY($demandIds::uuid[])
```

The `SELECT notes` round-trip is eliminated — `CASE WHEN` handles the null/empty check in DB directly.

### Key detail — `UNNEST` array pairing

`UNNEST(array1), UNNEST(array2)` in the same `SELECT` zips them positionally (Postgres set-returning function parallel unnest). The arrays **must be the same length and in the same order**. The code builds them together in a single loop so this is guaranteed.

---

## DB driver note

Project uses `postgres.js` (`postgres` package) + Drizzle ORM.
`postgres.js` serializes JS `string[]` / `number[]` as Postgres array literals (`{a,b,c}`) automatically when passed as parameters in `sql` template tag.
No manual serialization needed.

---

## Performance summary

| Operation | Before | After |
|-----------|--------|-------|
| `generate()` 100 properties | ~200 DB hits | 2 DB hits |
| `importFile()` 100 properties | ~600 DB hits | 2 DB hits |

Both run inside a single transaction — atomicity unchanged.
