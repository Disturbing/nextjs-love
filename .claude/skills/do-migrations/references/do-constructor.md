# DO Constructor Initialization Pattern

Run migrations inside `ctx.blockConcurrencyWhile` so no handler can query stale schema. Instantiate repositories only after `runAll()` completes.

## Standard Pattern

```typescript
import { DurableObject } from 'cloudflare:workers';
import { getMigrationRunner } from './migrations/index.js';
import { ItemRepository } from './services/item-repository.js';
import { AuditRepository } from './services/audit-repository.js';

export class MyDO extends DurableObject<Env> {
  private itemRepo!: ItemRepository;
  private auditRepo!: AuditRepository;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);

    ctx.blockConcurrencyWhile(async () => {
      const migrationRunner = getMigrationRunner(ctx.storage);
      await migrationRunner.runAll();

      // Only instantiate repos after schema is up to date
      this.itemRepo = new ItemRepository(ctx.storage.sql);
      this.auditRepo = new AuditRepository(ctx.storage.sql);
    });
  }
}
```

## With Initialization Guard

For a DO that needs to guard subsequent RPC calls until init completes:

```typescript
export class MyDO extends DurableObject<Env> {
  private initialized = false;
  private itemRepo!: ItemRepository;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);

    ctx.blockConcurrencyWhile(async () => {
      const migrationRunner = getMigrationRunner(ctx.storage);
      await migrationRunner.runAll();
      this.itemRepo = new ItemRepository(ctx.storage.sql);
      this.initialized = true;
    });
  }

  async getItems(params: GetItemsParams) {
    if (!this.initialized) throw new Error('MyDO not yet initialized');
    return this.itemRepo.findMany(params);
  }
}
```
