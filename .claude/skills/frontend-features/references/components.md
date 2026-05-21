# Component Conventions — Pure/Declarative Pattern

## Core Rule

Components are pure/declarative — all logic lives in hooks. Components receive data as props; they never fetch, mutate, or manage async state internally.

## Correct Pattern

```typescript
// ✅ Component receives data as props
export function EntityHeader({
  entityName,
  entityState,
  onClick,
  className,
}: EntityHeaderProps) {
  return (
    <div className={cn('flex items-center gap-2 bg-[hsl(var(--backgrounds-page-bg))]', className)}>
      <span className="text-sm font-medium">{entityName}</span>
    </div>
  );
}
```

## Anti-Pattern

```typescript
// ❌ Don't fetch data inside components
export function EntityHeader({ entityId }: { entityId: string }) {
  const { data } = useQuery({ queryKey: ['entity', entityId], queryFn: fetchEntity });
  // ↑ move this to a dedicated hook in the feature's hooks/ folder
}
```

## Conventions

- Props interfaces go in `types.ts` at the feature root or next to the component file.
- Use `className` prop + `cn()` for consumer-controlled overrides.
- Never add business logic, side effects, or data fetching inside a component body — extract to a hook.
- Use Radix UI primitives via the `src/components/ui/` wrappers — never import `@radix-ui/*` directly in feature components.

```typescript
// ✅
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

// ❌
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
```
