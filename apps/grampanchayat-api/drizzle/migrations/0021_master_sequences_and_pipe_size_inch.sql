-- gp_master_sequences: atomic per-GP counters for citizen_no, property_no, consumer_no
CREATE TABLE "gp_master_sequences" (
	"gp_id" uuid NOT NULL,
	"entity" text NOT NULL,
	"next_no" bigint DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "gp_master_sequences_pkey" PRIMARY KEY("gp_id","entity"),
	CONSTRAINT "gp_master_sequences_entity_check" CHECK ("gp_master_sequences"."entity" IN ('citizen', 'property', 'water_connection'))
);
--> statement-breakpoint
ALTER TABLE "gp_master_sequences" ADD CONSTRAINT "gp_master_sequences_gp_id_gp_tenants_id_fk"
	FOREIGN KEY ("gp_id") REFERENCES "public"."gp_tenants"("id") ON DELETE cascade ON UPDATE no action;

-- pipe_size_mm → pipe_size_inch on gp_water_connections
-- Tables were created empty (data cleared before this migration).
-- If data exists: UPDATE SET pipe_size_mm = ... to convert mm to inch before renaming.
--> statement-breakpoint
ALTER TABLE "gp_water_connections" DROP CONSTRAINT "gp_water_connections_pipe_size_check";
--> statement-breakpoint
ALTER TABLE "gp_water_connections" RENAME COLUMN "pipe_size_mm" TO "pipe_size_inch";
--> statement-breakpoint
ALTER TABLE "gp_water_connections" ALTER COLUMN "pipe_size_inch" TYPE numeric(3,1) USING pipe_size_inch::numeric(3,1);
--> statement-breakpoint
ALTER TABLE "gp_water_connections" ADD CONSTRAINT "gp_water_connections_pipe_size_check"
	CHECK ("gp_water_connections"."pipe_size_inch" IN (1.0, 1.5, 2.0, 2.5));

-- pipe_size_mm → pipe_size_inch on gp_water_connection_rates
--> statement-breakpoint
DROP INDEX IF EXISTS "gp_water_connection_rates_gp_fy_type_pipe_uidx";
--> statement-breakpoint
ALTER TABLE "gp_water_connection_rates" DROP CONSTRAINT "gp_water_connection_rates_pipe_size_check";
--> statement-breakpoint
ALTER TABLE "gp_water_connection_rates" RENAME COLUMN "pipe_size_mm" TO "pipe_size_inch";
--> statement-breakpoint
ALTER TABLE "gp_water_connection_rates" ALTER COLUMN "pipe_size_inch" TYPE numeric(3,1) USING pipe_size_inch::numeric(3,1);
--> statement-breakpoint
ALTER TABLE "gp_water_connection_rates" ADD CONSTRAINT "gp_water_connection_rates_pipe_size_check"
	CHECK ("gp_water_connection_rates"."pipe_size_inch" IN (1.0, 1.5, 2.0, 2.5));
--> statement-breakpoint
CREATE UNIQUE INDEX "gp_water_connection_rates_gp_fy_type_pipe_uidx"
	ON "gp_water_connection_rates" USING btree ("gp_id","fiscal_year","connection_type","pipe_size_inch");
