# Query Key Factory, useQuery with GraphQL, useMutation with Invalidation

## Hook Conventions

Every data hook:
- Exports its own `UseXOptions` and `UseXReturn` interfaces
- Defines a query key factory (`xxxKeys`) at the top, exported
- Uses a standalone `async function` as the `queryFn` (not inline arrow)
- Uses inline GraphQL string constants with raw `fetch('/api/graphql')`

## Full Hook Example

```typescript
'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

// ── Types ──────────────────────────────────────────────
export interface Entity {
  id: string;
  name: string;
  status: string;
}

export type EntityState = 'idle' | 'active' | 'loading' | 'error';

export interface UseEntityOptions {
  entityId: string;
  enabled?: boolean;
}

export interface UseEntityReturn {
  entity: Entity | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  updateEntityInCache: (updates: Partial<Entity>) => void;
}

// ── Query Key Factory ───────────────────────────────────
export const entityKeys = {
  all: ['entities'] as const,
  entity: (entityId: string) => [...entityKeys.all, entityId] as const,
  list: () => [...entityKeys.all, 'list'] as const,
};

// ── GraphQL ─────────────────────────────────────────────
const GET_ENTITY_QUERY = `
  query GetEntity($entityId: ID!) {
    entity(id: $entityId) {
      id
      name
      status
    }
  }
`;

// ── Fetch Function ──────────────────────────────────────
async function fetchEntity(entityId: string): Promise<Entity | null> {
  const response = await fetch('/api/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: GET_ENTITY_QUERY, variables: { entityId } }),
  });

  const result = (await response.json()) as {
    data?: { entity?: Entity };
    errors?: Array<{ message: string }>;
  };

  if (result.errors?.length) throw new Error(result.errors[0].message);
  return result.data?.entity ?? null;
}

// ── Hook ────────────────────────────────────────────────
export function useEntity({ entityId, enabled = true }: UseEntityOptions): UseEntityReturn {
  const queryClient = useQueryClient();
  const queryKey = entityKeys.entity(entityId);

  const query = useQuery({
    queryKey,
    queryFn: () => fetchEntity(entityId),
    enabled: enabled && !!entityId,
    staleTime: Infinity,        // WebSocket keeps data fresh — no background refetch
    gcTime: 5 * 60 * 1000,
  });

  const updateEntityInCache = useCallback(
    (updates: Partial<Entity>) => {
      queryClient.setQueryData<Entity | null>(queryKey, (old) =>
        old ? { ...old, ...updates } : old
      );
    },
    [queryClient, queryKey]
  );

  return {
    entity: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    updateEntityInCache,
  };
}
```

## staleTime Guide

| Data update mechanism | staleTime | Example |
|---|---|---|
| WebSocket subscription | `Infinity` | entity state, entity metadata |
| Infrequent background refresh | `60 * 1000` | settings, members |
| Paginated/filtered list | `30 * 1000` | entity list, items list |
| Auth/permissions | `Infinity` | role, my access |
