# Migration Folder Structure

Uses `durable-utils@0.3.5` (`durable-utils/sql-migrations`).

## Layout

Each DO owns its own `migrations/` folder alongside the main DO class:

```
src/
  my-do/
    my-do.ts                    # Main DO class
    migrations/
      sql.d.ts                  # Type declaration for *.sql imports
      index.ts                  # Migration registry + getMigrationRunner()
      0000_baseline.sql
      0001_add_feature.sql
      0002_extend_schema.sql
      ...
  other-do/
    other-do.ts
    migrations/
      sql.d.ts
      index.ts
      0000_baseline.sql
      0001_add_index.sql
```

For a service with a single DO, a flat `src/migrations/` at the package level is acceptable.

## sql.d.ts

Required in every migrations folder — tells TypeScript that `.sql` files export a string:

```typescript
// src/my-do/migrations/sql.d.ts
declare module '*.sql' {
  const content: string;
  export default content;
}
```

## wrangler.jsonc Text Rule

SQL files are imported as raw strings via wrangler's Text module rule:

```jsonc
// wrangler.jsonc
{
  "rules": [
    { "type": "Text", "globs": ["**/*.sql"], "fallthrough": true }
  ]
}
```
