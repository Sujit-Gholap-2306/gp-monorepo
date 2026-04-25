CREATE TABLE "gp_namuna9_demands" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"gp_id" uuid NOT NULL,
	"property_id" uuid NOT NULL,
	"fiscal_year" text NOT NULL,
	"generated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"generated_by" uuid,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gp_namuna9_demand_lines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"demand_id" uuid NOT NULL,
	"tax_head" text NOT NULL,
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
	CONSTRAINT "gp_namuna9_demand_lines_tax_head_check" CHECK ("gp_namuna9_demand_lines"."tax_head" IN ('house', 'lighting', 'sanitation', 'water')),
	CONSTRAINT "gp_namuna9_demand_lines_nonnegative_paise_check" CHECK ("gp_namuna9_demand_lines"."previous_paise" >= 0 AND "gp_namuna9_demand_lines"."current_paise" >= 0 AND "gp_namuna9_demand_lines"."paid_paise" >= 0),
	CONSTRAINT "gp_namuna9_demand_lines_no_overpayment_check" CHECK ("gp_namuna9_demand_lines"."paid_paise" <= "gp_namuna9_demand_lines"."previous_paise" + "gp_namuna9_demand_lines"."current_paise")
);
--> statement-breakpoint
ALTER TABLE "gp_namuna9_demands" ADD CONSTRAINT "gp_namuna9_demands_gp_id_gp_tenants_id_fk" FOREIGN KEY ("gp_id") REFERENCES "public"."gp_tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gp_namuna9_demands" ADD CONSTRAINT "gp_namuna9_demands_property_id_gp_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."gp_properties"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gp_namuna9_demand_lines" ADD CONSTRAINT "gp_namuna9_demand_lines_demand_id_gp_namuna9_demands_id_fk" FOREIGN KEY ("demand_id") REFERENCES "public"."gp_namuna9_demands"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "gp_namuna9_demands_gp_property_fy_uidx" ON "gp_namuna9_demands" USING btree ("gp_id","property_id","fiscal_year");--> statement-breakpoint
CREATE INDEX "gp_namuna9_demands_gp_fy_idx" ON "gp_namuna9_demands" USING btree ("gp_id","fiscal_year");--> statement-breakpoint
CREATE INDEX "gp_namuna9_demands_gp_property_idx" ON "gp_namuna9_demands" USING btree ("gp_id","property_id");--> statement-breakpoint
CREATE UNIQUE INDEX "gp_namuna9_demand_lines_demand_tax_head_uidx" ON "gp_namuna9_demand_lines" USING btree ("demand_id","tax_head");--> statement-breakpoint
CREATE INDEX "gp_namuna9_demand_lines_demand_idx" ON "gp_namuna9_demand_lines" USING btree ("demand_id");--> statement-breakpoint
CREATE TRIGGER gp_namuna9_demands_updated_at BEFORE UPDATE ON "gp_namuna9_demands" FOR EACH ROW EXECUTE FUNCTION set_updated_at();--> statement-breakpoint
CREATE TRIGGER gp_namuna9_demand_lines_updated_at BEFORE UPDATE ON "gp_namuna9_demand_lines" FOR EACH ROW EXECUTE FUNCTION set_updated_at();--> statement-breakpoint
ALTER TABLE "gp_namuna9_demands" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "gp_namuna9_demand_lines" ENABLE ROW LEVEL SECURITY;
