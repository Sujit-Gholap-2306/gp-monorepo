# Subdomain Routing & Multi-Tenant Architecture

> How one Next.js app serves hundreds of Gram Panchayat sites, each with its own subdomain, from a single codebase.
> Last updated: 2026-04-19

---

## Problem

We need to serve a **separate public site per GP** (e.g., `satara.grampanchayat.co.in`, `nashik.grampanchayat.co.in`), while running only **one** application. The alternative — one deploy per tenant — is unworkable at 100+ GPs.

## Solution overview

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│   *.grampanchayat.co.in    ──┐                                   │
│   grampanchayat.co.in      ──┤                                   │
│   manage.grampanchayat.co.in ┤   (wildcard DNS)                  │
│                              │                                   │
│                              ▼                                   │
│                    ┌────────────────────┐                        │
│                    │   Single Next.js   │                        │
│                    │   app (port 3004)  │                        │
│                    │                    │                        │
│                    │   middleware.ts    │  ← extracts subdomain  │
│                    │   rewrites URL     │  ← routes to right page│
│                    └────────┬───────────┘                        │
│                             │                                    │
│                             ▼                                    │
│                    ┌────────────────────┐                        │
│                    │   Supabase         │                        │
│                    │   (shared DB,      │                        │
│                    │    all tenants)    │  ← rows scoped by gp_id│
│                    └────────────────────┘                        │
└──────────────────────────────────────────────────────────────────┘
```

**Three key mechanisms:**
1. **Wildcard DNS + wildcard SSL** — one record covers all future subdomains
2. **Middleware rewrite** — extracts subdomain from `Host` header, rewrites URL internally to a `[tenant]` parameter
3. **DB row scoping** — every tenant-owned table has a `gp_id` column; queries filter on it

---

## Request lifecycle

```
Browser                          Next.js Server                      Supabase
   │                                    │                                 │
   │ GET nashik.grampanchayat.co.in/    │                                 │
   │     announcements                  │                                 │
   ├───────────────────────────────────▶│                                 │
   │                                    │                                 │
   │                         1. middleware.ts runs                        │
   │                            host = "nashik.grampanchayat.co.in"       │
   │                            extractSubdomain(host) → "nashik"         │
   │                            rewrites: /announcements                  │
   │                                   → /nashik/announcements            │
   │                                    │                                 │
   │                         2. Next.js matches:                          │
   │                            app/[tenant]/(public)/                    │
   │                              announcements/page.tsx                  │
   │                            params.tenant = "nashik"                  │
   │                                    │                                 │
   │                         3. Page (Server Component):                  │
   │                            getTenant("nashik")                       │
   │                                    │──── SELECT * FROM gp_tenants ──▶│
   │                                    │       WHERE subdomain='nashik'  │
   │                                    │◀────────── row or null ─────────│
   │                                    │                                 │
   │                            supabase.from('announcements')            │
   │                              .eq('gp_id', tenant.id)                 │
   │                                    │──────── query ─────────────────▶│
   │                                    │◀────── rows ────────────────────│
   │                                    │                                 │
   │                         4. React renders HTML                        │
   │◀─── HTML ──────────────────────────┤                                 │
   │                                    │                                 │
   │ 5. Browser URL bar still shows:    │                                 │
   │    nashik.grampanchayat.co.in/     │                                 │
   │      announcements                 │                                 │
   │    (user never sees /nashik/...)   │                                 │
```

The rewrite is **internal only**. Browser URL never changes — this is what makes the illusion of "per-tenant sites" convincing.

---

## URL zones

Three zones, one app:

| Host pattern | Example | Internally routes to | Purpose |
|-------------|---------|----------------------|---------|
| `{subdomain}.grampanchayat.co.in/` | `satara.grampanchayat.co.in/announcements` | `app/[tenant]/(public)/announcements/page.tsx` | Public tenant site (citizens, open) |
| `{subdomain}.grampanchayat.co.in/admin/*` | `satara.grampanchayat.co.in/admin/events` | `app/[tenant]/(admin)/admin/events/page.tsx` | Admin panel (login-gated) |
| `grampanchayat.co.in/` | `grampanchayat.co.in/pricing` | `app/(marketing)/pricing/page.tsx` *(TBD)* | Marketing / landing |
| `manage.grampanchayat.co.in/*` | Future: central admin | `app/(manage)/*` *(future)* | Central admin (future migration) |

Note the `(public)` and `(admin)` **route groups** (parens): these share layouts within each zone but don't appear in URLs. The `admin/` segment inside `(admin)/` IS a real URL segment — required to avoid route conflicts between public and admin (both have `announcements/`, `events/`, etc.).

---

## The middleware code

```ts
// apps/grampanchayat/middleware.ts
const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'grampanchayat.co.in'
const RESERVED = new Set(['www', 'api', 'app', 'admin', 'mail', 'smtp'])

function extractSubdomain(host: string): string | null {
  const cleanHost = host.split(':')[0]
  if (cleanHost === ROOT_DOMAIN || cleanHost === 'localhost') return null

  const parts = cleanHost.split('.')
  if (parts.length < 2) return null

  const sub = parts[0]
  return RESERVED.has(sub) ? null : sub
}

export async function middleware(request: NextRequest) {
  const host = request.headers.get('host') ?? ''

  // Local dev: ?tenant=nashik overrides subdomain detection
  const devTenant = process.env.NODE_ENV === 'development'
    ? request.nextUrl.searchParams.get('tenant')
    : null

  const subdomain = devTenant ?? extractSubdomain(host)
  if (!subdomain) return NextResponse.next()

  const url = request.nextUrl.clone()
  url.searchParams.delete('tenant')
  url.pathname = `/${subdomain}${url.pathname}`

  const response = NextResponse.rewrite(url)
  response.headers.set('x-tenant', subdomain)

  // Refresh Supabase auth session on every request
  const supabase = createMiddlewareClient(request, response)
  await supabase.auth.getUser()

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
```

**Key details:**
- `RESERVED` subdomains (`www`, `api`, `admin`, `manage`, etc.) are NOT treated as tenants — they pass through to normal routing. This keeps `manage.grampanchayat.co.in` safe as a future central admin URL.
- `ROOT_DOMAIN` is read from env → fully configurable. Change domain by changing one env var.
- Supabase auth refresh happens on every request → sessions stay valid, cookies re-sent.
- Static assets are excluded from the matcher (performance — no middleware for every `.jpg`).

---

## Local dev (no real subdomains on localhost)

Browsers don't resolve `nashik.localhost` by default. Two options for dev:

### Option A (what we use): `?tenant=` query param override

```
http://localhost:3004/?tenant=nashik        → rewrites to /nashik
http://localhost:3004/announcements?tenant=nashik → rewrites to /nashik/announcements
```

Middleware checks `?tenant=` only when `NODE_ENV === 'development'`. Zero impact in production.

### Option B (alternative): `/etc/hosts` or dnsmasq

Add to `/etc/hosts`:
```
127.0.0.1 nashik.localhost satara.localhost
```

Then visit `http://nashik.localhost:3004/announcements` — middleware extracts "nashik" from host.

Option A is simpler for quick dev. Option B more closely simulates prod behavior.

---

## Data model — the `gp_id` scoping pattern

Every tenant-owned row has a `gp_id` column pointing to `gp_tenants.id`:

```sql
CREATE TABLE gp_tenants (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subdomain   text UNIQUE NOT NULL,          -- "nashik"
  name_mr     text NOT NULL,
  name_en     text NOT NULL,
  village     jsonb,                          -- { name_mr, taluka, district, pincode }
  contact     jsonb,                          -- { phone, email, address }
  logo_url    text,
  created_at  timestamptz DEFAULT now()
);

CREATE TABLE announcements (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gp_id         uuid REFERENCES gp_tenants(id) ON DELETE CASCADE,  -- ← scope
  title_mr      text NOT NULL,
  title_en      text NOT NULL,
  content_mr    text,
  content_en    text,
  category      text DEFAULT 'general',
  is_published  boolean DEFAULT false,
  ...
);

-- Same pattern: events, gallery, post_holders, gp_admins
```

Every query filters by `gp_id`:

```ts
// Always:
.eq('gp_id', tenant.id)
```

**This is the entire trick.** The DB grows by rows, not tables. Adding GP #501 is a single INSERT into `gp_tenants` — zero schema change, zero deploy.

### RLS enforcement (defense in depth)

Row-Level Security policies on every table ensure that even if app code had a bug, Supabase would block cross-tenant reads/writes. Admins can only access rows matching their `gp_admins.gp_id`:

```sql
CREATE POLICY "admin_own_gp" ON announcements
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM gp_admins
      WHERE gp_admins.user_id = auth.uid()
        AND gp_admins.gp_id = announcements.gp_id
    )
  );
```

Public read access is separate — citizens don't need auth to view published content:

```sql
CREATE POLICY "public_read_published" ON announcements
  FOR SELECT TO anon
  USING (is_published = true);
```

---

## Resolving tenant from subdomain (cached)

`lib/tenant.ts` handles subdomain → tenant row lookup, memoized per render:

```ts
import { cache } from 'react'

export const getTenant = cache(async (subdomain: string): Promise<GpTenant | null> => {
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase
    .from('gp_tenants')
    .select('*')
    .eq('subdomain', subdomain)
    .single()
  return data as GpTenant | null
})
```

`react.cache()` means multiple components in the same render (layout + page + nav) all share one DB hit. Combined with Next.js Data Cache, repeat visits serve from memory.

---

## Infrastructure

### Production DNS setup (one-time)

```
grampanchayat.co.in          A      76.x.x.x  (or CNAME to Vercel)
*.grampanchayat.co.in        CNAME  same target
manage.grampanchayat.co.in   CNAME  same target
```

One wildcard covers all future tenants. Adding GP #501 tomorrow = zero DNS change.

### Hosting

On **Vercel** or **Cloudflare Pages**:
- Add `grampanchayat.co.in` as primary domain
- Add `*.grampanchayat.co.in` as wildcard domain
- Add `manage.grampanchayat.co.in` as specific domain
- SSL auto-provisioned (Let's Encrypt or platform cert)
- Middleware runs at edge → zero added latency

### Env vars

| Var | Purpose | Example |
|-----|---------|---------|
| `NEXT_PUBLIC_ROOT_DOMAIN` | Apex domain for subdomain extraction | `grampanchayat.co.in` (prod), `localhost` (dev) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client-safe Supabase key | `sb_publishable_...` |

---

## Edge cases & future considerations

### Reserved subdomains

The `RESERVED` set in middleware prevents `www`, `api`, `app`, `admin`, `manage`, `mail`, `smtp` from being treated as tenants. At signup, subdomain validation should also reject these + any profane or trademarked terms.

### Custom domains (v2)

Enterprise GPs may want their own domain (`sataragramapanchayat.in`). Solution:
- Add `custom_domain` column to `gp_tenants`
- Middleware checks if `host` matches any `custom_domain` before extracting subdomain
- CNAME setup handled per-customer via documentation

Not needed for MVP or the first 100 tenants.

### Multi-tenant users

One user admin of multiple GPs (block officer, cluster admin):
- `gp_admins` table already supports multi-row per user
- Post-login: show GP selector if `COUNT(*) > 1`
- JWT includes active `gp_id`; user can switch (re-issues JWT)
- Deferred to v2.

### Central admin migration (`manage.*`)

Currently: each GP's admin is at `{sub}.grampanchayat.co.in/admin/*`.

Future: unified admin at `manage.grampanchayat.co.in`:
- Login once, system knows user's `gp_id` from JWT
- Routes don't need `[tenant]` param
- Simpler UX for Gram Sevaks (one URL to remember)
- Middleware already reserves `manage` subdomain — ready for it

Migration would involve:
1. Add new `(manage)/` route group
2. Duplicate admin pages without `[tenant]` param (use auth context instead)
3. Redirect old `{sub}/admin/*` URLs to `manage.grampanchayat.co.in/*`

Not needed until onboarding flow matures.

---

## Summary

- **Wildcard DNS** → all subdomains point to one app
- **Middleware** extracts subdomain, rewrites URL to include `[tenant]` param
- **DB scoping by `gp_id`** → single table serves all tenants
- **RLS** enforces isolation at DB level (defense in depth)
- **Configurable domain** via `NEXT_PUBLIC_ROOT_DOMAIN` env var
- **Dev override** via `?tenant=` query param (no hosts file needed)

Scales linearly with row count, not tenant count. Adding GP #1000 is the same operation as adding GP #2.
