# Optimistic Mutations — onMutate / onError / onSuccess / onSettled

Full pattern: cancel in-flight queries → snapshot → optimistically update → rollback on error → invalidate on settled.

```typescript
const deleteItem = useMutation({
  mutationFn: (itemId: string) => deleteItemMutation(entityId, itemId),

  onMutate: async (itemId) => {
    // Cancel any outgoing refetches to avoid overwriting optimistic update
    await queryClient.cancelQueries({ queryKey });

    // Snapshot the previous value for rollback
    const previous = queryClient.getQueryData<Item[]>(queryKey);

    // Optimistically update the cache
    queryClient.setQueryData<Item[]>(queryKey, (old) =>
      (old ?? []).filter((t) => t.id !== itemId)
    );

    return { previous };
  },

  onError: (_err, _itemId, context) => {
    // Roll back to the snapshot on failure
    if (context?.previous) {
      queryClient.setQueryData(queryKey, context.previous);
    }
  },

  onSettled: () => {
    // Always invalidate after mutation (success or error) to sync with server
    queryClient.invalidateQueries({ queryKey });
  },
});
```

## Notes

- `onMutate` must be `async` — you need to `await cancelQueries` before setting optimistic data.
- Return `{ previous }` from `onMutate` so `onError` receives it via `context`.
- `onSettled` runs after both success and error — put `invalidateQueries` there, not in `onSuccess`.
- For add/update mutations, apply the same pattern but set the new item in the optimistic update instead of filtering.
