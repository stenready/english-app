# Full-stack App

**Українська** | [English](./README.en.md)

Застосунок для вивчення англійської мови: мобільний застосунок для навчання і веб-панель, де зручно додавати слова й тексти з комп'ютера — потім вони з'являються в застосунку.

Веб-панель одна для всіх: і для користувачів, і для адміністраторів. Різниця лише в ролях — кожен бачить розділи відповідно до своїх прав.

| Частина                                 | Що це                                                 | Стек                                               | Документація                                                                           |
| --------------------------------------- | ----------------------------------------------------- | -------------------------------------------------- | -------------------------------------------------------------------------------------- |
| [`admin-panel/`](./admin-panel)         | Веб-панель для користувачів і адміністраторів         | Vue 3 · TypeScript · Vite · Pinia · Tailwind CSS 4 | [README](./admin-panel/README.md) · [Архітектурні рішення](./admin-panel/DECISIONS.md) |
| [`client-app/`](./client-app)           | Застосунок для навчання: сайт + мобільний (Capacitor) | Vue 3 · TypeScript · Vite · Pinia · Tailwind CSS 4 | [README](./client-app/README.md)                                                       |
| [`backend-node-app/`](backend-node-app) | REST API                                              | Node.js · TypeScript · Express                     | [README](backend-node-app/README.md)                                                   |

## Швидкий старт

Частини запускаються окремо, кожна у своєму терміналі.

**1. Сервер** — `http://localhost:3000`

```bash
cd backend-node-app
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

**3. Client App** — `http://localhost:5174`

```bash
cd client-app
npm install
cp .env.example .env
npm run dev
```

Обидва фронтенди звертаються до API за адресою з `VITE_API_BASE_URL` (`http://localhost:3000/api/v1`), сервер дозволяє запити з `CORS_ORIGIN` (`http://localhost:5173,http://localhost:5174`). Значення за замовчуванням у `.env.example` вже узгоджені.

## Структура

```
full-stack-app/
├── admin-panel/    # веб-панель (Vue)
├── client-app/     # застосунок для навчання (Vue + Capacitor)
└── backend-node-app/     # API (Express)
```

## Коміти

```
feat(admin-panel): короткий опис
fix(backend-node-app): короткий опис
```

Тип — тільки `feat` або `fix`. Scope — назва частини: `admin-panel`, `client-app`, `backend-node-app` або `root` — для файлів у корені.

## Долучитися

Як допомогти проєкту — у [CONTRIBUTING](./CONTRIBUTING.md). Обговорення — у [Telegram-чаті](https://t.me/stenreadyenglishapp). Ліцензія — [MIT](./LICENSE).

## Стан проєкту

**Готово**

- Адмін-панель: роутинг з типізованим `meta` і layout'ами, i18n (uk / en / ru), API-клієнт для REST і GraphQL, оновлення токена з підтримкою кількох вкладок, єдиний `AppError`, стор авторизації.
- Сервер: TypeScript, структура `route → controller → service → repository`, CRUD користувачів, обробка помилок.

**Далі**

- Авторизація на сервері: логін, refresh-токен в httpOnly cookie, вихід.
- Сторінка логіну та guard роутів в адмін-панелі.
- UI-кіт (`AppButton`, `AppInput`…).
- Ролі та права: список прав користувача з сервера, guard і меню за правами; перевірка власника даних (`owner_id`) на сервері.
- Вхід через Google і Apple у мобільному застосунку. Реєстрація — тільки в застосунку.
- Вхід у веб-панель одноразовим кодом із застосунку: застосунок показує код (живе 2–3 хв, одноразовий), користувач вводить його на сайті. Працює для будь-якого способу входу в застосунку.
- Пізніше, за потреби: «Увійти через Google» прямо на сайті. Apple на сайті не плануємо — користувачі Apple входять кодом із застосунку.
- Client App: Capacitor (iOS / Android), модулі та вправи.
- Тести та CI.
