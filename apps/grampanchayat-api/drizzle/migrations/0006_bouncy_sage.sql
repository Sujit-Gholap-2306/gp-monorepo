ALTER TABLE "gp_tenants" ADD COLUMN "profile_complete_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "gp_tenants" ADD COLUMN "opening_balance_imported_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "gp_tenants" ADD COLUMN "onboarding_complete" boolean DEFAULT false NOT NULL;