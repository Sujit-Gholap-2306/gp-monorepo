-- Portal audit columns, coherence checks, and updated_at triggers.
-- App schema is owned by Drizzle migrations; keep Supabase SQL editor changes
-- for emergency repair only, then mirror them here.

SET lock_timeout = '10s';
--> statement-breakpoint
SET statement_timeout = '60s';
--> statement-breakpoint

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
--> statement-breakpoint

UPDATE public.announcements
SET published_at = created_at
WHERE is_published = true AND published_at IS NULL;
--> statement-breakpoint

ALTER TABLE public.gp_admins
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now() NOT NULL;
--> statement-breakpoint
ALTER TABLE public.gp_admins
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now() NOT NULL;
--> statement-breakpoint
ALTER TABLE public.announcements
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now() NOT NULL;
--> statement-breakpoint
ALTER TABLE public.post_holders
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now() NOT NULL;
--> statement-breakpoint
ALTER TABLE public.post_holders
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now() NOT NULL;
--> statement-breakpoint

DROP TRIGGER IF EXISTS announcements_updated_at ON public.announcements;
--> statement-breakpoint
CREATE TRIGGER announcements_updated_at
BEFORE UPDATE ON public.announcements
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
--> statement-breakpoint
DROP TRIGGER IF EXISTS gp_admins_updated_at ON public.gp_admins;
--> statement-breakpoint
CREATE TRIGGER gp_admins_updated_at
BEFORE UPDATE ON public.gp_admins
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
--> statement-breakpoint
DROP TRIGGER IF EXISTS post_holders_updated_at ON public.post_holders;
--> statement-breakpoint
CREATE TRIGGER post_holders_updated_at
BEFORE UPDATE ON public.post_holders
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
--> statement-breakpoint

-- Normalize known legacy values before adding stricter checks.
UPDATE public.gp_admins
SET role = 'viewer'
WHERE role NOT IN ('admin', 'viewer');
--> statement-breakpoint
UPDATE public.event_media
SET type = 'photo'
WHERE type = 'image';
--> statement-breakpoint
UPDATE public.gallery
SET type = 'photo'
WHERE type = 'image';
--> statement-breakpoint

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'gp_admins_role_check'
      AND conrelid = 'public.gp_admins'::regclass
  ) THEN
    ALTER TABLE public.gp_admins
      ADD CONSTRAINT gp_admins_role_check
      CHECK (role IN ('admin', 'viewer'))
      NOT VALID;
  END IF;
END $$;
--> statement-breakpoint
ALTER TABLE public.gp_admins VALIDATE CONSTRAINT gp_admins_role_check;
--> statement-breakpoint

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'announcements_published_coherent'
      AND conrelid = 'public.announcements'::regclass
  ) THEN
    ALTER TABLE public.announcements
      ADD CONSTRAINT announcements_published_coherent
      CHECK (NOT is_published OR published_at IS NOT NULL)
      NOT VALID;
  END IF;
END $$;
--> statement-breakpoint
ALTER TABLE public.announcements VALIDATE CONSTRAINT announcements_published_coherent;
--> statement-breakpoint

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'event_media_type_check'
      AND conrelid = 'public.event_media'::regclass
  ) THEN
    ALTER TABLE public.event_media
      ADD CONSTRAINT event_media_type_check
      CHECK (type IN ('photo', 'video'))
      NOT VALID;
  END IF;
END $$;
--> statement-breakpoint
ALTER TABLE public.event_media VALIDATE CONSTRAINT event_media_type_check;
--> statement-breakpoint

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'gallery_type_check'
      AND conrelid = 'public.gallery'::regclass
  ) THEN
    ALTER TABLE public.gallery
      ADD CONSTRAINT gallery_type_check
      CHECK (type IN ('photo', 'video'))
      NOT VALID;
  END IF;
END $$;
--> statement-breakpoint
ALTER TABLE public.gallery VALIDATE CONSTRAINT gallery_type_check;
