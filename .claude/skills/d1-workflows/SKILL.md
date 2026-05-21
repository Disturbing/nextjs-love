# Nullshot D1 Workflows

Use this skill when building or debugging Cloudflare D1 code in generated Worker apps.

Triggers:
- Adding or changing tables in `migrations/*.sql`
- Writing Worker code that uses `env.DB`
- Debugging `no such table`, `no such column`, or schema drift errors
- Reviewing auth/database flows in `src/worker/`

## Core Rules

- Treat migration files as append-only. If schema needs to change after a migration was applied, create a new numbered migration. Do not rewrite an old applied migration to add a column.
- Use `d1_migration(status)` or `d1_query(schema)` to inspect the live preview schema before blaming Worker code.
- If the live preview database drifted and is disposable, use `d1_query(reset_local)` to rebuild it from current migrations.
- Prefer explicit column lists in `INSERT` statements and keep migration SQL SQLite-compatible.
- Verify the runtime path, not just the file contents. A migration file can look correct while the live preview schema is still old.

## Worker Query Patterns

- Reads returning many rows:
  - `const { results } = await env.DB.prepare('SELECT * FROM users ORDER BY created_at DESC').all();`
- Reads returning one row:
  - `const user = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(id).first();`
- Writes:
  - `await env.DB.prepare('INSERT INTO users (email, password_hash) VALUES (?, ?)').bind(email, hash).run();`
- Do not return the raw `.all()` wrapper to the client. Destructure `results` first.

## Migration Workflow

1. Confirm a D1 binding exists with `wrangler_config(view)` or add one with `wrangler_config(add_d1)`.
2. Create the first schema in `migrations/0000_*.sql`.
3. For later schema changes, create `0001_*`, `0002_*`, and so on.
4. Run `d1_migration(apply)` to get real apply results.
5. Run `d1_migration(status)` to compare migration files with the live schema.
6. If behavior still looks wrong, run `d1_query(schema)` and then a targeted `d1_query(query)` call.

## Drift Debugging

If code inserts `users.name` but the live DB says that column does not exist:

- Check `d1_migration(status)` first.
- If an older applied migration file now contains the new column, that is drift: the file was edited after initial apply.
- Fix by creating a new migration like `ALTER TABLE users ADD COLUMN name TEXT;`
- If this is only a disposable local preview DB and you want a clean rebuild, use `d1_query(reset_local)` after fixing the migration set.

## Auth-Specific Notes

- Auth flows often touch `users`, `sessions`, and token tables early, so schema drift shows up as 500s during signup/login.
- When auth routes fail, inspect both:
  - the Worker query in `src/worker/`
  - the live preview schema via `d1_query(schema)`
- Do not assume a migration applied just because the file exists.
