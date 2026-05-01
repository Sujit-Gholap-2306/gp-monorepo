CREATE TYPE "public"."gp_account_head" AS ENUM('property_tax_house', 'property_tax_lighting', 'property_tax_sanitation', 'property_tax_water', 'discount', 'late_fee', 'notice_fee', 'other');--> statement-breakpoint
CREATE TABLE "gp_namuna05_cashbook_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"gp_id" uuid NOT NULL,
	"entry_date" date NOT NULL,
	"fiscal_year" text NOT NULL,
	"fy_month_no" smallint NOT NULL,
	"entry_type" text NOT NULL,
	"account_head" "gp_account_head" NOT NULL,
	"description" text,
	"amount_paise" bigint NOT NULL,
	"source_type" text NOT NULL,
	"source_id" uuid,
	"source_line_id" uuid,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "gp_namuna05_cashbook_entries_amount_positive_check" CHECK ("gp_namuna05_cashbook_entries"."amount_paise" > 0),
	CONSTRAINT "gp_namuna05_cashbook_entries_entry_type_check" CHECK ("gp_namuna05_cashbook_entries"."entry_type" IN ('credit', 'debit')),
	CONSTRAINT "gp_namuna05_cashbook_entries_source_type_check" CHECK ("gp_namuna05_cashbook_entries"."source_type" IN ('namuna10', 'namuna10_void', 'manual')),
	CONSTRAINT "gp_namuna05_cashbook_entries_fy_month_no_check" CHECK ("gp_namuna05_cashbook_entries"."fy_month_no" >= 1 AND "gp_namuna05_cashbook_entries"."fy_month_no" <= 12)
);
--> statement-breakpoint
ALTER TABLE "gp_namuna05_cashbook_entries" ADD CONSTRAINT "gp_namuna05_cashbook_entries_gp_id_gp_tenants_id_fk" FOREIGN KEY ("gp_id") REFERENCES "public"."gp_tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "gp_namuna05_cashbook_entries_gp_entry_date_idx" ON "gp_namuna05_cashbook_entries" USING btree ("gp_id","entry_date","id");--> statement-breakpoint
CREATE INDEX "gp_namuna05_cashbook_entries_gp_fy_month_head_idx" ON "gp_namuna05_cashbook_entries" USING btree ("gp_id","fiscal_year","fy_month_no","account_head");--> statement-breakpoint
CREATE INDEX "gp_namuna05_cashbook_entries_source_type_id_idx" ON "gp_namuna05_cashbook_entries" USING btree ("source_type","source_id");
