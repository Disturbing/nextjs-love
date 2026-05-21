---
name: nullshot-do-migrations
description: SQLite migration patterns for Cloudflare Durable Objects using durable-utils. Load when adding, modifying, or initializing DO SQLite migrations. Covers migrations folder structure, SQL file imports via wrangler Text rule, the getMigrationRunner factory, blockConcurrencyWhile initialization pattern, idMonotonicInc rules, and durable-utils API.
---

# Durable Object Migrations — Cloudflare Workers

Uses `durable-utils@0.3.5` (`durable-utils/sql-migrations`). Each DO owns its own `migrations/` folder with numbered SQL files, a `sql.d.ts` type declaration, and an `index.ts` that exports `getMigrationRunner`. Migrations run in `blockConcurrencyWhile` in the DO constructor.

## When to Load

- Adding a new SQLite migration to a Durable Object
- Setting up migrations for a new DO
- Initializing the DO constructor with `blockConcurrencyWhile`
- Referencing `idMonotonicInc` rules or `durable-utils` API

## References

| File | Contents |
|------|----------|
| [folder-structure.md](references/folder-structure.md) | Migration folder layout, sql.d.ts, wrangler Text rule config |
| [migration-runner.md](references/migration-runner.md) | migrations/index.ts format, getMigrationRunner factory, idMonotonicInc rules, durable-utils API |
| [do-constructor.md](references/do-constructor.md) | blockConcurrencyWhile initialization pattern, initialization guard pattern |
| [adding-migrations.md](references/adding-migrations.md) | Step-by-step: add a new migration, idMonotonicInc rules with examples |

## Anti-patterns

- Never start `idMonotonicInc` at 0 — must be 1-based
- Never renumber or reuse a migration ID that has been applied in production
- Never edit the SQL of an already-applied migration entry
- Never instantiate repositories before `runAll()` completes in `blockConcurrencyWhile`
