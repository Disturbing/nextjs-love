# Next.js Client Pattern

## Website Calling Backend via RPC

Use `getCloudflareContext` to access the service binding and call RPC methods directly.

```typescript
// src/lib/clients/my-service-client.ts
import { getCloudflareContext } from '@opennextjs/cloudflare';
import type { Item, CreateItemInput } from '@platform/my-service/types';

class MyServiceClient {
  private async getService() {
    const { env } = await getCloudflareContext({ async: true });
    return (env as any).MY_SERVICE;
  }

  async getItem(itemId: string): Promise<Item | null> {
    const service = await this.getService();
    return service.getItem(itemId);
  }

  async createItem(input: CreateItemInput): Promise<Item> {
    const service = await this.getService();
    return service.createItem(input);
  }
}

export const myServiceClient = new MyServiceClient();
```

## Usage in API Routes / Resolvers

```typescript
// src/app/api/graphql/resolvers/item-resolvers.ts
import { myServiceClient } from '@/lib/clients/my-service-client';

export const itemResolvers = {
  Query: {
    item: async (_parent, { id }, ctx) => {
      if (!ctx.userId) throw new Error('Unauthorized');
      return myServiceClient.getItem(id);
    },
  },
  Mutation: {
    createItem: async (_parent, { input }, ctx) => {
      if (!ctx.userId) throw new Error('Unauthorized');
      return myServiceClient.createItem({ ...input, userId: ctx.userId });
    },
  },
};
```
