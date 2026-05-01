CREATE VIEW "public"."gp_namuna05_view" AS
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
  FROM gp_namuna05_cashbook_entries e;
