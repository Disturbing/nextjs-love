# getMigrationRunner Factory

## migrations/index.ts

```typescript
import { SQLSchemaMigrations, type SQLSchemaMigration } from 'durable-utils/sql-migrations';

import migration0000 from './0000_baseline.sql';
import migration0001 from './0001_add_feature.sql';
import migration0002 from './0002_extend_schema.sql';

const migrations: SQLSchemaMigration[] = [
  { idMonotonicInc: 1, description: 'baseline',       sql: migration0000 },
  { idMonotonicInc: 2, description: 'add_feature',    sql: migration0001 },
  { idMonotonicInc: 3, description: 'extend_schema',  sql: migration0002 },
];

export function getMigrationRunner(doStorage: DurableObjectStorage): SQLSchemaMigrations {
  return new SQLSchemaMigrations({ doStorage, migrations });
}
```

## durable-utils API

```typescript
import { SQLSchemaMigrations } from 'durable-utils/sql-migrations';

const runner = new SQLSchemaMigrations({ doStorage, migrations });

await runner.runAll();              // Runs only unapplied migrations (idMonotonicInc > last applied)
runner.hasMigrationsToRun();        // true until runAll() is called at least once
```

Other exports from `durable-utils`:

```typescript
import { ... } from 'durable-utils/do-sharding';  // DO sharding utilities
import { ... } from 'durable-utils/retries';       // Retry helpers
import { ... } from 'durable-utils/do-utils';      // General DO utilities
```

## idMonotonicInc Rules

- **1-based** — start at 1, never 0
- **Never reuse or renumber** — if migration 3 is applied in production, the next must be 4
- **Independent from file prefix numbers** — `0007_foo.sql` can have `idMonotonicInc: 4` if earlier files were removed/consolidated
- **Never modify** an already-applied SQL entry — only add new entries with higher IDs
