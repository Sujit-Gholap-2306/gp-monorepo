-- Phase A: remove water from property-based N08/N09
-- Prototype: no production data, safe to delete
DELETE FROM gp_namuna05_cashbook_entries WHERE account_head = 'property_tax_water';
ALTER TYPE gp_account_head RENAME VALUE 'property_tax_water' TO 'water_tax';
DELETE FROM gp_namuna9_demand_lines WHERE tax_head = 'water';
ALTER TABLE gp_properties DROP COLUMN IF EXISTS water_tax_paise;
ALTER TABLE gp_property_type_rates DROP COLUMN IF EXISTS default_water_paise;
ALTER TABLE gp_namuna9_demand_lines
  DROP CONSTRAINT IF EXISTS gp_namuna9_demand_lines_tax_head_check;
ALTER TABLE gp_namuna9_demand_lines
  ADD CONSTRAINT gp_namuna9_demand_lines_tax_head_check
  CHECK (tax_head IN ('house', 'lighting', 'sanitation'));
