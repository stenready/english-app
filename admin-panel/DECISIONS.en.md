# Architecture decisions

← [Admin Panel](./README.en.md)

[Українська](./DECISIONS.md) | **English**

Why the project is built this way. Each decision: **what** was decided, **why**, and **the cost** — every decision is a trade-off.

## Contents

- [API](#api)
- [Authentication](#authentication)
- [Errors](#errors)
- [Routing and layouts](#routing-and-layouts)
- [Components](#components)
- [TypeScript](#typescript)
- [Localization](#localization)

---

## API

### The API client is a plain module, not a Vue plugin

- **Why:** an HTTP client needs neither reactivity nor the app instance. A module can be imported anywhere — in a store, a guard, a helper, tests. A plugin is only available through `inject()` inside components.
- **Cost:** none. A plugin makes sense when code really plugs into Vue (global components, directives) — not the case here.

### The whole API is one file, `api/index.ts`

- **Why:** it's one service with one responsibility — request transport and authentication. It exposes only `rest`, `graphql`, `restoreSession`.
- **Cost:** ~180 lines in one file. We'll split it when there's a reason (e.g. GraphQL grows a lot).

### One base `ofetch` instance + a `request` function

- **Why:** the instance (`ofetch.create`) sets `baseURL` and, in `onRequest`, the token and `Accept-Language`. `request` is shared error handling for REST and GraphQL: token refresh on 401 and turning errors into `AppError`.
- **Why the refresh isn't in the `onResponseError` hook:** a hook can run code on error but can't return the result of a retried request instead of the error.
- **Cost:** the retry is written by hand — a few lines.

### The API never redirects

- **Why:** the API layer shouldn't know about the router. Otherwise it can't be used without the router, and circular imports become a risk (`router` → page → store → `api` → `router`).
- **Cost:** reacting to a lost session (redirect to login) is done separately — a watcher on `isAuthed` in `App.vue`.

---

## Authentication

### The refresh token lives in an httpOnly cookie

- **Why:** JS can't see it, so it can't be stolen via XSS. The browser sends the cookie only to `/api/v1/auth/*` (`Path`).
- **Cost:** needs `credentials: 'include'`, and CORS with `credentials: true` and a specific `origin` on the server.

### The access token lives in `localStorage`, one for all tabs

- **Why:** at first it was kept in memory only — safer, but then every page reload needs a refresh, and several tabs refresh at the same time with the same cookie. With strict refresh token rotation the server treats that as token reuse and logs the user out. `localStorage` is shared between tabs — one token, no request on reload.
- **Cost:** the access token is readable by a script under XSS. So it must be short-lived (5–15 min); the refresh token stays out of reach.

### Refresh across tabs — via `navigator.locks`

- **Why:** when the token expires, all open tabs get a 401 at once. The Web Locks API guarantees that only one tab refreshes; the others wait, see the new token in the store, and skip the refresh. Tested in Chromium with three tabs and strict rotation — always exactly one refresh.
- **Cost:** browser-only, on HTTPS or `localhost`; Safari 15.4+.

### The store owns the token, the API works only through the store

- **Why:** a single source of truth. The store initializes the token from `localStorage`, `setToken` writes to both the store and `localStorage`. The `storage` event updates the store in other tabs. The API knows nothing about `localStorage`.
- **Cost:** the API depends on Pinia — it must be installed before the first request (it is, in `main.ts`).

### `skipAuthRefresh` for login and logout

- **Why:** a 401 on login means "wrong password", not "expired token". Without the flag the API would try to refresh the token and retry the login with the same password.
- **Cost:** the flag must not be forgotten.

---

## Errors

### One error type for the whole app — `AppError`

- **Why:** the API produces different errors: HTTP (`FetchError`), network, GraphQL (`errors` with HTTP 200), unexpected ones. The frontend gets them in one shape: `message`, `code`, `statusCode`, `details`. The shape matches the server's errors (`{ error: { message, details } }`).
- **`code` next to `statusCode`:** a network error, a GraphQL error and a client error all have the same `statusCode` — `null`. `code` (`NETWORK`, `GRAPHQL`…) tells them apart.
- **`AppError.from()` vs `new AppError()`:** `from` — when an error already exists and needs to be converted; `new` — when there was no error (GraphQL answered 200 but with `errors`).
- **Cost:** the original error is hidden in `cause` — look there when debugging.

---

## Routing and layouts

### Layout via `meta.layout`, not nested routes

- **Why:** the layout is chosen per route, independently of the section, and sections are already split into `public` / `secure`. Nested routes would group by layout and clash with that split.
- **Cost:** a layout map in `App.vue`. `Record<LayoutName, Component>` won't let you forget to register a new layout.

### The app mounts after `router.isReady()`

- **Why:** before the first navigation `route.meta` is empty — the default layout would flash for a moment.
- **Cost:** none.

---

## Components

### A page is `index.vue` in a `-page` folder + `defineOptions({ name })`

- **Why:** the folder is the page's module, its files can live next to it. Vue takes the component name from the file name — for `index.vue` every page would be `index`, so the name is set explicitly.
- **`PAGE_NAME` / `COMPONENT_NAME` + `data-*-name`:** one constant for Devtools and the DOM — the name can't drift.
- **Cost:** two lines in every page and component.

---

## TypeScript

### Constants — `as const` + a derived type

```ts
const layoutNames = { AUTH: 'auth', DASHBOARD: 'dashboard' } as const
export type LayoutName = (typeof layoutNames)[keyof typeof layoutNames]
```

- **Why:** one place for the values and the type. A typo (`'dashbord'`) is a type error, not a runtime bug.
- **Cost:** the type syntax looks unusual at first.

### Typed `route.meta` via `declare module 'vue-router'`

- **Why:** `layout`, `permissions`, `isPrivate` are checked in every route. An unknown permission is a type error.
- **Cost:** none.

### Three `tsconfig` files

- **Why:** app code (browser: `DOM`) and configs (`vite.config.ts` etc.: Node) are different environments. With one config, Node types would leak into app code (`process`, `Buffer` with no errors, `setTimeout` returning `NodeJS.Timeout`). The root `tsconfig.json` only references both — that's what the IDE looks for.
- **Cost:** three files instead of one.

---

## Localization

### Flat keys only, `en.json` is the reference

- **Why:** a key is found in the code with a single-line text search (`users.list.title`). The message type is derived from `en.json` — if another language is missing a key, `typecheck` fails.
- **Cost:** long keys with repeated prefixes.

### `Accept-Language` from the current i18n locale

- **Why:** the server gets the user's language with every request and can return error texts in it.
- **Cost:** none.
