CREATE TABLE "gp_water_connections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"gp_id" uuid NOT NULL,
	"citizen_id" uuid NOT NULL,
	"consumer_no" text NOT NULL,
	"connection_type" text NOT NULL,
	"pipe_size_mm" integer NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"connected_at" date,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "gp_water_connections_connection_type_check" CHECK ("gp_water_connections"."connection_type" IN ('regular', 'specialized')),
	CONSTRAINT "gp_water_connections_status_check" CHECK ("gp_water_connections"."status" IN ('active', 'disconnected')),
	CONSTRAINT "gp_water_connections_pipe_size_check" CHECK ("gp_water_connections"."pipe_size_mm" > 0)
);
--> statement-breakpoint
ALTER TABLE "gp_water_connections" ADD CONSTRAINT "gp_water_connections_gp_id_gp_tenants_id_fk" FOREIGN KEY ("gp_id") REFERENCES "public"."gp_tenants"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "gp_water_connections" ADD CONSTRAINT "gp_water_connections_citizen_id_gp_citizens_id_fk" FOREIGN KEY ("citizen_id") REFERENCES "public"."gp_citizens"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
CREATE UNIQUE INDEX "gp_water_connections_gp_consumer_no_uidx" ON "gp_water_connections" USING btree ("gp_id","consumer_no");
--> statement-breakpoint
CREATE UNIQUE INDEX "gp_water_connections_gp_citizen_uidx" ON "gp_water_connections" USING btree ("gp_id","citizen_id");
--> statement-breakpoint
CREATE INDEX "gp_water_connections_gp_status_idx" ON "gp_water_connections" USING btree ("gp_id","status");
