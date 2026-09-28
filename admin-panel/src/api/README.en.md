# API

← [Admin Panel](../../README.en.md) · [Assets](../assets/README.en.md)

[Українська](./README.md) | **English**

A single client for server requests — both REST and GraphQL. Every request goes through one `request` function, so the token, headers, token refresh and error handling work the same way for both.

```ts
import { rest, graphql } from '@/api'
```

## Contents

- [Setup](#setup)
- [REST](#rest)
- [GraphQL](#graphql)
- [Errors](#errors)
- [Authentication](#authentication)
- [Request options](#request-options)
- [Adding a new endpoint](#adding-a-new-endpoint)
- [How it works](#how-it-works)
- [Server contract](#server-contract)

---

## Setup

In `.env`:

```bash
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

This is the base URL for all requests. REST paths are appended to it (`/users` → `http://localhost:3000/api/v1/users`), GraphQL goes to `${VITE_API_BASE_URL}/graphql`.

---

## REST

### Methods

| Method        | Signature                                                                    |
| ------------- | ---------------------------------------------------------------------------- |
| `rest.get`    | `rest.get<T>(url, options?)`                                                 |
| `rest.post`   | `rest.post<T>(url, body?, options?)`                                         |
| `rest.put`    | `rest.put<T>(url, body?, options?)`                                          |
| `rest.patch`  | `rest.patch<T>(url, body?, options?)`                                        |
| `rest.delete` | `rest.delete<T>(url, options?)`                                              |
| `rest`        | `rest<T>(url, options?)` — generic call, the method goes in `options.method` |

`T` is the response type. Without it the result is `unknown`, and TS won't suggest any fields.

### URLs come only from `restUrls`

URL strings are never written in components, only in `@/constants/restUrls`:

```ts
// constants/restUrls.ts
const restUrls = {
  USERS: '/users',
  USER: (id: number | string) => `/users/${id}`,
} as const
```

A URL with a parameter is a function: `restUrls.USER(42)` → `/users/42`.

### Examples

The server wraps every response in `{ data }`, so the response type includes the wrapper:

```ts
import { rest } from '@/api'
import restUrls from '@/constants/restUrls'
import type { User } from '@/types/user'

// GET — list
const { data: users } = await rest.get<{ data: User[] }>(restUrls.USERS)

// GET — single record
const { data: user } = await rest.get<{ data: User }>(restUrls.USER(id))

// POST — create
const { data: created } = await rest.post<{ data: User }>(restUrls.USERS, {
  email: 'user@example.com',
  name: 'User',
})

// PATCH — partial update
await rest.patch(restUrls.USER(id), { name: 'New name' })

// DELETE — the server returns 204 with no body
await rest.delete(restUrls.USER(id))
```

### Query parameters

```ts
// GET /users?page=2&search=ann
await rest.get<{ data: User[] }>(restUrls.USERS, {
  query: { page: 2, search: 'ann' },
})
```

### Custom headers

```ts
await rest.get(restUrls.USERS, {
  headers: { 'X-Request-Id': requestId },
})
```

`Authorization` and `Accept-Language` are added automatically (see [How it works](#how-it-works)), there is no need to pass them.

---

## GraphQL

> Stub: there is no GraphQL server yet.

```ts
import { graphql } from '@/api'

interface MeQuery {
  me: User
}

const { me } = await graphql<MeQuery>(`
  query Me {
    me {
      id
    }
  }
`)
```

With variables — the second generic describes their type:

```ts
interface UserQuery {
  user: User
}

interface UserQueryVariables {
  id: string
}

const { user } = await graphql<UserQuery, UserQueryVariables>(
  `
    query User($id: ID!) {
      user(id: $id) {
        id
      }
    }
  `,
  { id },
)
```

- The request is sent as `POST` to `/graphql/<operation name>` (`/graphql/Me`), which makes requests easy to tell apart in the Network tab. An unnamed query goes to `/graphql`.
- `graphql` returns `data` directly, without the wrapper.
- If the response contains `errors`, an `AppError` with `code: GRAPHQL` is thrown (see below).

---

## Errors

Any error from `rest` or `graphql` is **always an `AppError`**. The API never throws any other error type.

```ts
import { AppError } from '@/errors/AppError'
import errorCodes from '@/errors/errorCodes'
```

### Fields

| Field        | Type             | Contains                                                                    |
| ------------ | ---------------- | --------------------------------------------------------------------------- |
| `message`    | `string`         | Error text from the server (`error.message`), otherwise a technical message |
| `code`       | `ErrorCode`      | Error category, see the table below                                         |
| `statusCode` | `number \| null` | HTTP status; `null` if there was no HTTP error                              |
| `details`    | `unknown`        | Details: validation errors from the server or the GraphQL `errors` array    |
| `cause`      | `unknown`        | The original error — for debugging                                          |

### Codes

| `code`         | When                                         | `statusCode`      |
| -------------- | -------------------------------------------- | ----------------- |
| `NETWORK`      | Server unreachable, no network               | `null`            |
| `UNAUTHORIZED` | 401 and the token could not be refreshed     | `401`             |
| `VALIDATION`   | 422 — validation errors                      | `422`             |
| `HTTP`         | Any other HTTP error status (404, 409, 500…) | the status itself |
| `GRAPHQL`      | `errors` in a GraphQL response (HTTP 200)    | `null`            |
| `UNKNOWN`      | Anything else                                | `null`            |

### Examples

```ts
try {
  await rest.post(restUrls.USERS, form)
} catch (error) {
  if (!(error instanceof AppError)) {
    throw error
  }

  switch (error.code) {
    case errorCodes.VALIDATION:
      // error.details — field errors from the server
      setFieldErrors(error.details)
      break
    case errorCodes.NETWORK:
      // message is technical here — show our own text
      showToast(t('errors.network'))
      break
    default:
      showToast(error.message)
  }
}
```

> The server's `message` can be shown to the user. For `NETWORK` and `UNKNOWN` it is a technical message — better show your own text from i18n.

---

## Authentication

### Where tokens are stored

| Token   | Where                                                    | Managed by                   |
| ------- | -------------------------------------------------------- | ---------------------------- |
| Access  | `useAuthStore` store + `localStorage` (one for all tabs) | The store                    |
| Refresh | httpOnly cookie                                          | The server; JS never sees it |

The API reads and writes the access token **only through the store**. Only the store writes to `localStorage`.

### Login

```ts
import { rest } from '@/api'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const { data } = await rest.post<{ data: { accessToken: string } }>(
  restUrls.AUTH_LOGIN,
  { email, password },
  { skipAuthRefresh: true },
)

authStore.setToken(data.accessToken)
```

- The server sets the refresh cookie itself via `Set-Cookie`.
- `skipAuthRefresh: true` is required: a 401 on login means "wrong password", not "token expired", so there is nothing to refresh.
- `restUrls.AUTH_LOGIN` has to be added to `constants/restUrls.ts` once the endpoint exists.

### Logout

```ts
await rest.post(restUrls.AUTH_LOGOUT, undefined, { skipAuthRefresh: true })

authStore.setToken(null)
authStore.setUser(null)
```

Other tabs get `null` automatically through the `storage` event.

### State in components

```ts
const authStore = useAuthStore()

authStore.isAuthed // boolean
authStore.accessToken // string | null
authStore.user // User | null
```

### Token refresh — automatic

Nothing to do. If a request gets a 401:

1. The API refreshes the token via `POST /auth/refresh` (the browser sends the refresh cookie itself).
2. It retries the original request **once** with the new token.
3. If the refresh fails, the token is cleared and the request fails with an `AppError` with `code: UNAUTHORIZED`.

Simultaneous 401s (in several requests or several tabs) result in **one** refresh: the others wait and pick up the new token.

### Restoring the session on start

`restoreSession()` is called once in `main.ts`, before the router is installed:

- a token is in `localStorage` — does nothing;
- no token — tries a refresh via the cookie; if there is no cookie, the user is simply not logged in.

---

## Request options

All [ofetch](https://github.com/unjs/ofetch) options plus one of our own:

| Option            | Type                      | Purpose                                                                |
| ----------------- | ------------------------- | ---------------------------------------------------------------------- |
| `skipAuthRefresh` | `boolean`                 | Do not refresh the token on 401 (login, logout, password confirmation) |
| `query`           | `Record<string, unknown>` | Query parameters                                                       |
| `headers`         | `HeadersInit`             | Extra headers                                                          |
| `signal`          | `AbortSignal`             | Request cancellation                                                   |
| `timeout`         | `number`                  | Timeout in ms                                                          |

### Cancelling a request

```ts
const controller = new AbortController()

rest.get(restUrls.USERS, { signal: controller.signal })

controller.abort()
```

---

## Adding a new endpoint

1. Add the URL to `constants/restUrls.ts`:
   ```ts
   ORDERS: '/orders',
   ORDER: (id: string) => `/orders/${id}`,
   ```
2. Describe the response type (for example, in `types/order.ts`):
   ```ts
   export interface Order {
     id: string
   }
   ```
3. Call it:
   ```ts
   const { data: orders } = await rest.get<{ data: Order[] }>(restUrls.ORDERS)
   ```

---

## How it works

```
rest.get(...)   ─┐
                 ├─► request() ─► apiFetch (ofetch instance) ─► server
graphql(...)    ─┘       │              │
                         │              └─ onRequest: Authorization + Accept-Language
                         │
                         └─ 401 → refreshAccessToken() → retry apiFetch
                         └─ any error → AppError.from(error)
```

- **`apiFetch`** — the base `ofetch.create` instance: `baseURL`, `credentials: 'include'`, `retry: false` and an `onRequest` hook that sets on every request:
  - `Authorization: Bearer <token from the store>`;
  - `Accept-Language: <current i18n locale>`.
- **`request`** — shared error handling for REST and GraphQL: token refresh on 401 and turning any error into an `AppError`.
- **`refreshAccessToken`** — runs under `navigator.locks` (Web Locks API): only one refresh runs at a time across all tabs. The others, after waiting, see the new token in the store and skip the refresh.

---

## Server contract

| Endpoint / format    | Expected                                                                                                        |
| -------------------- | --------------------------------------------------------------------------------------------------------------- |
| Successful response  | `{ data: ... }`                                                                                                 |
| Error                | HTTP status + `{ error: { message, details? } }`                                                                |
| `POST /auth/login`   | `{ data: { accessToken } }` + `Set-Cookie: refreshToken=...; HttpOnly; Secure; SameSite=Lax; Path=/api/v1/auth` |
| `POST /auth/refresh` | Reads the refresh token from the cookie, returns `{ data: { accessToken } }` and a new cookie                   |
| `POST /auth/logout`  | Clears the cookie (`Max-Age=0`)                                                                                 |
| CORS                 | `credentials: true` and a specific `origin` (not `*`)                                                           |

> Locally over `http` the `Secure` cookie flag must be off — otherwise the browser won't store the cookie.
