# WebSocket → setQueryData Cache Update Pattern

Patch cache directly with `setQueryData` on WebSocket events. Use `invalidateQueries` only on reconnect or after mutations — never for real-time streaming updates.

## Pattern

```typescript
useEffect(() => {
  if (!webSocket?.subscribe) return;

  const unsub = webSocket.subscribe<EntityUpdateEvent>('entity_update', (event) => {
    queryClient.setQueryData<Entity | null>(queryKey, (old) => {
      if (!old) return old;
      const updates: Partial<Entity> = {};
      if (event.status) updates.status = event.status;
      if (event.name) updates.name = event.name;
      return Object.keys(updates).length > 0 ? { ...old, ...updates } : old;
    });
  });

  return unsub;
}, [webSocket, queryClient, queryKey]);
```

## Rules

- Always return `old` unchanged when there are no relevant fields — avoids unnecessary re-renders.
- Use `staleTime: Infinity` on queries driven by WebSocket so React Query never refetches in the background.
- Use `invalidateQueries` only on reconnect (to recover missed events) or immediately after mutations.
- Do not call `refetch()` inside WebSocket event handlers — this causes unnecessary network requests.
