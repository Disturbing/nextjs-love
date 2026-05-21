# Styling — cn(), CVA Variants, CSS Custom Properties, Tailwind

## cn() — Conditional Classes

`cn()` combines `clsx` + `tailwind-merge`. Use it for any conditional or merged class logic.

```typescript
import { cn } from '@/lib/utils';

<div className={cn(
  'flex flex-col w-full bg-[hsl(var(--backgrounds-page-bg))]',
  isActive && 'border border-[hsl(var(--primary-base))]',
  className
)} />
```

## CSS Custom Properties (Design Tokens)

Always use CSS variables for colors — never hardcode hex values.

```
--primary-base          --tertiary-base
--neutral-white-20      --neutral-white-60
--backgrounds-page-bg   --backgrounds-card-bg
--text-primary          --text-secondary
```

Usage in Tailwind: `bg-[hsl(var(--primary-base))]`, `text-[hsl(var(--neutral-white-60))]`

## CVA — Variant-Driven Components

Use `class-variance-authority` for components with multiple style variants (the shadcn/ui pattern).

```typescript
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  // Base classes applied to every variant
  "inline-flex items-center justify-center font-bold transition-colors",
  {
    variants: {
      variant: {
        primary: "bg-primary-gradient text-white rounded-[8px]",
        secondary: "bg-transparent border border-[hsl(var(--neutral-white-20))]",
        tertiary: "bg-transparent text-[hsl(var(--text-primary))]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ variant, size, className, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
```

## Rules

- Never hardcode hex colors — use CSS custom properties.
- Always pass `className` through with `cn()` so consumers can extend styles.
- Radix UI primitives are consumed only via `src/components/ui/` wrappers in feature components.
- CVA is the pattern for any component with 2+ style variants — avoids prop-drilling class strings.
