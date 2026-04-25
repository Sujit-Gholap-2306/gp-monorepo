ALTER TABLE "gp_properties" ADD COLUMN IF NOT EXISTS "lighting_tax_paise" bigint;--> statement-breakpoint
ALTER TABLE "gp_properties" ADD COLUMN IF NOT EXISTS "sanitation_tax_paise" bigint;--> statement-breakpoint
ALTER TABLE "gp_properties" ADD COLUMN IF NOT EXISTS "water_tax_paise" bigint;--> statement-breakpoint
ALTER TABLE "gp_property_type_rates" ADD COLUMN IF NOT EXISTS "default_lighting_paise" bigint;--> statement-breakpoint
ALTER TABLE "gp_property_type_rates" ADD COLUMN IF NOT EXISTS "default_sanitation_paise" bigint;--> statement-breakpoint
ALTER TABLE "gp_property_type_rates" ADD COLUMN IF NOT EXISTS "default_water_paise" bigint;
