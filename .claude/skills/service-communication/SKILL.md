---
name: nullshot-service-communication
description: RPC-first inter-service communication for Cloudflare Workers using WorkerEntrypoint. Load when creating or modifying WorkerEntrypoint classes, service bindings, RPC methods, wrangler.jsonc service config, or calling one Worker from another (Worker-to-Worker, Worker-to-DO, DO-to-DO, or Next.js to backend). Covers RPC interface pattern, WorkerEntrypoint setup, Next.js client pattern, and DO RPC.
---

# Service Communication — Cloudflare Workers

RPC-first. HTTP (Hono) is only used for WebSocket, SSE, binary responses, and DO proxy routes. All data operations use direct RPC method calls via service bindings.

## When to Load

- Creating or modifying a `WorkerEntrypoint` class
- Adding RPC methods to a Worker
- Calling one Worker from another or from Next.js
- Configuring service bindings in `wrangler.jsonc`
- Setting up DO RPC from a Worker

## References

| File | Contents |
|------|----------|
| [workerentrypoint.md](references/workerentrypoint.md) | Full WorkerEntrypoint + Hono setup, RPC interface file, backend-to-backend RPC, communication rules table |
| [client-pattern.md](references/client-pattern.md) | Next.js/website client pattern using getCloudflareContext |
| [do-rpc.md](references/do-rpc.md) | Worker→DO and DO→DO RPC, DO method definition, WebSocket proxy pattern |
| [wrangler-config.md](references/wrangler-config.md) | wrangler.jsonc service binding and DO binding config, naming conventions |

## Anti-patterns

```typescript
// ❌ HTTP fetch for data — use RPC
await env.MY_SERVICE.fetch(new Request('https://my-service/api/items/123'));

// ❌ Standard Worker export — loses RPC capability
export default { async fetch(request, env, ctx) { ... } };

// ❌ Hardcoded URL
await fetch('http://localhost:8888/api/items');

// ✅ WorkerEntrypoint with RPC methods
export default class MyService extends WorkerEntrypoint<Env> { ... }
```
