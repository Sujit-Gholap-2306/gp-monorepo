-- Drizzle's rename prompt skipped the type change from integer to numeric(3,1).
-- This migration applies the correct type for pipe_size_inch on both tables.
ALTER TABLE "gp_water_connections"
  ALTER COLUMN "pipe_size_inch" TYPE numeric(3,1) USING pipe_size_inch::numeric(3,1);
--> statement-breakpoint
ALTER TABLE "gp_water_connection_rates"
  ALTER COLUMN "pipe_size_inch" TYPE numeric(3,1) USING pipe_size_inch::numeric(3,1);
