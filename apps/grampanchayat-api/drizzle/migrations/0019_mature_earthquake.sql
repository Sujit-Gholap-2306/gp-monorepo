CREATE TABLE "gp_master_sequences" (
	"gp_id" uuid NOT NULL,
	"entity" text NOT NULL,
	"next_no" bigint DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "gp_master_sequences_gp_id_entity_pk" PRIMARY KEY("gp_id","entity"),
	CONSTRAINT "gp_master_sequences_entity_check" CHECK ("gp_master_sequences"."entity" IN ('citizen', 'property', 'water_connection'))
);
--> statement-breakpoint
ALTER TABLE "gp_water_connections" RENAME COLUMN "pipe_size_mm" TO "pipe_size_inch";--> statement-breakpoint
ALTER TABLE "gp_water_connection_rates" RENAME COLUMN "pipe_size_mm" TO "pipe_size_inch";--> statement-breakpoint
ALTER TABLE "gp_water_connections" DROP CONSTRAINT "gp_water_connections_pipe_size_check";--> statement-breakpoint
ALTER TABLE "gp_water_connection_rates" DROP CONSTRAINT "gp_water_connection_rates_pipe_size_check";--> statement-breakpoint
DROP INDEX "gp_namuna10_receipts_gp_receipt_no_uidx";--> statement-breakpoint
DROP INDEX "gp_water_connection_rates_gp_fy_type_pipe_uidx";--> statement-breakpoint
ALTER TABLE "gp_receipt_sequences" DROP CONSTRAINT "gp_receipt_sequences_gp_id_fiscal_year_pk";--> statement-breakpoint
ALTER TABLE "gp_namuna10_receipts" ALTER COLUMN "property_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "gp_namuna10_receipt_lines" ALTER COLUMN "demand_line_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "gp_receipt_sequences" ADD COLUMN "book_type" text DEFAULT 'property' NOT NULL;--> statement-breakpoint
ALTER TABLE "gp_receipt_sequences" ADD CONSTRAINT "gp_receipt_sequences_gp_id_fiscal_year_book_type_pk" PRIMARY KEY("gp_id","fiscal_year","book_type");--> statement-breakpoint
ALTER TABLE "gp_namuna10_receipts" ADD COLUMN "book_type" text DEFAULT 'property' NOT NULL;--> statement-breakpoint
ALTER TABLE "gp_namuna10_receipts" ADD COLUMN "water_connection_id" uuid;--> statement-breakpoint
ALTER TABLE "gp_namuna10_receipt_lines" ADD COLUMN "water_demand_line_id" uuid;--> statement-breakpoint
ALTER TABLE "gp_master_sequences" ADD CONSTRAINT "gp_master_sequences_gp_id_gp_tenants_id_fk" FOREIGN KEY ("gp_id") REFERENCES "public"."gp_tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gp_namuna10_receipts" ADD CONSTRAINT "gp_namuna10_receipts_water_connection_id_gp_water_connections_id_fk" FOREIGN KEY ("water_connection_id") REFERENCES "public"."gp_water_connections"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gp_namuna10_receipt_lines" ADD CONSTRAINT "gp_namuna10_receipt_lines_water_demand_line_id_gp_water_connection_demand_lines_id_fk" FOREIGN KEY ("water_demand_line_id") REFERENCES "public"."gp_water_connection_demand_lines"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "gp_namuna10_receipts_gp_book_receipt_no_uidx" ON "gp_namuna10_receipts" USING btree ("gp_id","book_type","receipt_no");--> statement-breakpoint
CREATE INDEX "gp_namuna10_receipts_gp_water_connection_paid_at_idx" ON "gp_namuna10_receipts" USING btree ("gp_id","water_connection_id","paid_at");--> statement-breakpoint
CREATE UNIQUE INDEX "gp_namuna10_receipt_lines_receipt_water_demand_line_uidx" ON "gp_namuna10_receipt_lines" USING btree ("receipt_id","water_demand_line_id");--> statement-breakpoint
CREATE INDEX "gp_namuna10_receipt_lines_water_demand_line_idx" ON "gp_namuna10_receipt_lines" USING btree ("water_demand_line_id");--> statement-breakpoint
CREATE UNIQUE INDEX "gp_water_connection_rates_gp_fy_type_pipe_uidx" ON "gp_water_connection_rates" USING btree ("gp_id","fiscal_year","connection_type","pipe_size_inch");--> statement-breakpoint
ALTER TABLE "gp_receipt_sequences" ADD CONSTRAINT "gp_receipt_sequences_book_type_check" CHECK ("gp_receipt_sequences"."book_type" IN ('property', 'water'));--> statement-breakpoint
ALTER TABLE "gp_namuna10_receipts" ADD CONSTRAINT "gp_namuna10_receipts_book_type_check" CHECK ("gp_namuna10_receipts"."book_type" IN ('property', 'water'));--> statement-breakpoint
ALTER TABLE "gp_namuna10_receipts" ADD CONSTRAINT "gp_namuna10_receipts_target_fk_xor_check" CHECK (
        (
          ("gp_namuna10_receipts"."book_type" = 'property' AND "gp_namuna10_receipts"."property_id" IS NOT NULL AND "gp_namuna10_receipts"."water_connection_id" IS NULL)
          OR
          ("gp_namuna10_receipts"."book_type" = 'water' AND "gp_namuna10_receipts"."water_connection_id" IS NOT NULL AND "gp_namuna10_receipts"."property_id" IS NULL)
        )
      );--> statement-breakpoint
ALTER TABLE "gp_namuna10_receipt_lines" ADD CONSTRAINT "gp_namuna10_receipt_lines_target_fk_xor_check" CHECK (
        (
          ("gp_namuna10_receipt_lines"."demand_line_id" IS NOT NULL AND "gp_namuna10_receipt_lines"."water_demand_line_id" IS NULL)
          OR
          ("gp_namuna10_receipt_lines"."demand_line_id" IS NULL AND "gp_namuna10_receipt_lines"."water_demand_line_id" IS NOT NULL)
        )
      );--> statement-breakpoint
ALTER TABLE "gp_water_connections" ADD CONSTRAINT "gp_water_connections_pipe_size_check" CHECK ("gp_water_connections"."pipe_size_inch" IN (1.0, 1.5, 2.0, 2.5));--> statement-breakpoint
ALTER TABLE "gp_water_connection_rates" ADD CONSTRAINT "gp_water_connection_rates_pipe_size_check" CHECK ("gp_water_connection_rates"."pipe_size_inch" IN (1.0, 1.5, 2.0, 2.5));