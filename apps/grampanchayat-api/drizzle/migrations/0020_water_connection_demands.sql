CREATE TABLE "gp_water_connection_demands" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"gp_id" uuid NOT NULL,
	"water_connection_id" uuid NOT NULL,
	"fiscal_year" text NOT NULL,
	"generated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"generated_by" uuid,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "gp_water_connection_demands_fiscal_year_format_check" CHECK ("gp_water_connection_demands"."fiscal_year" ~ '^\d{4}-\d{2}$')
);
--> statement-breakpoint
CREATE TABLE "gp_water_connection_demand_lines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"demand_id" uuid NOT NULL,
	"previous_paise" bigint DEFAULT 0 NOT NULL,
	"current_paise" bigint DEFAULT 0 NOT NULL,
	"paid_paise" bigint DEFAULT 0 NOT NULL,
	"total_due_paise" bigint GENERATED ALWAYS AS (previous_paise + current_paise - paid_paise) STORED,
	"status" text GENERATED ALWAYS AS (
      CASE
        WHEN previous_paise + current_paise = 0 THEN 'paid'
        WHEN paid_paise = 0 THEN 'pending'
        WHEN paid_paise >= previous_paise + current_paise THEN 'paid'
        ELSE 'partial'
      END
    ) STORED,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "gp_water_connection_demand_lines_nonnegative_paise_check" CHECK ("gp_water_connection_demand_lines"."previous_paise" >= 0 AND "gp_water_connection_demand_lines"."current_paise" >= 0 AND "gp_water_connection_demand_lines"."paid_paise" >= 0),
	CONSTRAINT "gp_water_connection_demand_lines_no_overpayment_check" CHECK ("gp_water_connection_demand_lines"."paid_paise" <= "gp_water_connection_demand_lines"."previous_paise" + "gp_water_connection_demand_lines"."current_paise")
);
--> statement-breakpoint
ALTER TABLE "gp_water_connection_demands" ADD CONSTRAINT "gp_water_connection_demands_gp_id_gp_tenants_id_fk" FOREIGN KEY ("gp_id") REFERENCES "public"."gp_tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gp_water_connection_demands" ADD CONSTRAINT "gp_water_connection_demands_water_connection_id_gp_water_connections_id_fk" FOREIGN KEY ("water_connection_id") REFERENCES "public"."gp_water_connections"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gp_water_connection_demand_lines" ADD CONSTRAINT "gp_water_connection_demand_lines_demand_id_gp_water_connection_demands_id_fk" FOREIGN KEY ("demand_id") REFERENCES "public"."gp_water_connection_demands"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "gp_water_connection_demands_gp_connection_fy_uidx" ON "gp_water_connection_demands" USING btree ("gp_id","water_connection_id","fiscal_year");--> statement-breakpoint
CREATE INDEX "gp_water_connection_demands_gp_fy_idx" ON "gp_water_connection_demands" USING btree ("gp_id","fiscal_year");--> statement-breakpoint
CREATE UNIQUE INDEX "gp_water_connection_demand_lines_demand_uidx" ON "gp_water_connection_demand_lines" USING btree ("demand_id");