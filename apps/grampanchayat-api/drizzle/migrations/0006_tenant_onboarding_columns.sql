ALTER TABLE gp_tenants
  ADD COLUMN IF NOT EXISTS profile_complete_at timestamptz,
  ADD COLUMN IF NOT EXISTS opening_balance_imported_at timestamptz,
  ADD COLUMN IF NOT EXISTS onboarding_complete boolean NOT NULL DEFAULT false;
