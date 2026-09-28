# Admin Panel

← [Full-stack App](../README.en.md)

[Українська](./README.md) | **English**

Admin panel for an English-learning app.

**Stack:** Vue 3 · TypeScript · Vite · Pinia · Vue Router · vue-i18n · Tailwind CSS 4 · ofetch

## Contents

- [Quick start](#quick-start)
- [Scripts](#scripts)
- [Structure](#structure)
- [Module docs](#module-docs)
- [Architecture decisions](./DECISIONS.en.md)
- [Rules](#rules)

---

## Quick start

```bash
npm install
cp .env.example .env
npm run dev
```

Requires a running `server-app` — the API URL is set in `.env` (`VITE_API_BASE_URL`).

## Scripts

| Script                            | What it does                  |
| --------------------------------- | ----------------------------- |
| `npm run dev`                     | Dev server                    |
| `npm run build`                   | Type check + production build |
| `npm run preview`                 | Preview the production build  |
| `npm run typecheck`               | Type check (`vue-tsc`)        |
| `npm run lint` / `lint:fix`       | ESLint                        |
| `npm run format` / `format:check` | Prettier                      |

## Structure

```
src/
├── api/            # REST + GraphQL client → see api/README.en.md
├── assets/         # styles, themes, images → see assets/README.en.md
├── components/
│   ├── app/        # UI kit: AppButton, AppInput…
│   ├── the/        # single-instance components: TheLocaleSwitcher…
│   └── svg/        # icons
├── constants/      # constants: routeNames, layoutNames, restUrls, permissions…
├── errors/         # AppError and error codes
├── helpers/        # pure functions without reactivity
├── layouts/        # AuthLayout, DashboardLayout
├── locales/        # translations: uk, en, ru
├── plugins/        # i18n
├── router/         # router: routes/public, routes/secure
├── stores/         # Pinia stores
├── types/          # domain types and library type extensions
├── use/            # composables (useX)
└── views/          # sections with pages
```

## Module docs

| Module                                  | What it covers                                                                           |
| --------------------------------------- | ---------------------------------------------------------------------------------------- |
| [**API**](./src/api/README.en.md)       | `rest` / `graphql`, `AppError` errors, authentication and token refresh, server contract |
| [**Assets**](./src/assets/README.en.md) | CSS variables, Tailwind mapping, themes, images                                          |

Why the project is built this way — [**Architecture decisions**](./DECISIONS.en.md).

---

## Rules

### 0. Necessity and common sense

We write only what is needed now. No abstractions "for the future", no configurability nobody asked for. The rules below are not a goal in themselves: if a rule makes the code worse in a specific place, that's a reason to discuss the rule.

### 1. TypeScript only

- `<script setup lang="ts">` in every `.vue` file.
- `any` is forbidden. For unknown data — `unknown` + type narrowing.
- Block order in `.vue`: `<script>` → `<template>` → `<style>`.

### 2. Sections and pages

The code is split into sections (`home`, `users`…). Each page is a separate folder with the **`-page`** suffix and an `index.vue` file:

```
views/
└── users/
    ├── _components/        # components needed only by this section
    ├── list-page/
    │   └── index.vue
    └── single-page/
        └── index.vue
```

- `_components/` — private components of the section. If a component is needed in a **second** section, it moves to `components/app/`.
- Private components are imported with a relative path: `../_components/UserCard.vue`.

### 3. Page and component names

Every page and component has a name — to find your way in the code and in Vue Devtools.

**Page:**

```vue
<script setup lang="ts">
const PAGE_NAME = 'UsersListPage'

defineOptions({ name: PAGE_NAME })
</script>

<template>
  <main :data-page-name="PAGE_NAME">...</main>
</template>
```

**Component:**

```vue
<script setup lang="ts">
const COMPONENT_NAME = 'UserCard'

defineOptions({ name: COMPONENT_NAME })
</script>

<template>
  <div :data-component-name="COMPONENT_NAME">...</div>
</template>
```

|           | Constant         | Attribute             | Name format                                            |
| --------- | ---------------- | --------------------- | ------------------------------------------------------ |
| Page      | `PAGE_NAME`      | `data-page-name`      | `<Section><Page>Page`: `UsersListPage`, `HomeMainPage` |
| Component | `COMPONENT_NAME` | `data-component-name` | Same as the file name: `UserCard`                      |

### 4. Routes and navigation

- Every route has a `name` from `constants/routeNames.ts`.
- Every route has `meta`:
  ```ts
  meta: {
    layout: layoutNames.DASHBOARD,
    permissions: [permissions.READ_USERS_PAGE],
    isPrivate: true,
  }
  ```
- Public routes go in `router/routes/public`, private ones in `router/routes/secure`.
- **Navigation — only by route name and only through our `useAppRouter` abstraction** (coming in `use/`). We don't use string paths (`router.push('/users')`) or `useRouter` from `vue-router` directly.

### 5. UI — only through abstractions

Native form elements (`<button>`, `<input>`, `<select>`, `<textarea>`, `<form>`…) are used **only inside `components/app/`**. Everywhere else — UI kit components: `AppButton`, `AppInput`… This way the UI can be replaced in one place.

| Folder            | Contents                   | Rules                                             |
| ----------------- | -------------------------- | ------------------------------------------------- |
| `components/app/` | UI kit                     | `App` prefix. Props / emits only, no store or API |
| `components/the/` | Single-instance components | `The` prefix                                      |
| `components/svg/` | Icons                      | —                                                 |

### 6. No magic numbers or strings

Meaningful values go into constants:

```ts
// ❌
if (user.role === 'admin') { ... }
setTimeout(refresh, 300000)

// ✅
if (user.role === userRoles.ADMIN) { ... }
setTimeout(refresh, REFRESH_INTERVAL_MS)
```

- Shared constants live in `constants/` as `as const` + a derived type:
  ```ts
  const layoutNames = { AUTH: 'auth', DASHBOARD: 'dashboard' } as const
  export type LayoutName = (typeof layoutNames)[keyof typeof layoutNames]
  ```
- A constant needed by one file — `UPPER_SNAKE_CASE` at the top of that file.
- **Not magic:** `0`, `1`, `-1`, `''`, Tailwind classes.

### 7. API

- Requests — only through `rest` / `graphql` from `@/api`. Never call `ofetch` / `fetch` directly.
- URLs — only from `constants/restUrls.ts`.
- Errors are always `AppError`, handled by `code`, not by the message text.

Details: [api/README.en.md](./src/api/README.en.md).

### 8. Authentication

The access token — only through `useAuthStore` (`setToken`, `accessToken`, `isAuthed`). Never touch `localStorage` directly — only the store writes there.

### 9. Localization

- No text in templates — only `t('key')`.
- **Keys are flat only, nesting is forbidden:**
  ```json
  // ✅
  { "users.list.title": "Users" }

  // ❌
  { "users": { "list": { "title": "Users" } } }
  ```
- Key format: `section.key` or `section.subsection.key`, each part in camelCase (`notFound.backHome`).
- The reference set of keys is `en.json`: if another language is missing a key, `typecheck` fails.
- The default language is `uk`.

### 10. Styles

- Tailwind classes. No hex colors in components — only classes based on theme variables (`bg-primary`, `text-muted`).
- A new variable in `main.scss` **must** be duplicated in `@theme` in `tailwind.css`.

Details: [assets/README.en.md](./src/assets/README.en.md).

### 11. Composables and helpers

| Folder     | Contents                                                        |
| ---------- | --------------------------------------------------------------- |
| `use/`     | `useX` composables — with reactivity (`ref`, `computed`, hooks) |
| `helpers/` | Pure functions without reactivity                               |

### 12. Environment variables

- Only with the `VITE_` prefix — otherwise Vite won't expose them to the code.
- Every new variable: a type in `types/env.d.ts` + an example in `.env.example`.

### 13. Commits

The only allowed format:

```
feat(admin-panel): short description
fix(admin-panel): short description
```

Before committing:

```bash
npm run typecheck && npm run lint && npm run format:check
```

### 14. Documentation

- Module READMEs are in two languages: `README.md` (Ukrainian, primary) and `README.en.md`.
- Changed one — update the other.
