# Full-stack App

**Українська** | [English](./README.en.md)

Застосунок для вивчення англійської мови. Репозиторій містить адмін-панель і сервер.

| Частина                         | Що це        | Стек                                               | Документація                                                                           |
| ------------------------------- | ------------ | -------------------------------------------------- | -------------------------------------------------------------------------------------- |
| [`admin-panel/`](./admin-panel) | Адмін-панель | Vue 3 · TypeScript · Vite · Pinia · Tailwind CSS 4 | [README](./admin-panel/README.md) · [Архітектурні рішення](./admin-panel/DECISIONS.md) |
| [`server-app/`](./server-app)   | REST API     | Node.js · Express                                  | [README](./server-app/README.md)                                                       |

## Швидкий старт

Дві частини запускаються окремо, у двох терміналах.

**1. Сервер** — `http://localhost:3000`

```bash
cd server-app
npm install
cp .env.example .env
npm run dev
```

**2. Адмін-панель** — `http://localhost:5173`

```bash
cd admin-panel
npm install
cp .env.example .env
npm run dev
```

Адмін-панель звертається до API за адресою з `VITE_API_BASE_URL` (`http://localhost:3000/api/v1`), сервер дозволяє запити з `CORS_ORIGIN` (`http://localhost:5173`). Значення за замовчуванням у `.env.example` вже узгоджені.

## Структура

```
full-stack-app/
├── admin-panel/    # адмін-панель (Vue)
└── server-app/     # API (Express)
```

## Коміти

```
feat(admin-panel): короткий опис
fix(server-app): короткий опис
```

Тип — тільки `feat` або `fix`. Scope — назва частини: `admin-panel` або `server-app`.

## Стан проєкту

**Готово**

- Адмін-панель: роутинг з типізованим `meta` і layout'ами, i18n (uk / en / ru), API-клієнт для REST і GraphQL, оновлення токена з підтримкою кількох вкладок, єдиний `AppError`, стор авторизації.
- Сервер: структура `route → controller → service → repository`, CRUD користувачів, обробка помилок.

**Далі**

- Переведення сервера на TypeScript.
- Авторизація на сервері: логін, refresh-токен в httpOnly cookie, вихід.
- Сторінка логіну та guard роутів в адмін-панелі.
- UI-кіт (`AppButton`, `AppInput`…).
- Тести та CI.
