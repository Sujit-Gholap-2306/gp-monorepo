CREATE TABLE "gp_receipt_sequences" (
	"gp_id" uuid NOT NULL,
	"fiscal_year" text NOT NULL,
	"next_no" bigint DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "gp_receipt_sequences_gp_id_fiscal_year_pk" PRIMARY KEY("gp_id","fiscal_year")
);
--> statement-breakpoint
CREATE TABLE "gp_namuna10_receipts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"gp_id" uuid NOT NULL,
	"property_id" uuid NOT NULL,
	"payer_name" text NOT NULL,
	"fiscal_year" text NOT NULL,
	"receipt_no" text NOT NULL,
	"paid_at" timestamp with time zone NOT NULL,
	"payment_mode" text NOT NULL,
	"reference" text,
	"discount_paise" bigint DEFAULT 0 NOT NULL,
	"late_fee_paise" bigint DEFAULT 0 NOT NULL,
	"notice_fee_paise" bigint DEFAULT 0 NOT NULL,
	"other_paise" bigint DEFAULT 0 NOT NULL,
	"other_reason" text,
	"is_void" boolean DEFAULT false NOT NULL,
	"voided_at" timestamp with time zone,
	"voided_by" uuid,
	"void_reason" text,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "gp_namuna10_receipts_payment_mode_check" CHECK ("gp_namuna10_receipts"."payment_mode" IN ('cash', 'upi', 'cheque', 'neft', 'other')),
	CONSTRAINT "gp_namuna10_receipts_discount_check" CHECK ("gp_namuna10_receipts"."discount_paise" >= 0),
	CONSTRAINT "gp_namuna10_receipts_late_fee_check" CHECK ("gp_namuna10_receipts"."late_fee_paise" >= 0),
	CONSTRAINT "gp_namuna10_receipts_notice_fee_check" CHECK ("gp_namuna10_receipts"."notice_fee_paise" >= 0),
	CONSTRAINT "gp_namuna10_receipts_other_check" CHECK ("gp_namuna10_receipts"."other_paise" >= 0)
);
--> statement-breakpoint
CREATE TABLE "gp_namuna10_receipt_lines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"receipt_id" uuid NOT NULL,
	"demand_line_id" uuid NOT NULL,
	"amount_paise" bigint NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "gp_namuna10_receipt_lines_positive_amount_check" CHECK ("gp_namuna10_receipt_lines"."amount_paise" > 0)
);
--> statement-breakpoint
ALTER TABLE "gp_receipt_sequences" ADD CONSTRAINT "gp_receipt_sequences_gp_id_gp_tenants_id_fk" FOREIGN KEY ("gp_id") REFERENCES "public"."gp_tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gp_namuna10_receipts" ADD CONSTRAINT "gp_namuna10_receipts_gp_id_gp_tenants_id_fk" FOREIGN KEY ("gp_id") REFERENCES "public"."gp_tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gp_namuna10_receipts" ADD CONSTRAINT "gp_namuna10_receipts_property_id_gp_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."gp_properties"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gp_namuna10_receipt_lines" ADD CONSTRAINT "gp_namuna10_receipt_lines_receipt_id_gp_namuna10_receipts_id_fk" FOREIGN KEY ("receipt_id") REFERENCES "public"."gp_namuna10_receipts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gp_namuna10_receipt_lines" ADD CONSTRAINT "gp_namuna10_receipt_lines_demand_line_id_gp_namuna9_demand_lines_id_fk" FOREIGN KEY ("demand_line_id") REFERENCES "public"."gp_namuna9_demand_lines"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "gp_namuna10_receipts_gp_receipt_no_uidx" ON "gp_namuna10_receipts" USING btree ("gp_id","receipt_no");--> statement-breakpoint
CREATE INDEX "gp_namuna10_receipts_gp_fy_paid_at_idx" ON "gp_namuna10_receipts" USING btree ("gp_id","fiscal_year","paid_at");--> statement-breakpoint
CREATE INDEX "gp_namuna10_receipts_gp_property_paid_at_idx" ON "gp_namuna10_receipts" USING btree ("gp_id","property_id","paid_at");--> statement-breakpoint
CREATE UNIQUE INDEX "gp_namuna10_receipt_lines_receipt_demand_line_uidx" ON "gp_namuna10_receipt_lines" USING btree ("receipt_id","demand_line_id");--> statement-breakpoint
CREATE INDEX "gp_namuna10_receipt_lines_demand_line_idx" ON "gp_namuna10_receipt_lines" USING btree ("demand_line_id");--> statement-breakpoint

-- VIEW: per-receipt totals. Includes voided receipts (is_void exposed in SELECT).
-- Collection reports: filter WHERE is_void = false.
-- Audit/detail: no filter — shows original amounts on voided receipts too.
CREATE OR REPLACE VIEW "gp_namuna10_receipt_totals" AS
SELECT
  r.id                                                          AS receipt_id,
  r.is_void,
  COALESCE(SUM(rl.amount_paise), 0)                            AS lines_total_paise,
  (
    COALESCE(SUM(rl.amount_paise), 0)
    - r.discount_paise
    + r.late_fee_paise
    + r.notice_fee_paise
    + r.other_paise
  )                                                             AS total_paise
FROM "gp_namuna10_receipts" r
LEFT JOIN "gp_namuna10_receipt_lines" rl ON rl.receipt_id = r.id
GROUP BY r.id, r.is_void, r.discount_paise, r.late_fee_paise, r.notice_fee_paise, r.other_paise;--> statement-breakpoint

-- VIEW: arrears-first split for bill/print display.
-- Shows how much of paid_paise cleared old arrears vs current year demand.
CREATE OR REPLACE VIEW "gp_namuna9_demand_line_split" AS
SELECT
  dl.id                                                                           AS demand_line_id,
  dl.previous_paise,
  dl.current_paise,
  dl.paid_paise,
  GREATEST(0, dl.previous_paise - dl.paid_paise)                                  AS arrears_outstanding_paise,
  GREATEST(0, dl.current_paise - GREATEST(0, dl.paid_paise - dl.previous_paise))  AS current_outstanding_paise
FROM "gp_namuna9_demand_lines" dl;