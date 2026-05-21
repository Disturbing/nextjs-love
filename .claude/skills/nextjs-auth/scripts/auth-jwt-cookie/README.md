# JWT Cookie Auth Starter

Canonical starter bundle for the default Next.js App Router webapp template.

Use this bundle when a generated app needs:
- signup
- login
- logout
- protected pages
- current-user lookup on the server

## Default bindings

- D1 binding: `DB`
- secret binding: `SESSION_SECRET`

If either binding is missing in a generated app, provision it before adapting the starter:
- `wrangler_config({ command: 'add_d1', binding_name: 'DB' })`
- `manage_secrets({ command: 'set', name: 'SESSION_SECRET', value: '<strong random secret>' })`

Do not replace the starter with an in-memory auth store just because the binding was missing at the start of the task.

## Expected migration

Create a D1 migration similar to:

```sql
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT,
  created_at INTEGER NOT NULL
);
```

## Copy workflow

Use `copy_skill_file` with:
- `skillId: "nullshot-nextjs-auth"`
- `sourcePrefix: "starter-presets/auth-jwt-cookie"`
- `installMode: "stage"`

This stages the starter under the hidden temp area returned by the tool. That staging area is ignored by CodeBox git commits.

Then:
- read the staged `starter-manifest.json`
- merge only the manifest target files into the real app tree
- customize those real app files for the product instead of rewriting auth from scratch

## Included files

- `src/types/auth.ts`
- `src/lib/password.ts`
- `src/lib/jwt.ts`
- `src/lib/session-cookie.ts`
- `src/repositories/user-repository.ts`
- `src/services/auth-service.ts`
- `src/app/api/auth/signup/route.ts`
- `src/app/api/auth/login/route.ts`
- `src/app/api/auth/logout/route.ts`
- `migrations/0000_auth.sql`
- `starter-manifest.json`

## Layering

The starter follows a thin-route-handler structure:

- `src/app/api/auth/**/route.ts`: request parsing, calling the service, shaping JSON/cookie responses
- `src/services/auth-service.ts`: auth validation, password hashing, JWT creation, current-user lookup
- `src/repositories/user-repository.ts`: D1 queries only
- `src/lib/*.ts`: runtime and crypto utilities

## Client integration defaults

The starter is backend-first. When you add client auth UI on top of it:

- create TanStack Query hooks for `useCurrentUserQuery`, `useLoginMutation`, `useSignupMutation`, and `useLogoutMutation`
- keep the `fetch('/api/auth/...')` calls inside those hooks, not inline in components
- use `/api/auth/me` as the client-facing source of truth for current-user state
- keep the session cookie `HttpOnly`; do not read auth state with `document.cookie`
- do not mirror auth/session tokens into `localStorage` or `sessionStorage`

## Runtime troubleshooting

- In generated playground apps, use `await getCloudflareContext()` as the default runtime access pattern.
- Treat runtime-context failures as real server-side blockers until the failing SSR or Flight path re-checks clean. A successful HTML shell response on `/` is not enough by itself.

## Intentional omissions

This starter does **not** automatically materialize:

- login/signup page UI
- a protected dashboard page
- auth-aware header or navigation components
- root layout changes

Those pieces should be built against the current room's existing `src/app` and `src/components` structure after the backend auth core is in place. This keeps the starter focused on stable auth infrastructure instead of forcing an opinionated app shape.
