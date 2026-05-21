---
name: nullshot-nextjs-auth
description: Canonical Next.js App Router auth starter for generated webapp jams. Use when adding signup/login/logout, protected dashboard pages, JWT auth, cookie auth, current-user helpers, or D1-backed users in the default Next.js template.
---

# Nullshot Next.js Auth

Use this skill for auth inside the default Next.js App Router webapp template.

Load this together with:
- `nullshot-frontend-features`
- `vercel-react-best-practices`
- `nullshot-d1-workflows` when auth reads or writes D1

Do not use `nullshot-worker-auth` for this template unless the app is explicitly building a Worker-only or Hono auth surface.

## Default decision

For generated Next.js jams, the default auth starter is:
- D1-backed users
- Web Crypto password hashing
- JWT signed with Web Crypto HMAC-SHA256
- JWT stored in an `HttpOnly` cookie for browser auth
- Route handlers in `src/app/api/auth/**/route.ts`
- Auth business logic in `src/services/auth-service.ts`
- SQL and D1 access in `src/repositories/user-repository.ts`

Do not default to NextAuth/Auth.js, Better Auth, Clerk, Supabase Auth, or server-side session stores unless the user explicitly asks for them.

## Starter-first workflow

When a user asks for auth in the default Next.js template:

1. Read `starter-presets/auth-jwt-cookie/README.md`
2. Call `manage_secrets({ command: 'list' })` and `wrangler_config({ command: 'view' })` first so you know whether `SESSION_SECRET` and `DB` already exist
3. If `DB` is missing for the default auth path, provision it with `wrangler_config({ command: 'add_d1', binding_name: 'DB' })` before writing auth code
4. If `SESSION_SECRET` is missing for the default auth path, provision it with `manage_secrets({ command: 'set', name: 'SESSION_SECRET', value: '<strong random secret>' })` before writing auth code
5. Start from those files instead of inventing auth from scratch
6. If `copy_skill_file` is available, stage `starter-presets/auth-jwt-cookie/` into the hidden temp area first
7. Read the staged `starter-manifest.json` and copy or adapt only those files into the real app paths:
   - `src/types/auth.ts`
   - `src/lib/password.ts`
   - `src/lib/jwt.ts`
   - `src/lib/session-cookie.ts`
   - `src/repositories/user-repository.ts`
   - `src/services/auth-service.ts`
   - `src/app/api/auth/signup/route.ts`
   - `src/app/api/auth/login/route.ts`
   - `src/app/api/auth/logout/route.ts`
8. Edit the real app files for the product instead of rebuilding the auth shape from memory

If the starter is already present in the app, edit it. Do not create a second auth system.
If `copy_skill_file` succeeds, the staged starter files and manifest are now the source of truth for auth. Re-read those staged files and adapt the manifest targets. Do not continue an older partial auth scaffold in parallel, and do not commit the staged temp copies.

## Hard rules

- Do not modify `tsconfig.json`, `next-env.d.ts`, or `worker-configuration.d.ts` for auth work
- Do not invent or change import alias configuration during auth work
- Use relative imports unless the current app already proves an alias policy
- For Cloudflare bindings (D1, KV, secrets), use `import { getCloudflareContext } from '@opennextjs/cloudflare'` then `const { env } = await getCloudflareContext()`
- Bindings are typed via the global `CloudflareEnv` interface in `worker-configuration.d.ts` (auto-generated; do not edit)
- Do not use `getRequestContext()`; use `getCloudflareContext()` instead
- Before changing an import, read the current file and verify the relative path from that file's actual directory; do not "count path segments" from memory
- If a nested `src/app/api/auth/**/route.ts` file imports from `src/lib/`, `src/services/`, or `src/repositories/`, verify the relative path against the real file location before editing; do not rewrite a working relative import just because an error report looked stale
- Keep runtime and crypto helpers in `src/lib/`, business logic in `src/services/`, and SQL/D1 queries in `src/repositories/`
- Do not put raw SQL, `env.DB.prepare(...)`, or D1 query strings directly inside `src/app/api/**/route.ts`
- Keep route handlers thin: parse input, call a service, return structured JSON, and set cookies on the response
- The starter is intentionally backend/core only. Do not treat it as permission to rewrite the app's global layout, header, or dashboard shape from memory.
- Do not add auth-aware header/navigation components or rewrite `src/app/layout.tsx` as part of starter installation unless the user explicitly asks for that UX or the current room structure clearly requires it.
- Build login/signup UI against the room's existing folder structure after the backend pieces are in place. Prefer the smallest UI shape that matches the current app rather than importing a canned page hierarchy.
- After copying the starter, do not create parallel auth files like `src/lib/db.ts`, `src/lib/session.ts`, `src/app/lib/**`, or a combined `src/app/auth/page.tsx` unless the copied starter for this task explicitly calls for them
- Do not import `next/headers`, `next/server`, DB helpers, or secret-reading helpers into `'use client'` modules
- Do not read or write auth/session cookies with `document.cookie` in client code for the default auth path. Keep the session cookie `HttpOnly`; the browser sends it automatically on same-origin requests.
- Do not call `/api/auth/**` with raw `fetch` directly inside components. Put auth requests inside dedicated TanStack Query hooks, then consume those hooks from components.
- Do not store auth or session tokens in `localStorage` or `sessionStorage` for the default browser auth path
- Do not write `.env` or `.dev.vars` files for auth secrets
- Use `manage_secrets({ command: 'list' })` and `wrangler_config({ command: 'view' })` before writing secret-dependent code
- For the default generated auth path, missing `DB` or `SESSION_SECRET` is not a reason to fall back to in-memory auth. Provision them with `wrangler_config(add_d1)` and `manage_secrets(set)` instead.
- Do not ship in-memory auth storage such as a module-level `Map` for generated signup/login unless the user explicitly asked for a no-database demo
- Do not "fix" Web Crypto code from memory. `crypto.subtle.sign()` and `crypto.subtle.verify()` accept `BufferSource`, and `Uint8Array` is valid there. Only change those calls when the current diagnostics point to the actual line/signature you are editing

## Cookie and JWT defaults

Default browser auth shape:
- Cookie name like `session_token`
- `HttpOnly`
- `SameSite=Lax`
- `Path=/`
- `Secure` only on HTTPS / non-localhost
- JWT payload kept small: `sub`, `email`, `name`, `exp`
- For embedded room preview hosts like `dev-*.localhost`, the cookie policy may upgrade to cross-site-safe attributes so auth survives inside the preview iframe

Default secret:
- `SESSION_SECRET`

Default crypto:
- Password hashing: PBKDF2 via Web Crypto
- JWT signing: HMAC-SHA256 via Web Crypto

## Runtime access

For Cloudflare bindings in auth code, use the standard OpenNext pattern:

```ts
import { getCloudflareContext } from '@opennextjs/cloudflare';

const { env } = await getCloudflareContext();
const db = env.DB;
const secret = env.SESSION_SECRET;
```

Bindings are typed via the global `CloudflareEnv` interface in `worker-configuration.d.ts` (auto-generated; do not edit).
Do not read runtime bindings with ad-hoc `(globalThis as ...)` snippets.
Do not use `getRequestContext()`; use `getCloudflareContext()` instead.
In generated playground apps, `await getCloudflareContext()` is the canonical form. Do not reintroduce `{ async: true }` unless the current runtime implementation or current diagnostics explicitly require it.
If preview reports "Cloudflare runtime context is not available", treat it as a real server-side blocker until the failing SSR/Flight path re-checks clean. Do not dismiss it just because the document shell returned HTML 200.

## Route handler rules

In `src/app/api/auth/**/route.ts`:
- Wrap `request.json()` in try/catch
- Return structured JSON errors with stable codes
- Set cookies on the response headers, not on the request cookie store
- Use `NextResponse.json(...)`
- Call `src/services/auth-service.ts` instead of duplicating auth logic
- Never inline D1 queries or password/JWT logic here

## Server component rules

For protected pages (server components):
- Read the auth cookie on the server with `getCurrentUserFromCookies()` from `@/services/auth-service`
- Redirect unauthenticated users from the server
- Pass the user as a prop to client components that need it

For client components that need reactive user state:
- Create a `/api/auth/me` route handler that returns the current user from the cookie
- Create dedicated TanStack Query auth hooks (for example in `src/features/auth/hooks/`) for `useCurrentUserQuery`, `useLoginMutation`, `useSignupMutation`, and `useLogoutMutation`
- Use a stable auth query key like `['auth', 'me']` for the current user query
- Invalidate that query after login/signup/logout mutations
- Let the browser send the `HttpOnly` session cookie automatically; do not mirror it into client-readable storage
- This gives client components reactive auth state without SSR-only patterns

Example `/api/auth/me` route:
```ts
import { NextResponse } from 'next/server';
import { getCurrentUserFromCookies } from '@/services/auth-service';

export async function GET() {
  const user = await getCurrentUserFromCookies();
  if (!user) return NextResponse.json({ user: null });
  return NextResponse.json({ user });
}
```

Example auth hooks:
```ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AuthMutationResponse, PublicUser } from '@/types/auth';

export const authKeys = {
  currentUser: () => ['auth', 'me'] as const,
};

async function fetchCurrentUser(): Promise<{ user: PublicUser | null }> {
  const response = await fetch('/api/auth/me');
  if (!response.ok) {
    throw new Error('Failed to load current user');
  }

  return (await response.json()) as { user: PublicUser | null };
}

export function useCurrentUserQuery() {
  return useQuery<{ user: PublicUser | null }>({
    queryKey: authKeys.currentUser(),
    queryFn: fetchCurrentUser,
    staleTime: Infinity,
  });
}

type LoginInput = { email: string; password: string };

async function loginRequest(input: LoginInput): Promise<AuthMutationResponse> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  return (await response.json()) as AuthMutationResponse;
}

export function useLoginMutation() {
  const queryClient = useQueryClient();

  return useMutation<AuthMutationResponse, Error, LoginInput>({
    mutationFn: loginRequest,
    onSuccess: (result) => {
      if (result.ok) {
        void queryClient.invalidateQueries({ queryKey: authKeys.currentUser() });
        window.location.href = '/dashboard';
      }
    },
  });
}
```

After login/signup, invalidate the current-user query from the hook layer:
```ts
void queryClient.invalidateQueries({ queryKey: authKeys.currentUser() });
```

Client components should consume those hooks rather than calling `/api/auth/**` directly:
```tsx
// src/features/auth/components/login-form.tsx
'use client';
import { useState } from 'react';
import { useLoginMutation } from '@/features/auth/hooks/use-login-mutation';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const login = useLoginMutation();

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        setError('');
        login.mutate(
          { email, password },
          {
            onSuccess: (result) => {
              if (!result.ok) {
                setError(result.error?.message ?? 'Login failed.');
              }
            },
          },
        );
      }}
    >
      <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
      <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
      {error ? <p>{error}</p> : null}
      <button type="submit" disabled={login.isPending}>
        {login.isPending ? 'Signing in...' : 'Sign in'}
      </button>
    </form>
  );
}
```

## UI integration rules

For auth UI in the default Next.js template:
- Build auth forms as `'use client'` components that consume TanStack Query auth hooks (`useLoginMutation`, `useSignupMutation`, `useLogoutMutation`, `useCurrentUserQuery`).
- Do not use Server Actions for auth forms — the `useMutation` + API route pattern avoids "cannot be passed directly to Client Components" errors and gives you `isPending`, error state, and cache invalidation for free.
- Keep the `fetch('/api/auth/...')` logic inside the hook implementation, not inline in the component.
- The template ships with `QueryClientProvider` in `src/components/providers.tsx`, already wired into the layout — do not recreate it.
- Avoid `useTransition` for auth forms unless the current room already uses that pattern successfully.
- Avoid introducing `useRouter()` redirects in auth forms when `window.location.href` is sufficient.
- Do not create a synthetic `/auth` hub page, auth-aware global header, or placeholder dashboard automatically unless the user explicitly requested that shape.
- If the room already has an app shell, integrate auth into that shell incrementally instead of replacing it with a canned auth layout.

### Auth form example

The route handlers return `AuthMutationResponse` (`{ ok, data?, error? }`). Put the mutation in a hook, then call the hook from the component:

```tsx
// src/app/login/page.tsx
'use client';
import { useState } from 'react';
import { useLoginMutation } from '@/features/auth/hooks/use-login-mutation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const login = useLoginMutation();

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        setError('');
        login.mutate(
          { email, password },
          {
            onSuccess: (result) => {
              if (!result.ok) {
                setError(result.error?.message ?? 'Login failed.');
              }
            },
          },
        );
      }}
    >
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
      {error && <p>{error}</p>}
      <button type="submit" disabled={login.isPending}>
        {login.isPending ? 'Signing in...' : 'Sign in'}
      </button>
    </form>
  );
}
```

Key points:
- `'use client'` at the top — this is a client component
- The hook owns the `fetch('/api/auth/...')` call and `useMutation` setup
- `useMutation` inside the hook should still use explicit generics `<AuthMutationResponse, Error, InputType>`
- Check `result.ok` in `onSuccess` — non-2xx responses from the route handler still resolve (cookie is set by the server)
- `window.location.href` for redirect after login (full navigation picks up the new cookie)
- `login.isPending` for loading state
- Show `result.error.message` for validation errors (duplicate email, wrong password, etc.)

## Import policy

For generated Next.js auth work, the import policy is platform-owned.

- If `tsconfig.json` does not currently define `baseUrl` + `paths`, do not use `@/...`
- If errors mention alias config but the current `tsconfig.json` does not support aliases, treat that as stale or mismatched evidence until re-verified
- Do not change `tsconfig.json` to “make auth compile”
- Fix the imports or use the starter’s import structure instead
- Do not claim an import is wrong until you have re-read the current file and verified the target path from that file's actual directory

## Validation loop

After auth changes:
- if you staged a starter bundle, re-read the staged files and manifest before making structural decisions
- check the actual file contents again before changing import strategy
- only report a TypeScript issue such as `implicit any` when the current file or current diagnostics actually show that symbol/problem
- only report a Web Crypto type mismatch when the current diagnostics actually show that mismatch on the current file; do not infer it from `Uint8Array` alone
- use `preview_flow` to verify signup
- use `preview_flow` to verify login
- use `preview_flow` to verify protected page access
- use `preview_flow` to verify logout
- verify handled failures like duplicate email or wrong password

Do not claim auth is fixed just because the code “looks right”.
