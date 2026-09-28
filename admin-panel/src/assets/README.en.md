# Assets

← [Admin Panel](../../README.en.md) · [API](../api/README.en.md)

[Українська](./README.md) | **English**

App styles and static files.

```
assets/
├── images/        # images imported in code
├── main.scss      # theme CSS variables (light / dark) and global styles
└── tailwind.css   # Tailwind setup and mapping of variables to utilities
```

Both style files are imported in `main.ts` in exactly this order:

```ts
import './assets/tailwind.css'
import './assets/main.scss'
```

---

## ⚠️ The main rule

**Every variable added to `main.scss` must be duplicated in `tailwind.css` inside the `@theme inline` block.**

Otherwise Tailwind knows nothing about it and won't generate any classes: `bg-danger` simply won't work, **with no error at all** — neither in the console nor during the build.

### Why

| File           | What it does                                                                                                          |
| -------------- | --------------------------------------------------------------------------------------------------------------------- |
| `main.scss`    | Holds the variable **values** and switches them between themes (`:root` and `[data-theme="dark"]`)                    |
| `tailwind.css` | Tells Tailwind "generate classes for this variable" (`--color-danger` → `bg-danger`, `text-danger`, `border-danger`…) |

`@theme inline` puts a reference to the `main.scss` variable (`var(--danger)`) into the classes, so when the theme changes the classes pick up the new value automatically, and `dark:` is not needed for colors.

---

## Adding a new variable

Example: a `danger` color.

**1. `main.scss`** — a value for **both** themes:

```scss
:root {
  // ...
  --danger: #dc2626;
}

[data-theme='dark'] {
  // ...
  --danger: #f87171;
}
```

**2. `tailwind.css`** — the mapping for Tailwind:

```css
@theme inline {
  /* ... */
  --color-danger: var(--danger);
}
```

**3. Usage:**

```vue
<button class="bg-danger text-primary-foreground">Delete</button>
```

### Checklist

- [ ] The variable is in `:root` in `main.scss`
- [ ] The variable is in `[data-theme="dark"]` in `main.scss`
- [ ] The variable is duplicated in `@theme inline` in `tailwind.css` with the right prefix
- [ ] The class works in both the light **and** the dark theme

---

## Naming

In `main.scss` — a short name **without** a prefix. In `tailwind.css` — the same name **with** a Tailwind namespace prefix.

| `main.scss`           | `tailwind.css`                       | Classes                                                     |
| --------------------- | ------------------------------------ | ----------------------------------------------------------- |
| `--danger`            | `--color-danger: var(--danger)`      | `bg-danger`, `text-danger`, `border-danger`, `ring-danger`… |
| `--card` (radius)     | `--radius-card: var(--card)`         | `rounded-card`                                              |
| `--elevated` (shadow) | `--shadow-elevated: var(--elevated)` | `shadow-elevated`                                           |

The prefix decides which classes Tailwind generates: `--color-*` → colors, `--radius-*` → `rounded-*`, `--shadow-*` → `shadow-*`, `--font-*` → `font-*`.

> Don't give the `main.scss` variable the same name as in `@theme` (e.g. `--color-danger` in both files). Tailwind would then generate `--color-danger: var(--color-danger)` — a variable referring to itself. Right now this happens to work: `main.scss` is not in any `@layer`, so it beats Tailwind's line in `@layer theme`. But if `main.scss` is ever wrapped in a `@layer`, the colors will silently break.

---

## Current variables

| Variable               | Tailwind                     | Used for                 |
| ---------------------- | ---------------------------- | ------------------------ |
| `--background`         | `bg-background`              | Page background          |
| `--foreground`         | `text-foreground`            | Main text                |
| `--surface`            | `bg-surface`                 | Cards, panels background |
| `--surface-foreground` | `text-surface-foreground`    | Text on `surface`        |
| `--border`             | `border-border`              | Borders                  |
| `--muted`              | `text-muted`                 | Secondary text           |
| `--primary`            | `bg-primary`, `text-primary` | Main accent color        |
| `--primary-foreground` | `text-primary-foreground`    | Text on `primary`        |

---

## Themes

The dark theme is enabled with an attribute on `<html>`:

```ts
document.documentElement.dataset.theme = 'dark' // dark
delete document.documentElement.dataset.theme // light
```

Colors from the table above switch on their own — no separate classes are needed for the dark theme.

---

## `images/`

Images used in code are imported — then Vite adds a hash to the file name and caches it correctly:

```vue
<script setup lang="ts">
import logoUrl from '@/assets/images/logo.svg'
</script>

<template>
  <img :src="logoUrl" alt="Logo" />
</template>
```

Files that must be available at a fixed URL (`favicon.ico`, `robots.txt`) go into `public/`, not here.
