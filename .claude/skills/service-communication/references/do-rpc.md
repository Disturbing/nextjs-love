# Durable Object RPC Pattern

## Worker → Durable Object

```typescript
// Get DO stub by name, then call RPC methods directly
const id = env.MY_DO.idFromName(itemId);
const stub = env.MY_DO.get(id);
const messages = await stub.getMessages({ itemId });
```

## DO → DO (inside a DO class method)

```typescript
const otherId = this.env.OTHER_DO.idFromName(resourceId);
const other = this.env.OTHER_DO.get(otherId);
const snapshot = await other.getSnapshot(branchName);
```

## DO RPC Method Definition

```typescript
import { DurableObject } from 'cloudflare:workers';

export class MyDO extends DurableObject<Env> {
  // RPC methods are just public async methods
  async getMessages(params: { itemId: string }) {
    return this.sql
      .prepare('SELECT * FROM messages WHERE item_id = ? ORDER BY created_at DESC')
      .bind(params.itemId)
      .all();
  }

  async createMessage(input: { itemId: string; content: string; userId: string }) {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    this.sql
      .prepare('INSERT INTO messages (id, item_id, content, user_id, created_at) VALUES (?, ?, ?, ?, ?)')
      .bind(id, input.itemId, input.content, input.userId, now)
      .run();
    return { id, ...input, createdAt: now };
  }
}
```

## WebSocket Proxy to DO (HTTP only)

```typescript
// In Hono app — HTTP route that proxies WebSocket upgrade to DO
httpApp.get('/items/:id/ws', async (c) => {
  const itemId = c.req.param('id');
  const id = c.env.MY_DO.idFromName(itemId);
  const stub = c.env.MY_DO.get(id);
  const url = new URL(c.req.url);
  return stub.fetch(new Request(url.toString(), { headers: c.req.raw.headers }));
});
```
