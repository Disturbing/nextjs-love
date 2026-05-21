# Adding a New Migration

## Steps

1. **Create the SQL file**: `src/<do-name>/migrations/000N_description.sql`

2. **Add the import and entry** to `migrations/index.ts`:

```typescript
import migration000N from './000N_description.sql';

const migrations: SQLSchemaMigration[] = [
  // ... existing entries unchanged ...
  { idMonotonicInc: N, description: 'description', sql: migration000N },
];
```

3. **Never edit or remove** existing entries.

## idMonotonicInc Rules

- **1-based** — start at 1, never 0
- **Sequential** — next ID is always `last + 1`, never skip
- **Never reuse** — if migration 3 is applied in production, the next must be 4
- **Independent from file prefix** — `0007_foo.sql` can have `idMonotonicInc: 4` if earlier files were removed/consolidated
- **Immutable once applied** — never modify the SQL of an applied migration, only add new ones

## Example: Adding Migration 4

```typescript
// migrations/index.ts — before
const migrations: SQLSchemaMigration[] = [
  { idMonotonicInc: 1, description: 'baseline',     sql: migration0000 },
  { idMonotonicInc: 2, description: 'add_feature',  sql: migration0001 },
  { idMonotonicInc: 3, description: 'add_index',    sql: migration0002 },
];

// Add new SQL file: 0003_add_status_column.sql
import migration0003 from './0003_add_status_column.sql';

// migrations/index.ts — after
const migrations: SQLSchemaMigration[] = [
  { idMonotonicInc: 1, description: 'baseline',          sql: migration0000 },
  { idMonotonicInc: 2, description: 'add_feature',       sql: migration0001 },
  { idMonotonicInc: 3, description: 'add_index',         sql: migration0002 },
  { idMonotonicInc: 4, description: 'add_status_column', sql: migration0003 },
];
```
