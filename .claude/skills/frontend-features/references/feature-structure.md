# Feature Folder Layout, Barrel Exports, and File Naming

## Folder Layout

```
src/features/<name>/
  index.ts              # Root barrel — curated selective re-exports
  types.ts              # Root-level types
  types/                # Type sub-modules if needed
  hooks/
    index.ts            # Hooks barrel
    useFeatureData.ts   # One hook per concern
    useFeatureMutation.ts
  components/
    index.ts            # Components barrel
    FeatureView.tsx
    FeatureHeader.tsx
  utils/
    index.ts
    feature-utils.ts
  lib/                  # Non-hook helpers (URL builders, mappers, etc.)
```

Global/cross-feature hooks live in `src/hooks/` — feature-scoped hooks live inside the feature.

## Barrel Export Pattern

Three-layer barrel: components and hooks each have their own `index.ts`, the feature root re-exports from both with selective, named exports.

```typescript
// src/features/my-feature/index.ts
export {
  useEntity,
  entityKeys,
  useEntityList,
  entityListKeys,
} from './hooks';

export type {
  Entity,
  EntityState,
  UseEntityOptions,
} from './hooks';

export {
  EntityView,
  EntityHeader,
} from './components';
```

Avoid wildcard re-exports (`export * from`) to prevent name collisions.

## File Naming Conventions

- Hooks: `useFeatureName.ts` (camelCase, `use` prefix)
- Components: `FeatureName.tsx` (PascalCase)
- Utils: `feature-name-utils.ts` (kebab-case)
- Types: `types.ts` at feature root, or `types/entity-types.ts` for sub-modules
- Barrel: always `index.ts`
