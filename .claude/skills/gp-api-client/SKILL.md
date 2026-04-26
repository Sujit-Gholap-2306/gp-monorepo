# GP API Client Pattern

## Why this skill exists

BE (`grampanchayat-api`) serializes all responses through `keysToSnake()` in `BaseController.ok()`.
FE (`grampanchayat`) must declare `Raw*` types (snake_case) and a `normalize*` function (camelCase) per endpoint group.
Skipping either half causes silent `undefined` fields at runtime.

---

## Response envelope

Every BE response is wrapped:
```json
{ "statusCode": 200, "data": { ...snake_case... }, "message": "...", "success": true }
```
`apiFetch<T>` extracts `json.data` and casts to `T`. Always type `T` as the `Raw*` type.

---

## Pattern — one API client file per domain

```
apps/grampanchayat/lib/api/<domain>.ts
```

### Step 1 — Public types (camelCase, exported)

```ts
export type FooItem = {
  id: string
  fiscalYear: string
  totalPaise: number
}
```

### Step 2 — Raw types (snake_case, file-private)

Mirror the exact BE JSON keys. Nest raw types for nested objects.

```ts
type RawFooItem = {
  id: string
  fiscal_year: string
  total_paise: number
}
```

### Step 3 — Normalize function (file-private)

```ts
function normalizeFooItem(raw: RawFooItem): FooItem {
  return {
    id: raw.id,
    fiscalYear: raw.fiscal_year,
    totalPaise: raw.total_paise,
  }
}
```

### Step 4 — Exported fetch function

```ts
export async function getFooList(subdomain: string, init?: RequestInit): Promise<FooItem[]> {
  const raw = await apiFetch<RawFooItem[]>(
    buildApiUrl(subdomain, tenantApiPaths.foo.list),
    { method: 'GET', ...init }
  )
  return raw.map(normalizeFooItem)
}
```

---

## Endpoint registration

Add paths to `apps/grampanchayat/lib/api/endpoints.ts`:

```ts
export const tenantApiPaths = {
  foo: {
    list:   'foo',
    detail: (id: string) => `foo/${id}`,
    create: 'foo',
  },
}
```

BE routes live in `apps/grampanchayat-api/src/routes/tenant.routes.ts` or `tenant-namune.routes.ts`.

Route format: `router.get('/:subdomain/foo', guard, controller.list)`

URL built on FE: `buildApiUrl(subdomain, path)` → `{API_BASE}/api/v1/tenants/{subdomain}/{path}`

---

## Auth header pattern (server components)

```ts
const supabase = await createSupabaseServerClient()
const accessToken = await getSupabaseAccessToken(supabase)
if (!accessToken) redirect(`/${subdomain}/login`)

const data = await getFooList(subdomain, {
  headers: { Authorization: `Bearer ${accessToken}`, cookie: cookieStore.toString() }
})
```

## Auth header pattern (client components)

```ts
const { data } = await createSupabaseBrowserClient().auth.getSession()
const token = data.session?.access_token
if (!token) { gpToast.error('...'); return }
await mutateFoo(subdomain, { headers: { Authorization: `Bearer ${token}` } })
```

---

## Checklist before shipping a new API client

- [ ] `Raw*` type matches actual BE JSON keys (snake_case) — verify with `console.log(raw)` or network tab
- [ ] `normalize*` maps every field — no missing keys
- [ ] Path in `endpoints.ts` matches BE route exactly
- [ ] Server page: access token checked, redirects on missing
- [ ] Client component: token from session, error toast on missing

---

## Reference files

| What | File |
|------|------|
| `apiFetch` + `buildApiUrl` | `apps/grampanchayat/lib/api/client.ts` |
| Endpoint paths | `apps/grampanchayat/lib/api/endpoints.ts` |
| `keysToSnake` | `apps/grampanchayat-api/src/common/serialize/keys-to-snake.ts` |
| Full example (complex nested) | `apps/grampanchayat/lib/api/namuna9.ts` |
| Simple example | `apps/grampanchayat/lib/api/onboarding.ts` |
| BE routes | `apps/grampanchayat-api/src/routes/tenant.routes.ts` |
