# nextjs-love

A minimal [Next.js](https://nextjs.org/) App Router starter for full-stack apps on [Cloudflare Workers](https://developers.cloudflare.com/workers/) via [OpenNext](https://opennext.js.org/cloudflare). The default page is a single centered line so you can grow the app from a clean slate.

**Stack:** Next.js 16 · React 19 · Tailwind CSS v4 · OpenNext for Cloudflare · Wrangler · TanStack Query (ready to wire up)

## What's included

- App Router in `src/app/` (`layout`, `page`, `loading`, `not-found`)
- Tailwind v4 via `src/app/globals.css`
- Layered backend placeholders: `src/services/`, `src/repositories/`
- Feature-oriented frontend placeholders: `src/features/`, `src/components/ui/`, `src/components/common/`
- OpenNext + Wrangler config for local preview and deploy (`wrangler.jsonc`, `open-next.config.ts`)
- D1 migration scripts and `migrations/` folder (add a `DB` binding in `wrangler.jsonc` when you need D1)
- Claude agent skills in `.claude/skills/` for Next.js and Cloudflare workflows

## Prerequisites

- [Node.js](https://nodejs.org/) 20+
- [pnpm](https://pnpm.io/)
- A [Cloudflare account](https://dash.cloudflare.com/) for `pnpm preview` and `pnpm deploy`

## Quick start

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). Turbopack is enabled via `next dev --turbopack`.

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Next.js dev server (Turbopack) |
| `pnpm build` | Typecheck + production Next build |
| `pnpm start` | Run the built Next app locally (Node) |
| `pnpm preview` | OpenNext build + Wrangler local preview |
| `pnpm deploy` | OpenNext build + deploy to Cloudflare |
| `pnpm migrate:local` | Apply D1 migrations locally (`DB` binding) |
| `pnpm migrate:prod` | Apply D1 migrations to remote D1 |
| `pnpm cf-typegen` | Regenerate `worker-configuration.d.ts` after binding changes |

## Cloudflare preview and deploy

1. Copy `.dev.vars.example` to `.dev.vars` and add secrets or runtime vars your app needs.
2. Run `pnpm preview` to build with OpenNext and serve through Wrangler locally.
3. Run `pnpm deploy` when ready to ship (requires Wrangler auth: `wrangler login`).

After changing bindings in `wrangler.jsonc`, run `pnpm cf-typegen` so TypeScript stays aligned with your Worker environment.

## Project layout

| Path | Purpose |
|------|---------|
| `src/app/` | Routes, layouts, route handlers (`api/**/route.ts`). Keep files thin; compose from features. |
| `src/features/<name>/` | Product features: `components/`, `hooks/`, `lib/`, `types.ts`, selective `index.ts` exports. |
| `src/components/ui/` | Low-level UI primitives (wrap design-system pieces here). |
| `src/components/common/` | Shared components used across features. |
| `src/lib/` | Cross-cutting helpers (not feature business logic). |
| `src/services/` | Server-side business logic for routes and Server Actions. |
| `src/repositories/` | D1/SQL and data access only. |
| `migrations/` | Numbered `.sql` files for D1 schema changes. |
| `.claude/skills/` | Agent skills (auth, D1, React patterns, TanStack Query, etc.). |
| `AGENTS.md` | Conventions for AI agents working in this repo. |

Avoid wildcard barrels (`export * from`) to reduce bundle bloat and name collisions. Prefer direct imports for heavy dependencies.

## D1 (optional)

This template does not ship with a D1 database configured. When you add one:

1. Add a `d1_databases` entry with binding name `DB` in `wrangler.jsonc`.
2. Place migrations under `migrations/` (e.g. `0000_auth.sql`).
3. Run `pnpm migrate:local` or `pnpm migrate:prod`.

For a JWT cookie auth starter, see `.claude/skills/nextjs-auth/`.

## Agent skills

Skills under `.claude/skills/` guide Claude (and compatible agents) on this stack:

**Next.js / React:** `nextjs-auth`, `frontend-features`, `vercel-react-best-practices`, `vercel-composition-patterns`, `tanstack-query`, `design-system`, `web-design-guidelines`, `web-perf`

**Cloudflare:** `d1-workflows`, `do-migrations`, `service-communication`

See `AGENTS.md` for repo-wide conventions.

## File tree

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
.claude/skills/
open-next.config.ts
wrangler.jsonc
.dev.vars.example
worker-configuration.d.ts
AGENTS.md
```

## License

Private template — use and adapt as needed for your project.
