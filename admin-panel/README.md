# Admin Panel

← [Full-stack App](../README.md)

**Українська** | [English](./README.en.md)

Веб-панель застосунку для вивчення англійської мови. Одна для всіх: користувачі додають тут слова й тексти, адміністратори керують застосунком. Розділи видно відповідно до ролі (`meta.permissions` роутів).

**Стек:** Vue 3 · TypeScript · Vite · Pinia · Vue Router · vue-i18n · Tailwind CSS 4 · ofetch

## Зміст

- [Швидкий старт](#швидкий-старт)
- [Скрипти](#скрипти)
- [Структура](#структура)
- [Документація модулів](#документація-модулів)
- [Архітектурні рішення](./DECISIONS.md)
- [Правила](#правила)

---

## Швидкий старт

```bash
npm install
cp .env.example .env
npm run dev
```

Потрібен запущений `backend-node-app` — адреса API задається у `.env` (`VITE_API_BASE_URL`).

## Скрипти

| Скрипт                            | Що робить                           |
| --------------------------------- | ----------------------------------- |
| `npm run dev`                     | Dev-сервер                          |
| `npm run build`                   | Перевірка типів + production-збірка |
| `npm run preview`                 | Перегляд production-збірки          |
| `npm run typecheck`               | Перевірка типів (`vue-tsc`)         |
| `npm run lint` / `lint:fix`       | ESLint                              |
| `npm run format` / `format:check` | Prettier                            |

## Структура

```
src/
├── api/            # REST + GraphQL клієнт → див. api/README.md
├── assets/         # стилі, теми, зображення → див. assets/README.md
├── components/
│   ├── app/        # UI-кіт: AppButton, AppInput…
│   ├── the/        # компоненти в одному екземплярі: TheLocaleSwitcher…
│   └── svg/        # іконки
├── constants/      # константи: routeNames, layoutNames, restUrls, permissions…
├── errors/         # AppError і коди помилок
├── helpers/        # чисті функції без реактивності
├── layouts/        # AuthLayout, DashboardLayout
├── locales/        # переклади: uk, en, ru
├── plugins/        # i18n
├── router/         # роутер: routes/public, routes/secure
├── stores/         # Pinia-стори
├── types/          # доменні типи та розширення типів бібліотек
├── use/            # composables (useX)
└── views/          # розділи зі сторінками
```

## Документація модулів

| Модуль                               | Що описано                                                                               |
| ------------------------------------ | ---------------------------------------------------------------------------------------- |
| [**API**](./src/api/README.md)       | `rest` / `graphql`, помилки `AppError`, авторизація й оновлення токена, контракт сервера |
| [**Assets**](./src/assets/README.md) | CSS-змінні, зв'язок з Tailwind, теми, зображення                                         |

Чому проєкт зроблений саме так — [**Архітектурні рішення**](./DECISIONS.md).

---

## Правила

### 0. Принцип потрібності й адекватності

Пишемо лише те, що потрібно зараз. Без абстракцій «на майбутнє», без конфігурованості, яку ніхто не просив. Правила нижче — не самоціль: якщо правило в конкретному місці робить код гіршим, це привід обговорити правило.

### 1. Тільки TypeScript

- `<script setup lang="ts">` у кожному `.vue`.
- `any` заборонений. Для невідомих даних — `unknown` + звуження типу.
- Порядок блоків у `.vue`: `<script>` → `<template>` → `<style>`.

### 2. Розділи та сторінки

Код розбитий на розділи (`home`, `users`…). Кожна сторінка — окрема папка з суфіксом **`-page`** і файлом `index.vue`:

```
views/
└── users/
    ├── _components/        # компоненти, потрібні лише цьому розділу
    ├── list-page/
    │   └── index.vue
    └── single-page/
        └── index.vue
```

- `_components/` — приватні компоненти розділу. Якщо компонент знадобився у **другому** розділі — переносимо в `components/app/`.
- Імпорт приватних компонентів — відносний: `../_components/UserCard.vue`.

### 3. Імена сторінок і компонентів

Кожна сторінка й компонент має ім'я — щоб орієнтуватися в коді та у Vue Devtools.

**Сторінка:**

```vue
<script setup lang="ts">
const PAGE_NAME = 'UsersListPage'

defineOptions({ name: PAGE_NAME })
</script>

<template>
  <main :data-page-name="PAGE_NAME">...</main>
</template>
```

**Компонент:**

```vue
<script setup lang="ts">
const COMPONENT_NAME = 'UserCard'

defineOptions({ name: COMPONENT_NAME })
</script>

<template>
  <div :data-component-name="COMPONENT_NAME">...</div>
</template>
```

|           | Константа        | Атрибут               | Формат імені                                              |
| --------- | ---------------- | --------------------- | --------------------------------------------------------- |
| Сторінка  | `PAGE_NAME`      | `data-page-name`      | `<Розділ><Сторінка>Page`: `UsersListPage`, `HomeMainPage` |
| Компонент | `COMPONENT_NAME` | `data-component-name` | Збігається з ім'ям файлу: `UserCard`                      |

### 4. Роути та навігація

- Кожен роут має `name` з `constants/routeNames.ts`.
- Кожен роут має `meta`:
  ```ts
  meta: {
    layout: layoutNames.DASHBOARD,
    permissions: [permissions.READ_USERS_PAGE],
    isPrivate: true,
  }
  ```
- Публічні роути — у `router/routes/public`, приватні — у `router/routes/secure`.
- **Навігація — тільки за іменем роуту і тільки через нашу абстракцію `useAppRouter`** (з'явиться в `use/`). Не використовуємо шляхи-рядки (`router.push('/users')`) і `useRouter` з `vue-router` напряму.

### 5. UI — тільки через абстракції

Нативні елементи форм (`<button>`, `<input>`, `<select>`, `<textarea>`, `<form>`…) використовуються **лише всередині `components/app/`**. Скрізь інде — компоненти UI-кіту: `AppButton`, `AppInput`… Так UI можна замінити в одному місці.

| Папка             | Що там                         | Правила                                              |
| ----------------- | ------------------------------ | ---------------------------------------------------- |
| `components/app/` | UI-кіт                         | Префікс `App`. Тільки props / emits, без стору й API |
| `components/the/` | Компоненти в одному екземплярі | Префікс `The`                                        |
| `components/svg/` | Іконки                         | —                                                    |

### 6. Без магічних чисел і рядків

Значення з сенсом — у константу:

```ts
// ❌
if (user.role === 'admin') { ... }
setTimeout(refresh, 300000)

// ✅
if (user.role === userRoles.ADMIN) { ... }
setTimeout(refresh, REFRESH_INTERVAL_MS)
```

- Спільні константи — у `constants/` як `as const` + виведений тип:
  ```ts
  const layoutNames = { AUTH: 'auth', DASHBOARD: 'dashboard' } as const
  export type LayoutName = (typeof layoutNames)[keyof typeof layoutNames]
  ```
- Константа, потрібна одному файлу, — `UPPER_SNAKE_CASE` вгорі цього файлу.
- **Не магія:** `0`, `1`, `-1`, `''`, класи Tailwind.

### 7. API

- Запити — тільки через `rest` / `graphql` з `@/api`. `ofetch` / `fetch` напряму не викликаємо.
- Адреси — тільки з `constants/restUrls.ts`.
- Помилки — завжди `AppError`, обробляємо за `code`, а не за текстом.

Детально: [api/README.md](./src/api/README.md).

### 8. Авторизація

Access-токен — тільки через `useAuthStore` (`setToken`, `accessToken`, `isAuthed`). У `localStorage` напряму не звертаємося — туди пише лише стор.

### 9. Локалізація

- Жодного тексту в шаблонах — тільки `t('ключ')`.
- **Ключі тільки пласкі, вкладеність заборонена:**
  ```json
  // ✅
  { "users.list.title": "Користувачі" }

  // ❌
  { "users": { "list": { "title": "Користувачі" } } }
  ```
- Формат ключа: `розділ.ключ` або `розділ.підрозділ.ключ`, кожна частина — camelCase (`notFound.backHome`).
- Еталон ключів — `en.json`: якщо в іншій мові бракує ключа, `typecheck` впаде.
- Мова за замовчуванням — `uk`.

### 10. Стилі

- Tailwind-класи. Жодних hex-кольорів у компонентах — тільки класи на основі змінних теми (`bg-primary`, `text-muted`).
- Нова змінна в `main.scss` **обов'язково** дублюється в `@theme` у `tailwind.css`.

Детально: [assets/README.md](./src/assets/README.md).

### 11. Composables і helpers

| Папка      | Що там                                                        |
| ---------- | ------------------------------------------------------------- |
| `use/`     | Composables `useX` — з реактивністю (`ref`, `computed`, хуки) |
| `helpers/` | Чисті функції без реактивності                                |

### 12. Змінні оточення

- Тільки з префіксом `VITE_` — інакше Vite не передасть їх у код.
- Кожна нова змінна: тип у `types/env.d.ts` + приклад у `.env.example`.

### 13. Коміти

Формат — тільки:

```
feat(admin-panel): короткий опис
fix(admin-panel): короткий опис
```

Перед комітом:

```bash
npm run typecheck && npm run lint && npm run format:check
```

### 14. Документація

- README модулів — двома мовами: `README.md` (українська, основна) і `README.en.md`.
- Змінили одну — оновіть і другу.
