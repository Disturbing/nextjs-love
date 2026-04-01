# Next.js App Router Starter

A minimal starter for fullstack apps with the Next.js App Router. The default UI is a single centered **Nullshot Beta** line so you can grow the app from a clean slate.

## Features

- `src/app/` directory routing
- `layout.tsx`, `loading.tsx`, `not-found.tsx`, and metadata
- Tailwind CSS v4 via `src/app/globals.css`
- Ready for thin route handlers in `src/app/api/**/route.ts`
- Backend layering: `src/services/` for business logic, `src/repositories/` for SQL/data access
- Feature-oriented frontend placeholders: `src/features/`, `src/components/ui/`, `src/components/common/`
- Optional local OpenNext + Wrangler workflow for Cloudflare preview/testing

## App structure (conventions)

| Area | Purpose |
|------|---------|
| `src/app/**` | Routes, layouts, `loading.tsx` / `not-found.tsx`, and route handlers only. Compose UI from features and shared components; keep files thin. |
| `src/features/<name>/` | Product features: `components/`, `hooks/`, `lib/`, `utils/`, `types.ts`, and a selective `index.ts` barrel. Hooks own data fetching and state; components stay declarative. |
| `src/components/ui/` | Low-level, reusable UI primitives (e.g. shadcn-style building blocks). |
| `src/components/common/` | App-wide reusable components that are not tied to one feature. |
| `src/lib/` | Cross-cutting helpers (e.g. runtime, crypto) — not feature business logic. |
| `src/services/` | Server-side business logic called from route handlers or Server Actions. |
| `src/repositories/` | D1/SQL and data access only. |

Avoid wildcard barrel exports (`export * from`) to prevent name collisions and bundle bloat. Prefer direct imports for heavy third-party packages where it helps tree-shaking (see Vercel React best practices).

Cursor rules for agents live in `.cursor/rules/`.

## Local Development

1. Install dependencies with `pnpm install`.
2. Copy `.dev.vars.example` to `.dev.vars` and add any secrets/runtime vars you need for local OpenNext/Cloudflare access.
3. Add `.sql` files under `migrations/` when your app uses D1-backed features.
4. Run `pnpm dev` for normal Next.js local development.
5. Run `pnpm preview` to build with OpenNext and preview through Wrangler locally.
6. If your app uses D1 with the default `DB` binding in `wrangler.jsonc`, run `pnpm migrate:local` for local migrations and `pnpm migrate:prod` for production migrations.
7. Run `pnpm cf-typegen` after changing `wrangler.jsonc` bindings so `worker-configuration.d.ts` stays in sync.

## Runtime Notes

Build the app using normal App Router conventions in `src/app/`.
Use `src/app/api/**/route.ts` or Server Actions for server-side behavior.
Keep route handlers thin: request parsing and response shaping belong in the route, while business logic belongs in `src/services/` and SQL/D1 access belongs in `src/repositories/`.

This template ships optional local OpenNext/Wrangler config so the app can run standalone on your machine.
Playground preview and remote deploy still use the platform's custom Next-compatible runtime instead of relying on `.open-next` output.

For D1-backed features such as the default auth starter, keep schema files in `migrations/`.
The built-in migration scripts assume the default D1 binding name is `DB`.

## File Structure

```txt
src/
  app/
    layout.tsx
    page.tsx
    globals.css
    loading.tsx
    not-found.tsx
  components/
    common/
    ui/
  features/
  lib/
    runtime-context.ts
  services/
  repositories/
migrations/
  README.md
.cursor/
  rules/
.dev.vars.example
worker-configuration.d.ts
wrangler.jsonc
```
