import { sql } from 'drizzle-orm'
import { bigint, jsonb, pgView, smallint, text, uuid } from 'drizzle-orm/pg-core'

export const gpNamuna06View = pgView('gp_namuna06_view', {
  gpId:            uuid('gp_id').notNull(),
  fiscalYear:      text('fiscal_year').notNull(),
  fyMonthNo:       smallint('fy_month_no').notNull(),
  accountHead:     text('account_head').notNull(),
  dailyTotalsPaise: jsonb('daily_totals_paise').$type<Record<string, number> | null>(),
  monthTotalPaise: bigint('month_total_paise', { mode: 'number' }).notNull(),
  fyRunningPaise:  bigint('fy_running_paise', { mode: 'number' }).notNull(),
}).as(sql`
  WITH daily AS (
    SELECT
      gp_id,
      fiscal_year,
      fy_month_no,
      account_head,
      EXTRACT(DAY FROM entry_date)::int AS day_of_month,
      SUM(CASE WHEN entry_type = 'credit' THEN amount_paise ELSE -amount_paise END) AS day_total
    FROM gp_namuna05_cashbook_entries
    GROUP BY gp_id, fiscal_year, fy_month_no, account_head, EXTRACT(DAY FROM entry_date)
  )
  SELECT
    gp_id,
    fiscal_year,
    fy_month_no,
    account_head,
    jsonb_object_agg(day_of_month::text, day_total) FILTER (WHERE day_total <> 0) AS daily_totals_paise,
    SUM(day_total)::bigint AS month_total_paise,
    SUM(SUM(day_total)) OVER (
      PARTITION BY gp_id, fiscal_year, account_head
      ORDER BY fy_month_no
    )::bigint AS fy_running_paise
  FROM daily
  GROUP BY gp_id, fiscal_year, fy_month_no, account_head
`)
