CREATE VIEW "public"."gp_namuna06_view" AS (
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
    SUM(day_total) AS month_total_paise,
    SUM(SUM(day_total)) OVER (
      PARTITION BY gp_id, fiscal_year, account_head
      ORDER BY fy_month_no
    ) AS fy_running_paise
  FROM daily
  GROUP BY gp_id, fiscal_year, fy_month_no, account_head
);
