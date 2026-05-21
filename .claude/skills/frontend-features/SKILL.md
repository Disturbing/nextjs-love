---
name: nullshot-frontend-features
description: Feature-based frontend architecture for Next.js App Router with TanStack Query and GraphQL. Load when building features in src/features/, creating data-fetching hooks, components, or real-time state. Covers the features folder structure, hook patterns (query keys, inline GraphQL fetch, useQuery/useMutation), WebSocket→cache updates, optimistic mutations, component conventions, and styling with Tailwind + CVA + cn().
---

# Frontend Features

## Core Rules

- Features live in `src/features/<name>/` with `components/`, `hooks/`, `types/`, `utils/`, `lib/`, and an `index.ts` barrel.
- Hooks own all data fetching and state — components are pure/declarative (receive data as props).
- New hooks use TanStack React Query. For GraphQL, keep the request inside the hook with inline `fetch('/api/graphql')` — not Apollo Client.
- The same hook-owned rule applies to non-GraphQL endpoints like `/api/auth/**`: components should consume auth hooks, not call those endpoints directly.
- WebSocket events patch the cache via `queryClient.setQueryData` — only use `invalidateQueries` after mutations or reconnects.
- Never add business logic inside components — extract to a hook in the feature's `hooks/` folder.
- Moving forward, we want to follow vercel-composition-patterns and vercel-react-best-practices (you should load these skills by default) when working on the `packages/website`.

## References

| Topic | File |
|---|---|
| Feature folder layout, barrel exports, file naming conventions | [`references/feature-structure.md`](references/feature-structure.md) |
| Query key factory, useQuery with GraphQL, staleTime guide | [`references/hooks.md`](references/hooks.md) |
| WebSocket → setQueryData cache update pattern | [`references/realtime.md`](references/realtime.md) |
| onMutate / onError / onSuccess / onSettled full pattern | [`references/optimistic-mutations.md`](references/optimistic-mutations.md) |
| Component conventions, pure/declarative pattern | [`references/components.md`](references/components.md) |
| cn() utility, CVA variants, CSS custom properties, Tailwind | [`references/styling.md`](references/styling.md) |

## Anti-Patterns

```typescript
// ❌ Fetching inside a component
export function EntityHeader({ entityId }: { entityId: string }) {
  const { data } = useQuery({ queryKey: ['entity', entityId], queryFn: fetchEntity });
}
// ✅ Move fetch to a hook; component receives entity as a prop

// ❌ Importing Radix directly in feature components
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
// ✅
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

// ❌ Hardcoded colors
<div className="bg-[#1a1a2e]" />
// ✅
<div className="bg-[hsl(var(--backgrounds-page-bg))]" />

// ❌ Wildcard barrel re-exports
export * from './hooks';
// ✅ Named selective exports only
```
