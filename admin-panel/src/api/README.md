# API

← [Admin Panel](../../README.md) · [Assets](../assets/README.md)

**Українська** | [English](./README.en.md)

Єдиний клієнт для запитів до сервера — і REST, і GraphQL. Усі запити проходять через одну функцію `request`, тому токен, заголовки, оновлення токена та обробка помилок працюють однаково для обох.

```ts
import { rest, graphql } from '@/api'
```

## Зміст

- [Налаштування](#налаштування)
- [REST](#rest)
- [GraphQL](#graphql)
- [Помилки](#помилки)
- [Авторизація](#авторизація)
- [Опції запиту](#опції-запиту)
- [Як додати новий ендпоінт](#як-додати-новий-ендпоінт)
- [Як це працює](#як-це-працює)
- [Що очікується від сервера](#що-очікується-від-сервера)

---

## Налаштування

У `.env`:

```bash
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

Це базова адреса для всіх запитів. REST-шляхи додаються до неї (`/users` → `http://localhost:3000/api/v1/users`), GraphQL іде на `${VITE_API_BASE_URL}/graphql`.

---

## REST

### Методи

| Метод         | Сигнатура                                                                             |
| ------------- | ------------------------------------------------------------------------------------- |
| `rest.get`    | `rest.get<T>(url, options?)`                                                          |
| `rest.post`   | `rest.post<T>(url, body?, options?)`                                                  |
| `rest.put`    | `rest.put<T>(url, body?, options?)`                                                   |
| `rest.patch`  | `rest.patch<T>(url, body?, options?)`                                                 |
| `rest.delete` | `rest.delete<T>(url, options?)`                                                       |
| `rest`        | `rest<T>(url, options?)` — універсальний виклик, метод передається в `options.method` |

`T` — тип відповіді. Без нього результат матиме тип `unknown`, і TS не підкаже поля.

### Адреси — тільки з `restUrls`

Рядки з адресами не пишемо в компонентах, лише в `@/constants/restUrls`:

```ts
// constants/restUrls.ts
const restUrls = {
  USERS: '/users',
  USER: (id: number | string) => `/users/${id}`,
} as const
```

Адреса з параметром — це функція: `restUrls.USER(42)` → `/users/42`.

### Приклади

Сервер загортає відповідь у `{ data }`, тому тип відповіді описуємо разом з обгорткою:

```ts
import { rest } from '@/api'
import restUrls from '@/constants/restUrls'
import type { User } from '@/types/user'

// GET — список
const { data: users } = await rest.get<{ data: User[] }>(restUrls.USERS)

// GET — один запис
const { data: user } = await rest.get<{ data: User }>(restUrls.USER(id))

// POST — створення
const { data: created } = await rest.post<{ data: User }>(restUrls.USERS, {
  email: 'user@example.com',
  name: 'User',
})

// PATCH — часткове оновлення
await rest.patch(restUrls.USER(id), { name: 'New name' })

// DELETE — сервер повертає 204 без тіла
await rest.delete(restUrls.USER(id))
```

### Query-параметри

```ts
// GET /users?page=2&search=ann
await rest.get<{ data: User[] }>(restUrls.USERS, {
  query: { page: 2, search: 'ann' },
})
```

### Власні заголовки

```ts
await rest.get(restUrls.USERS, {
  headers: { 'X-Request-Id': requestId },
})
```

`Authorization` і `Accept-Language` додаються автоматично (див. [Як це працює](#як-це-працює)), передавати їх не потрібно.

---

## GraphQL

> Заготовка: GraphQL-сервера поки немає.

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

Зі змінними — другий дженерик описує їх тип:

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

- Запит іде `POST` на `/graphql/<ім'я операції>` (`/graphql/Me`) — так запити легко відрізнити у вкладці Network. Запит без імені іде на `/graphql`.
- `graphql` повертає одразу `data`, без обгортки.
- Якщо у відповіді є `errors`, буде викинуто `AppError` з `code: GRAPHQL` (див. нижче).

---

## Помилки

Будь-яка помилка з `rest` або `graphql` — це **завжди `AppError`**. Інших типів помилок з API не буває.

```ts
import { AppError } from '@/errors/AppError'
import errorCodes from '@/errors/errorCodes'
```

### Поля

| Поле         | Тип              | Що містить                                                          |
| ------------ | ---------------- | ------------------------------------------------------------------- |
| `message`    | `string`         | Текст помилки з сервера (`error.message`), інакше технічний текст   |
| `code`       | `ErrorCode`      | Категорія помилки, див. таблицю нижче                               |
| `statusCode` | `number \| null` | HTTP-статус; `null`, якщо HTTP-помилки не було                      |
| `details`    | `unknown`        | Подробиці: помилки валідації з сервера або масив `errors` з GraphQL |
| `cause`      | `unknown`        | Оригінальна помилка — для налагодження                              |

### Коди

| `code`         | Коли                                                 | `statusCode` |
| -------------- | ---------------------------------------------------- | ------------ |
| `NETWORK`      | Сервер недоступний, немає мережі                     | `null`       |
| `UNAUTHORIZED` | 401 і оновити токен не вдалося                       | `401`        |
| `VALIDATION`   | 422 — помилки валідації                              | `422`        |
| `HTTP`         | Будь-який інший HTTP-статус помилки (404, 409, 500…) | сам статус   |
| `GRAPHQL`      | `errors` у відповіді GraphQL (HTTP 200)              | `null`       |
| `UNKNOWN`      | Будь-що інше                                         | `null`       |

### Приклади

```ts
try {
  await rest.post(restUrls.USERS, form)
} catch (error) {
  if (!(error instanceof AppError)) {
    throw error
  }

  switch (error.code) {
    case errorCodes.VALIDATION:
      // error.details — масив помилок полів з сервера
      setFieldErrors(error.details)
      break
    case errorCodes.NETWORK:
      // message тут технічний — показуємо свій текст
      showToast(t('errors.network'))
      break
    default:
      showToast(error.message)
  }
}
```

> `message` з сервера можна показувати користувачу. Для `NETWORK` і `UNKNOWN` там технічний текст — краще показати свій з i18n.

---

## Авторизація

### Де зберігаються токени

| Токен   | Де                                                         | Хто керує                 |
| ------- | ---------------------------------------------------------- | ------------------------- |
| Access  | Стор `useAuthStore` + `localStorage` (один на всі вкладки) | Стор                      |
| Refresh | httpOnly cookie                                            | Сервер; JS його не бачить |

API читає й записує access-токен **тільки через стор**. `localStorage` пише лише стор.

### Логін

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

- Refresh-cookie сервер ставить сам через `Set-Cookie`.
- `skipAuthRefresh: true` обов'язковий: 401 на логіні означає «неправильний пароль», а не «токен прострочений», тож оновлювати токен не треба.
- `restUrls.AUTH_LOGIN` треба додати в `constants/restUrls.ts`, коли з'явиться ендпоінт.

### Вихід

```ts
await rest.post(restUrls.AUTH_LOGOUT, undefined, { skipAuthRefresh: true })

authStore.setToken(null)
authStore.setUser(null)
```

Інші вкладки отримають `null` автоматично через подію `storage`.

### Стан у компонентах

```ts
const authStore = useAuthStore()

authStore.isAuthed // boolean
authStore.accessToken // string | null
authStore.user // User | null
```

### Оновлення токена — автоматично

Нічого робити не потрібно. Якщо запит отримав 401:

1. API оновлює токен через `POST /auth/refresh` (refresh-cookie браузер надсилає сам).
2. Повторює початковий запит **один раз** з новим токеном.
3. Якщо оновити не вдалося — токен очищається, запит завершується `AppError` з `code: UNAUTHORIZED`.

Одночасні 401 (у кількох запитах або кількох вкладках) дають **один** refresh: інші чекають і беруть уже новий токен.

### Відновлення сесії при старті

`restoreSession()` викликається один раз у `main.ts` до підключення роутера:

- токен є в `localStorage` — нічого не робить;
- токена немає — пробує refresh через cookie; якщо cookie немає, користувач просто неавторизований.

---

## Опції запиту

Усі опції [ofetch](https://github.com/unjs/ofetch) плюс одна своя:

| Опція             | Тип                       | Для чого                                                         |
| ----------------- | ------------------------- | ---------------------------------------------------------------- |
| `skipAuthRefresh` | `boolean`                 | Не оновлювати токен при 401 (логін, вихід, підтвердження пароля) |
| `query`           | `Record<string, unknown>` | Query-параметри                                                  |
| `headers`         | `HeadersInit`             | Додаткові заголовки                                              |
| `signal`          | `AbortSignal`             | Скасування запиту                                                |
| `timeout`         | `number`                  | Таймаут у мс                                                     |

### Скасування запиту

```ts
const controller = new AbortController()

rest.get(restUrls.USERS, { signal: controller.signal })

controller.abort()
```

---

## Як додати новий ендпоінт

1. Додати адресу в `constants/restUrls.ts`:
   ```ts
   ORDERS: '/orders',
   ORDER: (id: string) => `/orders/${id}`,
   ```
2. Описати тип відповіді (наприклад, у `types/order.ts`):
   ```ts
   export interface Order {
     id: string
   }
   ```
3. Викликати:
   ```ts
   const { data: orders } = await rest.get<{ data: Order[] }>(restUrls.ORDERS)
   ```

---

## Як це працює

```
rest.get(...)   ─┐
                 ├─► request() ─► apiFetch (ofetch-інстанс) ─► сервер
graphql(...)    ─┘       │              │
                         │              └─ onRequest: Authorization + Accept-Language
                         │
                         └─ 401 → refreshAccessToken() → повтор apiFetch
                         └─ будь-яка помилка → AppError.from(error)
```

- **`apiFetch`** — базовий інстанс `ofetch.create`: `baseURL`, `credentials: 'include'`, `retry: false` і хук `onRequest`, який на кожен запит ставить:
  - `Authorization: Bearer <токен зі стору>`;
  - `Accept-Language: <поточна мова i18n>`.
- **`request`** — спільна обробка помилок для REST і GraphQL: оновлення токена при 401 і перетворення будь-якої помилки на `AppError`.
- **`refreshAccessToken`** — виконується під `navigator.locks` (Web Locks API): у всіх вкладках одночасно працює тільки один refresh. Інші після очікування бачать у сторі вже новий токен і refresh пропускають.

---

## Що очікується від сервера

| Ендпоінт / формат    | Очікування                                                                                                      |
| -------------------- | --------------------------------------------------------------------------------------------------------------- |
| Успішна відповідь    | `{ data: ... }`                                                                                                 |
| Помилка              | HTTP-статус + `{ error: { message, details? } }`                                                                |
| `POST /auth/login`   | `{ data: { accessToken } }` + `Set-Cookie: refreshToken=...; HttpOnly; Secure; SameSite=Lax; Path=/api/v1/auth` |
| `POST /auth/refresh` | Читає refresh-токен з cookie, повертає `{ data: { accessToken } }` і нову cookie                                |
| `POST /auth/logout`  | Очищає cookie (`Max-Age=0`)                                                                                     |
| CORS                 | `credentials: true` і конкретний `origin` (не `*`)                                                              |

> Локально по `http` прапорець `Secure` у cookie треба вимкнути — інакше браузер її не збереже.
