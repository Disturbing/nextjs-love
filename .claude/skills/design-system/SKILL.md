---
name: design-system
description: Defines forward-looking design system standards for `packages/website` using shadcn and Tailwind v4 with CSS variables in `src/app/globals.css`. Use when adding or updating frontend styling tokens, theme overrides, typography, spacing, or component surfaces.
---

# Design System

## Purpose

Use this skill for frontend styling work in `packages/website` and app templates that should follow the same token contract, including `packages/playground/template/packages/webapp-nextjs-template`.

This codifies the existing shadcn-compatible foundation:
- `:root` defines the base token contract.
- `.dark`, `.light`, and future `.theme-*` override values using the same token names.
- `@theme` bridges tokens into Tailwind.
- Components consume tokens through classes (`hsl(var(--token))`), `cn()`, and CVA.

This is forward-looking guidance. Do not retrofit unrelated legacy code unless the user asks.

## Non-Negotiable Rules

- No hardcoded color literals in frontend changes (`#hex`, `rgb()`, `rgba()`, raw `hsl(...)`).
- No inline styles for colors or spacing in frontend changes.
- Use semantic CSS variables from the app's main `globals.css`. In `packages/website`, that source is `packages/website/src/app/globals.css`.
- If a visual value is missing, add a token first, then consume the token.

## Token Foundation (Required Split)

### Theme-invariant tokens

Define once in `:root`. Do not override per theme:
- spacing scale (`--spacing-*`)
- typography scale and roles (`--text-*`, base line-height, font roles)
- radius scale (`--radius*`)
- breakpoints (`--breakpoint-*`)
- animation timing/keyframes (`--animate-*`)

### Themeable tokens

Define defaults in `:root`, then override in `.dark` / `.light` / `.theme-*`:
- semantic colors (`--primary-*`, `--background-*`, `--text-*`, etc.)
- gradients
- shadows/glows
- component surfaces (button, dropdown, input, card, popover, combobox, etc.)

## Theme Extension Pattern

Use one token contract across themes. Only values change.

```css
:root {
  --background: 0 0% 100%;
  --button-surface: 220 14% 96%;
  --combobox-surface: 220 14% 96%;
}

.dark {
  --background: 225 14% 9%;
  --button-surface: 264 85% 70%;
  --combobox-surface: 225 10% 21%;
}

.theme-ocean {
  --background: 212 70% 10%;
  --button-surface: 198 90% 55%;
  --combobox-surface: 210 35% 18%;
}
```

Rules:
- keep semantic token names stable across themes
- never create parallel naming forks like `--dark-*` and `--light-*`
- component surfaces can differ (for example, combobox vs button) if semantics differ

## Template Pattern

For `packages/playground/template/packages/webapp-nextjs-template`, keep the token contract identical to the website pattern even though the file is smaller:

- Store bare H S% L% channels in `:root`: `--background: 240 10% 4%;`
- Bridge tokens into Tailwind with `@theme`, not `@theme inline`
- Map theme colors with `hsl(var(--token))`: `--color-background: hsl(var(--background));`
- Consume tokens in CSS properties with `hsl(var(--token))`
- Keep the template's App Router surfaces and `globals.css` aligned on the same token contract

Example:

```css
:root {
  --background: 240 10% 4%;
  --foreground: 200 10% 95%;
}

@theme {
  --color-background: hsl(var(--background));
  --color-foreground: hsl(var(--foreground));
}

@layer base {
  body {
    background-color: hsl(var(--background));
    color: hsl(var(--foreground));
  }
}
```

## Implementation Workflow

Use this checklist whenever you add styling primitives:

1. Classify the token: theme-invariant or themeable.
2. Add/adjust token definitions in `packages/website/src/app/globals.css`.
3. For themeable tokens, add defaults in `:root` and overrides in theme blocks.
4. Bridge token usage through `@theme`/utilities when needed.
5. Consume token in components with Tailwind + `hsl(var(--token))`.
6. Use CVA for components with 2+ style variants.
7. Validate changed lines contain no hardcoded colors, no inline style color/spacing.

## Typography Standards

- Use the established token hierarchy (display/title/headings/body/label/caption).
- Prefer semantic typography utilities over ad-hoc numeric text classes.
- Avoid one-off `font-size`, `line-height`, and weight literals in components.
- If a new text role is needed, define a token role first.

## Spacing Standards

- Use shared spacing tokens from `globals.css` (`--spacing-xs` through `--spacing-4xl` and component aliases).
- Prefer Tailwind spacing utilities backed by system values.
- No ad-hoc inline spacing declarations in JSX.
- If a repeated spacing need is missing, add a new token and alias intentionally.

## Component Surface Standards

Different components can have different token families when needed:
- button surfaces
- dropdown/combobox surfaces
- input surfaces
- card/popover/sheet surfaces

Only split token families when behavior or contrast requirements are different. Reuse shared tokens when visuals are intentionally the same.

## Preferred Consumption Patterns

- Tailwind class with token: `bg-[hsl(var(--token-name))]`
- Raw CSS property with token: `padding: var(--spacing-md);`
- Conditional classes via `cn()`
- Variant composition via CVA

## Anti-Patterns

- `bg-[#323546]`, `text-[rgb(255,255,255)]`, `border-[hsl(220 10% 20%)]`
- `style={{ backgroundColor: '#323546', padding: '12px' }}`
- New `!important` except tightly-scoped third-party overrides
- Touching unrelated legacy files to force broad refactors
