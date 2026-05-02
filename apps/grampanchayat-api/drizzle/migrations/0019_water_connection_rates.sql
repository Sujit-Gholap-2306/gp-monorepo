CREATE TABLE "gp_water_connection_rates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"gp_id" uuid NOT NULL,
	"fiscal_year" text NOT NULL,
	"connection_type" text NOT NULL,
	"pipe_size_mm" integer NOT NULL,
	"annual_paise" bigint NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "gp_water_connection_rates_connection_type_check" CHECK ("gp_water_connection_rates"."connection_type" IN ('regular', 'specialized')),
	CONSTRAINT "gp_water_connection_rates_pipe_size_check" CHECK ("gp_water_connection_rates"."pipe_size_mm" > 0),
	CONSTRAINT "gp_water_connection_rates_annual_paise_check" CHECK ("gp_water_connection_rates"."annual_paise" > 0),
	CONSTRAINT "gp_water_connection_rates_fiscal_year_format_check" CHECK ("gp_water_connection_rates"."fiscal_year" ~ '^\d{4}-\d{2}$')
);
--> statement-breakpoint
ALTER TABLE "gp_water_connection_rates" ADD CONSTRAINT "gp_water_connection_rates_gp_id_gp_tenants_id_fk" FOREIGN KEY ("gp_id") REFERENCES "public"."gp_tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "gp_water_connection_rates_gp_fy_type_pipe_uidx" ON "gp_water_connection_rates" USING btree ("gp_id","fiscal_year","connection_type","pipe_size_mm");