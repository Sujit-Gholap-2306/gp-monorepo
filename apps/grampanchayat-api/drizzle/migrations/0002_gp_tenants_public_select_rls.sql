-- Next.js resolves tenants via Supabase (anon / authenticated) in lib/tenant.ts.
-- RLS on gp_tenants with no policies hides all rows from the browser client → 404 "GP not found".
-- Portal metadata (names, subdomain, theme, tier) is intentionally readable for routing and public pages.

CREATE POLICY gp_tenants_select_public
ON public.gp_tenants
FOR SELECT
TO anon, authenticated
USING (true);
