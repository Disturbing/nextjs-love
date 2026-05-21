# Next.js webapp template structure

## Where code lives

- **`src/app/`**** — App Router only: `page.tsx`, `layout.tsx`, `loading.tsx`, `not-found.tsx`, route groups, and `api/**/route.ts`. Compose screens from `src/features` and `src/components`; avoid embedding large feature logic inline in route files.
- **`src/features/<name>/`** — One folder per product feature. Typical layout:
  - `components/` — feature UI (declarative; props in, JSX out)
  - `hooks/` — data fetching, mutations, local state
  - `lib/`, `utils/` — feature-scoped helpers
  - `types.ts` — feature types
  - `index.ts` — **selective** named re-exports only (no `export * from`)
- **`src/components/ui/`** — Low-level primitives (buttons, inputs, dialogs). Prefer one component per file; avoid importing `@radix-ui/`* directly from feature code — wrap primitives here when you add a design system.
- **`src/components/common/`** — Shared app components used by multiple features (shell pieces, empty states, shared cards) that are not global primitives.
- **`src/lib/`** — Cross-cutting utilities (runtime context, crypto, formatting). Not a dumping ground for feature business rules.
- **`src/services/`** — Server-side business logic invoked from route handlers or Server Actions.
- **`src/repositories/`** — D1/SQL and persistence only; no HTTP or UI concerns.

## Data and performance

- Keep route handlers and Server Actions thin: parse input, call `src/services`, return JSON or redirect.
- Prefer parallel independent async work (`Promise.all`) and avoid sequential waterfalls across unrelated data (see Vercel React best practices).
- Avoid heavy barrel imports from large libraries; import specific modules or use `next.config` `optimizePackageImports` when applicable.
- Minimize props passed across the server/client boundary to only what the client needs.
- Prefer composition over boolean mode props when component behavior starts to branch. Reach for explicit variants, compound components, or children-based composition before adding more flags.
- Prefer `children` or compound components over custom `renderX` props unless a render prop is clearly the best fit for the API.

## Auth and global shell

- Do not make `src/app/layout.tsx` auth-aware or add global nav by default unless the user asks. Integrate auth UI incrementally inside routes or features after backend auth exists (see `.claude/skills/nullshot-nextjs-auth` when using the JWT cookie starter).

## Agent skills

Claude skills for Next.js and Cloudflare live in `.claude/skills/` (synced from platform). Notable entries:

- **Next.js / React:** `nullshot-nextjs-auth`, `nullshot-frontend-features`, `vercel-react-best-practices`, `vercel-composition-patterns`, `tanstack-query`, `design-system`, `web-design-guidelines`, `web-perf`
- **Cloudflare:** `nullshot-d1-workflows`, `nullshot-do-migrations`, `nullshot-investigate-cloud-logs`, `nullshot-service-communication`, `nullshot-debug-logger`


