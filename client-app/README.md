# Client App

← [Full-stack App](../README.md)

**Українська** | [English](./README.en.md)

Застосунок для навчання: сайт і мобільний застосунок (Capacitor) з одного коду. Користувачі проходять модулі й уроки, тренують слова в конструкціях.

**Стек:** Vue 3 · TypeScript · Vite · Pinia · Vue Router · vue-i18n · Tailwind CSS 4 · ofetch

## Швидкий старт

```bash
npm install
cp .env.example .env
npm run dev
```

Відкривається на `http://localhost:5174` (адмін-панель — на `5173`, обидві можна запускати одночасно). Потрібен запущений [`backend-node-app`](../backend-node-app).

Скрипти ті самі, що в адмін-панелі: `dev`, `build`, `preview`, `typecheck`, `lint`, `format`.

## Правила

Структура й правила — **ті самі, що в [адмін-панелі](../admin-panel/README.md#правила)**. Відмінності:

|                  | Адмін-панель                         | Client App                                     |
| ---------------- | ------------------------------------ | ---------------------------------------------- |
| Layout'и         | `AuthLayout`, `DashboardLayout`      | `AuthLayout`, `MainLayout`                     |
| `meta` роутів    | `layout`, `permissions`, `isPrivate` | `layout`, `isPrivate` — права перевіряє сервер |
| Порт dev-сервера | `5173`                               | `5174`                                         |
| Платформи        | веб                                  | веб + iOS / Android (Capacitor, буде додано)   |

API-клієнт, `AppError`, стор авторизації й теми влаштовані так само — документація: [API](../admin-panel/src/api/README.md), [Assets](../admin-panel/src/assets/README.md). Код скопійований, а не спільний: застосунки розвиваються незалежно.

## Далі

- Capacitor: iOS і Android.
- Зберігання токенів на мобільному — у захищеному сховищі пристрою, refresh-токен у тілі запиту (на сайті — як в адмін-панелі).
