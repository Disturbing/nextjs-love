---
name: tanstack-query
description: |
  Data fetching and server state management with TanStack Query v5 in React.
  QueryClient setup, useQuery, useMutation, cache invalidation, optimistic updates,
  and real-time cache patching via setQueryData.
  Keywords: useQuery, useMutation, useQueryClient, QueryClient, QueryClientProvider,
  invalidateQueries, setQueryData, queryKey, staleTime, enabled, onMutate, onSettled
---

# TanStack Query v5 — React

## NEVER Do These

### ❌ Never create a `tanstack-query.d.ts` shim

If TypeScript can't resolve `@tanstack/react-query` types, the fix is to install the package or run `pnpm install` — never create a `declare module '@tanstack/react-query' { ... }` override. The shim will conflict with the real types and cause incompatible type errors.

### ❌ Never leave `fetch().then(r => r.json())` untyped in strict mode

`Response.json()` returns `Promise<any>`, but react-query v5 strict inference may not widen `TData` correctly. Always provide explicit generics when the `mutationFn` or `queryFn` returns an untyped JSON response:

```ts
// WRONG — TData inferred as unknown, onSuccess type mismatch
useMutation({
  mutationFn: (data) => fetch('/api/projects', { ... }).then(r => r.json()),
  onSuccess: (project: Project) => { ... },
});

// CORRECT — explicit <TData, TError, TVariables>
useMutation<Project, Error, { name: string; color: string }>({
  mutationFn: (data) => fetch('/api/projects', { ... }).then(r => r.json()),
  onSuccess: (project) => { ... },  // project is Project ✓
});
```

```ts
// WRONG — data is unknown
const { data: searchResults } = useQuery({
  queryKey: ['search', q],
  queryFn: () => fetch(`/api/search?q=${q}`).then(r => r.json()),
});

// CORRECT
const { data: searchResults } = useQuery<{ tasks: Task[]; projects: Project[] }>({
  queryKey: ['search', q],
  queryFn: () => fetch(`/api/search?q=${q}`).then(r => r.json()),
});
```

---

## CRITICAL: QueryClient Setup

### Next.js App Router (default)

Create a `Providers` client component that wraps children with `QueryClientProvider`.
Import it in `src/app/layout.tsx`.

```tsx
// src/components/providers.tsx
'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

```tsx
// src/app/layout.tsx
import { Providers } from '@/components/providers';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

Use `useState` to create the client so each SSR request gets a fresh instance — do not use a module-level singleton.

### React Router / SPA (non-Next.js)

```tsx
// src/react-app/app.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
```

## Imports

Everything comes from `@tanstack/react-query`:

```typescript
import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
```

## Query Key Factory

Define a `xxxKeys` object per feature for type-safe, consistent cache addressing:

```typescript
export const todoKeys = {
  all: ['todos'] as const,
  list: () => [...todoKeys.all, 'list'] as const,
  detail: (id: string) => [...todoKeys.all, id] as const,
};

// Common patterns
['todos']                          // all todos
['todos', 'list']                  // todo list
['todos', todoId]                  // single todo
['todos', { status: 'open' }]     // filtered list
```

## useQuery

Use a standalone `async function` as `queryFn` — not an inline arrow:

```typescript
async function fetchTodos(): Promise<Todo[]> {
  const response = await fetch('/api/todos');
  if (!response.ok) throw new Error('Failed to fetch todos');
  return response.json();
}

function useTodos() {
  return useQuery({
    queryKey: todoKeys.list(),
    queryFn: fetchTodos,
    staleTime: 30 * 1000,
  });
}

// With params and conditional enable
async function fetchTodo(id: string): Promise<Todo> {
  const response = await fetch(`/api/todos/${id}`);
  if (!response.ok) throw new Error('Failed to fetch todo');
  return response.json();
}

function useTodo(id: string | undefined) {
  return useQuery({
    queryKey: todoKeys.detail(id!),
    queryFn: () => fetchTodo(id!),
    enabled: !!id,
  });
}
```

## useMutation

```typescript
async function createTodo(data: CreateTodoInput): Promise<Todo> {
  const response = await fetch('/api/todos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create todo');
  return response.json();
}

function useCreateTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: todoKeys.list() });
    },
  });
}

// Usage in component
function TodoForm() {
  const { mutate, isPending } = useCreateTodo();

  return (
    <button
      onClick={() => mutate({ title: 'New todo' })}
      disabled={isPending}
    >
      {isPending ? 'Adding...' : 'Add Todo'}
    </button>
  );
}
```

## Optimistic Updates

Full pattern: cancel → snapshot → optimistic update → rollback on error → invalidate on settled:

```typescript
function useDeleteTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/todos/${id}`, { method: 'DELETE' }).then(r => {
        if (!r.ok) throw new Error('Failed to delete');
      }),

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: todoKeys.list() });
      const previous = queryClient.getQueryData<Todo[]>(todoKeys.list());
      queryClient.setQueryData<Todo[]>(todoKeys.list(), old =>
        (old ?? []).filter(t => t.id !== id)
      );
      return { previous };
    },

    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(todoKeys.list(), context.previous);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: todoKeys.list() });
    },
  });
}
```

## Cache Patching (Real-Time / WebSocket)

Patch the cache directly with `setQueryData` on WebSocket events — do NOT use `invalidateQueries` for streaming updates:

```typescript
// In a hook that subscribes to WebSocket events
useEffect(() => {
  const unsub = ws.subscribe('todo_updated', (event: TodoUpdatedEvent) => {
    queryClient.setQueryData<Todo[]>(todoKeys.list(), old =>
      (old ?? []).map(t => t.id === event.id ? { ...t, ...event.changes } : t)
    );
  });
  return unsub;
}, [queryClient]);
```

## staleTime Guide

| Data update mechanism | staleTime | Example |
|---|---|---|
| WebSocket / real-time | `Infinity` | entity state, live data |
| Infrequent background | `60 * 1000` | settings, user profile |
| Paginated / filtered | `30 * 1000` | list views |
| Auth / permissions | `Infinity` | session, roles |

## Component Usage

```typescript
function TodoList() {
  const { data: todos, isLoading, error } = useTodos();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {todos?.map(todo => <TodoItem key={todo.id} todo={todo} />)}
    </ul>
  );
}
```

## References

- [`references/hooks.md`](references/hooks.md) — full hook pattern with types, query key factory, GraphQL fetch
- [`references/optimistic-mutations.md`](references/optimistic-mutations.md) — full onMutate/onError/onSettled pattern
- [`references/realtime.md`](references/realtime.md) — WebSocket → setQueryData cache update pattern
