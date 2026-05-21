# WorkerEntrypoint Pattern

Every backend service exports a `WorkerEntrypoint` with typed RPC methods alongside a Hono app for HTTP-only routes.

## Full Example

```typescript
// src/index.ts
import { WorkerEntrypoint } from 'cloudflare:workers';
import { Hono } from 'hono';
import { cors } from 'hono/cors';

const httpApp = new Hono<{ Bindings: Env }>();

httpApp.use('*', cors({ origin: '*' }));

// HTTP-only: WebSocket upgrade proxy to DO
httpApp.get('/items/:id/ws', async (c) => {
  const itemId = c.req.param('id');
  const id = c.env.MY_DO.idFromName(itemId);
  const stub = c.env.MY_DO.get(id);
  const url = new URL(c.req.url);
  return stub.fetch(new Request(url.toString(), { headers: c.req.raw.headers }));
});

httpApp.onError((error, c) => {
  console.error('HTTP Error', error);
  return c.json({ error: 'Internal server error' }, 500);
});

httpApp.notFound((c) =>
  c.json({ error: 'HTTP API endpoint not found', hint: 'Use RPC for data operations.' }, 404)
);

export default class MyService extends WorkerEntrypoint<Env> {
  // RPC methods — called directly via service binding
  async getItem(itemId: string): Promise<Item | null> {
    return new UserService(this.env).getItem(itemId);
  }

  async createItem(input: CreateItemInput): Promise<Item> {
    return new UserService(this.env).createItem(input);
  }

  async deleteItem(itemId: string): Promise<void> {
    return new UserService(this.env).deleteItem(itemId);
  }

  // fetch() wraps Hono — only called for HTTP routes
  async fetch(request: Request): Promise<Response> {
    return httpApp.fetch(request, this.env, this.ctx);
  }
}
```

## RPC Interface File

Define the typed contract in `rpc-interface.ts` — exported so callers can type-check:

```typescript
// src/rpc-interface.ts
export interface MyServiceRPC {
  getItem(itemId: string): Promise<Item | null>;
  createItem(input: CreateItemInput): Promise<Item>;
  deleteItem(itemId: string): Promise<void>;
}
```

## Backend-to-Backend RPC

```typescript
// Direct RPC calls in a Hono handler or another WorkerEntrypoint method
app.post('/items', async (c) => {
  const result = await c.env.OTHER_SERVICE.createItem(input);
  return c.json(result);
});

// Inside a WorkerEntrypoint RPC method
async createItem(input: CreateItemInput): Promise<Item> {
  const usage = await this.env.USAGE_SERVICE.trackCreation(input.userId);
  // ...
}
```

## Communication Rules

| Source | Target | Method | Allowed |
|--------|--------|--------|---------|
| Website | Backend Worker | `service.methodName()` RPC | Yes |
| Backend Worker | Backend Worker | `service.methodName()` RPC | Yes |
| Backend Worker | Durable Object | `stub.methodName()` RPC | Yes |
| Durable Object | Durable Object | `stub.methodName()` RPC | Yes |
| Any | Backend Worker | `service.fetch()` HTTP (WebSocket/SSE/binary only) | Yes |
| Any | Backend Worker | `service.fetch()` HTTP (data operations) | **No** |
