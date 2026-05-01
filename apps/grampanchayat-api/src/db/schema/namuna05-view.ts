import { sql } from 'drizzle-orm'
import { bigint, date, pgView, smallint, text, uuid } from 'drizzle-orm/pg-core'

export const gpNamuna05View = pgView('gp_namuna05_view', {
  id:               uuid('id'),
  gpId:             uuid('gp_id'),
  entryDate:        date('entry_date'),
  fiscalYear:       text('fiscal_year'),
  fyMonthNo:        smallint('fy_month_no'),
  entryType:        text('entry_type'),
  accountHead:      text('account_head'),
  description:      text('description'),
  amountPaise:      bigint('amount_paise', { mode: 'number' }),
  sourceType:       text('source_type'),
  sourceId:         uuid('source_id'),
  sourceLineId:     uuid('source_line_id'),
  createdBy:        uuid('created_by'),
  // SUM(bigint) → numeric in Postgres; cast to bigint in view SQL keeps this safe
  runningBalancePaise: bigint('running_balance_paise', { mode: 'number' }),
}).as(sql`
  SELECT
    e.id,
    e.gp_id,
    e.entry_date,
    e.fiscal_year,
    e.fy_month_no,
    e.entry_type,
    e.account_head,
    e.description,
    e.amount_paise,
    e.source_type,
    e.source_id,
    e.source_line_id,
    e.created_by,
    SUM(
      CASE WHEN e.entry_type = 'credit' THEN e.amount_paise ELSE -e.amount_paise END
    ) OVER (
      PARTITION BY e.gp_id, e.fiscal_year
      ORDER BY e.entry_date, e.id
      ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    )::bigint AS running_balance_paise
  FROM gp_namuna05_cashbook_entries e
`)
