ALTER TABLE "gp_namuna10_receipts"
  ADD CONSTRAINT "gp_namuna10_receipts_fiscal_year_format_check"
    CHECK (fiscal_year ~ '^\d{4}-\d{2}$');
