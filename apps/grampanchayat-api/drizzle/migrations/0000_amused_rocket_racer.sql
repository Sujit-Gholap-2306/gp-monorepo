CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text NOT NULL,
	"email" text NOT NULL,
	"full_name" text NOT NULL,
	"password_hash" text NOT NULL,
	"refresh_token" text,
	"avatar_url" text,
	"cover_url" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "gp_tenants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name_mr" text NOT NULL,
	"name_en" text NOT NULL,
	"subdomain" text NOT NULL,
	"established" timestamp with time zone,
	"logo_url" text,
	"contact" jsonb,
	"village" jsonb,
	"portal_theme" text DEFAULT 'civic-elegant' NOT NULL,
	"portal_config" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"feature_flags" jsonb DEFAULT '{"showProgress":true,"showMap":true,"showAchievements":true}'::jsonb NOT NULL,
	"tier" text DEFAULT 'free' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "gp_tenants_subdomain_unique" UNIQUE("subdomain")
);
--> statement-breakpoint
CREATE TABLE "gp_citizens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"gp_id" uuid NOT NULL,
	"citizen_no" integer NOT NULL,
	"name_mr" text NOT NULL,
	"name_en" text,
	"mobile" text NOT NULL,
	"ward_number" text NOT NULL,
	"address_mr" text NOT NULL,
	"aadhaar_last4" text,
	"household_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gp_properties" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"gp_id" uuid NOT NULL,
	"owner_citizen_id" uuid NOT NULL,
	"property_no" text NOT NULL,
	"survey_number" text,
	"plot_or_gat" text,
	"property_type" text NOT NULL,
	"length_ft" real,
	"width_ft" real,
	"age_bracket" text,
	"occupant_name" text NOT NULL,
	"resolution_ref" text,
	"assessment_date" date,
	"assessment_inputs" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gp_property_type_rates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"gp_id" uuid NOT NULL,
	"property_type" text NOT NULL,
	"min_rate" numeric(12, 4),
	"max_rate" numeric(12, 4),
	"land_rate_per_sqft" numeric(12, 4),
	"construction_rate_per_sqft" numeric(12, 4),
	"new_construction_rate_per_sqft" numeric(12, 4),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gp_admins" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"gp_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" text DEFAULT 'admin' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "announcements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"gp_id" uuid NOT NULL,
	"title_mr" text NOT NULL,
	"title_en" text NOT NULL,
	"content_mr" text,
	"content_en" text,
	"category" text DEFAULT 'general' NOT NULL,
	"doc_url" text,
	"is_published" boolean DEFAULT false NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"gp_id" uuid NOT NULL,
	"title_mr" text NOT NULL,
	"title_en" text NOT NULL,
	"description_mr" text,
	"description_en" text,
	"event_date" date NOT NULL,
	"location_mr" text,
	"location_en" text,
	"is_published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"gp_id" uuid NOT NULL,
	"url" text NOT NULL,
	"type" text NOT NULL,
	"caption" text,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gallery" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"gp_id" uuid NOT NULL,
	"url" text NOT NULL,
	"type" text NOT NULL,
	"caption_mr" text,
	"caption_en" text,
	"taken_at" timestamp with time zone,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "post_holders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"gp_id" uuid NOT NULL,
	"name_mr" text NOT NULL,
	"name_en" text NOT NULL,
	"post_mr" text NOT NULL,
	"post_en" text NOT NULL,
	"photo_url" text,
	"phone" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
ALTER TABLE "gp_citizens" ADD CONSTRAINT "gp_citizens_gp_id_gp_tenants_id_fk" FOREIGN KEY ("gp_id") REFERENCES "public"."gp_tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gp_properties" ADD CONSTRAINT "gp_properties_gp_id_gp_tenants_id_fk" FOREIGN KEY ("gp_id") REFERENCES "public"."gp_tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gp_properties" ADD CONSTRAINT "gp_properties_owner_citizen_id_gp_citizens_id_fk" FOREIGN KEY ("owner_citizen_id") REFERENCES "public"."gp_citizens"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gp_property_type_rates" ADD CONSTRAINT "gp_property_type_rates_gp_id_gp_tenants_id_fk" FOREIGN KEY ("gp_id") REFERENCES "public"."gp_tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gp_admins" ADD CONSTRAINT "gp_admins_gp_id_gp_tenants_id_fk" FOREIGN KEY ("gp_id") REFERENCES "public"."gp_tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_gp_id_gp_tenants_id_fk" FOREIGN KEY ("gp_id") REFERENCES "public"."gp_tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_gp_id_gp_tenants_id_fk" FOREIGN KEY ("gp_id") REFERENCES "public"."gp_tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_media" ADD CONSTRAINT "event_media_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_media" ADD CONSTRAINT "event_media_gp_id_gp_tenants_id_fk" FOREIGN KEY ("gp_id") REFERENCES "public"."gp_tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gallery" ADD CONSTRAINT "gallery_gp_id_gp_tenants_id_fk" FOREIGN KEY ("gp_id") REFERENCES "public"."gp_tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_holders" ADD CONSTRAINT "post_holders_gp_id_gp_tenants_id_fk" FOREIGN KEY ("gp_id") REFERENCES "public"."gp_tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "users_username_idx" ON "users" USING btree ("username");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "gp_citizens_gp_id_citizen_no_uidx" ON "gp_citizens" USING btree ("gp_id","citizen_no");--> statement-breakpoint
CREATE UNIQUE INDEX "gp_properties_gp_id_property_no_uidx" ON "gp_properties" USING btree ("gp_id","property_no");--> statement-breakpoint
CREATE INDEX "gp_properties_owner_citizen_id_idx" ON "gp_properties" USING btree ("owner_citizen_id");--> statement-breakpoint
CREATE UNIQUE INDEX "gp_property_type_rates_gp_id_type_uidx" ON "gp_property_type_rates" USING btree ("gp_id","property_type");--> statement-breakpoint
CREATE UNIQUE INDEX "gp_admins_gp_id_user_id_key" ON "gp_admins" USING btree ("gp_id","user_id");--> statement-breakpoint
CREATE INDEX "idx_gp_admins_user" ON "gp_admins" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_announcements_gp_id" ON "announcements" USING btree ("gp_id");--> statement-breakpoint
CREATE INDEX "idx_events_gp_id_date" ON "events" USING btree ("gp_id","event_date");--> statement-breakpoint
CREATE INDEX "idx_event_media_event" ON "event_media" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "idx_gallery_gp_id" ON "gallery" USING btree ("gp_id");--> statement-breakpoint
CREATE INDEX "idx_post_holders_gp_id" ON "post_holders" USING btree ("gp_id");--> statement-breakpoint
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;--> statement-breakpoint
CREATE TRIGGER users_updated_at BEFORE UPDATE ON "users" FOR EACH ROW EXECUTE FUNCTION set_updated_at();--> statement-breakpoint
CREATE TRIGGER gp_tenants_updated_at BEFORE UPDATE ON "gp_tenants" FOR EACH ROW EXECUTE FUNCTION set_updated_at();--> statement-breakpoint
CREATE TRIGGER gp_citizens_updated_at BEFORE UPDATE ON "gp_citizens" FOR EACH ROW EXECUTE FUNCTION set_updated_at();--> statement-breakpoint
CREATE TRIGGER gp_properties_updated_at BEFORE UPDATE ON "gp_properties" FOR EACH ROW EXECUTE FUNCTION set_updated_at();--> statement-breakpoint
CREATE TRIGGER gp_property_type_rates_updated_at BEFORE UPDATE ON "gp_property_type_rates" FOR EACH ROW EXECUTE FUNCTION set_updated_at();--> statement-breakpoint
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "gp_tenants" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "gp_citizens" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "gp_properties" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "gp_property_type_rates" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "gp_admins" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "announcements" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "events" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "event_media" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "gallery" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "post_holders" ENABLE ROW LEVEL SECURITY;