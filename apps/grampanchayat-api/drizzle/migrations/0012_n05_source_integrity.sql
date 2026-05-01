ALTER TABLE "gp_namuna05_cashbook_entries"
  ADD CONSTRAINT "gp_namuna05_cashbook_entries_source_id_required_check"
    CHECK (source_type = 'manual' OR source_id IS NOT NULL);--> statement-breakpoint

ALTER TABLE "gp_namuna05_cashbook_entries"
  ADD CONSTRAINT "gp_namuna05_cashbook_entries_tax_line_source_line_check"
    CHECK (
      account_head NOT IN ('property_tax_house', 'property_tax_lighting', 'property_tax_sanitation', 'property_tax_water')
      OR source_line_id IS NOT NULL
    );--> statement-breakpoint

ALTER TABLE "gp_namuna05_cashbook_entries"
  ADD CONSTRAINT "gp_namuna05_cashbook_entries_adjustment_no_source_line_check"
    CHECK (
      account_head NOT IN ('discount', 'late_fee', 'notice_fee', 'other')
      OR source_line_id IS NULL
    );
