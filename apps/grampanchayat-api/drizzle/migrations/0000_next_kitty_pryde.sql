-- Add new columns for multi-tenant portal configuration to existing gp_tenants table
-- This migration was adjusted from the generated CREATE TABLE to work with existing database

ALTER TABLE "gp_tenants" 
ADD COLUMN IF NOT EXISTS "portal_theme" text DEFAULT 'civic-elegant' NOT NULL;

ALTER TABLE "gp_tenants" 
ADD COLUMN IF NOT EXISTS "portal_config" jsonb DEFAULT '{}'::jsonb NOT NULL;

ALTER TABLE "gp_tenants" 
ADD COLUMN IF NOT EXISTS "feature_flags" jsonb DEFAULT '{"showProgress":true,"showMap":true,"showAchievements":true}'::jsonb NOT NULL;

ALTER TABLE "gp_tenants" 
ADD COLUMN IF NOT EXISTS "tier" text DEFAULT 'free' NOT NULL;

-- Add check constraint for tier (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'gp_tenants_tier_check'
  ) THEN
    ALTER TABLE "gp_tenants" 
    ADD CONSTRAINT gp_tenants_tier_check 
    CHECK (tier IN ('free', 'pro', 'enterprise'));
  END IF;
END $$;

-- Update existing rows to have default values
UPDATE "gp_tenants" 
SET 
  portal_theme = 'civic-elegant',
  portal_config = '{}'::jsonb,
  feature_flags = '{"showProgress":true,"showMap":true,"showAchievements":true}'::jsonb,
  tier = 'free'
WHERE portal_theme IS NULL;
-- Applied migrations are recorded by drizzle-kit in schema "drizzle", table "__drizzle_migrations" — do not INSERT here.
