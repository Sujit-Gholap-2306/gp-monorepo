# Database migrations (GP-Monorepo)

## Source of truth

**Drizzle owns app schema.**

Migrations live in `apps/grampanchayat-api/drizzle/migrations/`. The journal is `drizzle/migrations/meta/_journal.json`.

Run app-schema migrations with:

```bash
pnpm --filter @gp/grampanchayat-api db:migrate
```

Use Drizzle for:

- tables, columns, indexes, foreign keys, unique constraints
- `CHECK` constraints, preferably in schema with `check(...)`
- custom SQL migrations for functions, triggers, data backfills, and constraints that need safer rollout

Supabase SQL Editor is for inspection or emergency repair only. If you change schema there, add an equivalent Drizzle migration immediately so repo history and database history stay aligned.

Do **not** use `supabase db push` for ordinary `public` app tables. Reserve Supabase migrations for Supabase-platform concerns such as storage policies/buckets, auth hooks, realtime/publication setup, or RLS policy work that we intentionally keep outside app-schema ownership.

## If you already had old Drizzle migration files (`0000`–`0005` deleted) or a different journal

- Pull the branch and your **local** `drizzle` schema history no longer matches the branch: stop, **do not** run `drizzle-kit migrate` blindly on a production DB.  
- Confirm the target database has the expected `drizzle.__drizzle_migrations` entries before applying new migrations.
- Align the database to the current baseline (`0000_amused_rocket_racer.sql`), then run new Drizzle migrations.
- `0001_portal_audit_columns_and_checks.sql` adds audit columns (`created_at` / `updated_at`), publish coherence for announcements, `CHECK` constraints for media types and `gp_admins.role`, and updated-at triggers.

## RLS

Row Level Security may be **enabled** with no policies: the app must not rely on the browser talking to Postgres for domain tables. The Express API uses the service role and enforces `gp_tenants` + `gp_admins` in code.
