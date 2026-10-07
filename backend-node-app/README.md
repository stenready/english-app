# Backend Node App

← [Full-stack App](../README.md)

**Українська** | [English](./README.en.md)

REST API на Node.js + Express, написаний на TypeScript. Один сервер обслуговує обидва фронтенди.

## Зміст

- [Кого обслуговує](#кого-обслуговує)
- [Швидкий старт](#швидкий-старт)
- [Структура](#структура)
- [Аліаси імпортів](#аліаси-імпортів)
- [База даних](#база-даних)

---

## Кого обслуговує

| Клієнт                          | Що це                                                                           | Авторизація (планується)                                                              |
| ------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| [`admin-panel`](../admin-panel) | Веб-панель для користувачів і адміністраторів: додавання слів, текстів, модулів | refresh-токен в httpOnly cookie                                                       |
| [`client-app`](../client-app)   | Застосунок для навчання: сайт + мобільний (Capacitor)                           | Сайт — cookie; мобільний — refresh-токен у тілі запиту (cookie в Capacitor ненадійні) |

- **Один API** — `/api/v1` для обох клієнтів. Окремих «API для адмінки» і «API для застосунку» немає.
- **Різниця — лише в правах.** Що дозволено користувачу, вирішують ролі та права на сервері. Фронтенд лише ховає недоступні розділи — справжня перевірка завжди тут.
- **Власник даних.** Слова, тексти, уроки мають `owner_id`: сервер віддає й змінює лише те, що належить користувачу або відкрите йому.
- **CORS.** `CORS_ORIGIN` — список origin'ів обох клієнтів через кому (для мобільного — `capacitor://localhost`, `https://localhost`).

---

## Швидкий старт

Потрібні Node.js `^20.19 || ^22.12 || >=24` і Docker (Docker Desktop або OrbStack).

```bash
npm install            # також генерує Prisma Client
cp .env.example .env
npm run db:up          # PostgreSQL у Docker
npm run db:migrate     # застосувати міграції
npm run dev
```

> **Перша міграція.** Якщо в `prisma/migrations/` ще порожньо, створи її: `npm run db:migrate -- --name init`. Згенерована папка з `migration.sql` комітиться в репозиторій.

| Скрипт                              | Що робить                                                           |
| ----------------------------------- | ------------------------------------------------------------------- |
| `npm run dev`                       | Dev-сервер з автоперезапуском (`tsx watch`), запускає `.ts` напряму |
| `npm run build`                     | Компілює `src/` у `dist/` (`tsc`)                                   |
| `npm run start`                     | Запускає зібраний сервер: `node dist/server.js` (спочатку `build`)  |
| `npm run typecheck`                 | Перевірка типів без збирання                                        |
| `npm run db:up` / `db:down`         | Запустити / зупинити PostgreSQL у Docker                            |
| `npm run db:migrate`                | Створити й застосувати міграцію за змінами в `schema.prisma` (dev)  |
| `npm run db:deploy`                 | Застосувати наявні міграції (прод, CI)                              |
| `npm run db:generate`               | Згенерувати Prisma Client (автоматично після `npm install`)         |
| `npm run db:studio`                 | Prisma Studio — перегляд і редагування даних у браузері             |
| `npm run docker:up` / `docker:down` | Усе в Docker, як у продакшені: PostgreSQL + міграції + API          |
| `npm run lint` / `lint:fix`         | ESLint                                                              |
| `npm run format` / `format:check`   | Prettier                                                            |

Перевірка: `GET /api/v1/health`

### Docker

| Режим           | Команда                         | Що запускається                                                            |
| --------------- | ------------------------------- | -------------------------------------------------------------------------- |
| Розробка        | `npm run db:up` + `npm run dev` | PostgreSQL у Docker, API локально з автоперезапуском                       |
| Як у продакшені | `npm run docker:up`             | PostgreSQL → `migrate` (`prisma migrate deploy`) → API з production-образу |

`Dockerfile` — багатоетапна збірка: `deps` (усі залежності + Prisma CLI) → `build` (`tsc`) → `runtime` (лише production-залежності й `dist/`, від користувача `node`, з `HEALTHCHECK`). Паролі в `docker-compose.yml` — лише для локальної розробки; у продакшені їх задають змінними оточення.

---

## Структура

```text
src/
├── config/          Конфігурація з env
├── constants/       Константи (HTTP-статуси…)
├── controllers/     Обробка HTTP-запиту й відповіді
├── db/              Prisma Client (один на застосунок)
├── errors/          AppError
├── generated/       Згенерований Prisma Client (не в git)
├── middlewares/     Middleware Express
├── repositories/    Доступ до даних через Prisma
├── routes/          Маршрути
├── services/        Бізнес-логіка та валідація
├── types/           Доменні типи (User…)
├── app.ts           Налаштування Express
└── server.ts        Запуск і коректна зупинка сервера
```

Потік запиту: `route → controller → service → repository`. Приклад — `health`.

Нова фіча: `routes/<feature>/`, `controllers/<feature>/`, `services/<feature>/`, `repositories/<feature>/`.

### Формат відповідей

|         | Формат                                           |
| ------- | ------------------------------------------------ |
| Успіх   | `{ data: ... }`                                  |
| Помилка | HTTP-статус + `{ error: { message, details? } }` |

Обидва фронтенди спираються саме на цей контракт.

---

## Аліаси імпортів

Між папками імпортуємо через аліаси з `package.json` (`imports`): `#controllers/...`, `#services/...`, `#repositories/...` тощо.

У кожного аліаса дві цілі:

- `development` → `src/*.ts` — для `tsx` і `tsc` (через `customConditions`);
- `default` → `dist/*.js` — для `node dist/server.js`.

Нова папка верхнього рівня в `src/` — новий аліас з обома цілями.

---

## База даних

**PostgreSQL 18** у класичному реляційному стилі: нормалізовані таблиці, зовнішні ключі, зв'язки «багато-до-багатьох» — через **таблиці-мости** (junction tables).

**Prisma 7:** схема — `prisma/schema.prisma`, міграції — `prisma/migrations/` (Prisma Migrate), підключення — через `@prisma/adapter-pg`, URL — у `prisma.config.ts` з `DATABASE_URL`. Імена в базі — `snake_case` через `@map` / `@@map`, у коді — `camelCase`.

**Зараз у базі:** `users` (`id`, `email`, `name`, `role`, `created_at`, `updated_at`). Решта таблиць нижче — план.

### Угоди

- Таблиці — `snake_case`, у множині: `users`, `lessons`.
- Первинний ключ — `id uuid`; `created_at`, `updated_at` — у кожній таблиці з даними.
- Міст — ім'я з двох таблиць (`lesson_words`, `user_roles`), складений первинний ключ із двох зовнішніх, без окремого `id`.
- Зовнішні ключі — завжди з явним `ON DELETE` (`CASCADE` для мостів, `RESTRICT` там, де видалення має бути свідомим).
- Унікальність — на рівні бази (`UNIQUE`), а не лише в коді.

### Чернетка схеми

> Чернетка з обговорень — зміниться, коли дійдемо до реалізації.

```text
users            id, email (UNIQUE), name, created_at, updated_at
auth_identities  id, user_id → users, provider ('password' | 'google' | 'apple'),
                 provider_user_id, password_hash       UNIQUE (provider, provider_user_id)
refresh_tokens   id, user_id → users, token_hash, client ('web' | 'mobile'),
                 expires_at, revoked_at

roles            id, name (UNIQUE)                     'student' | 'teacher' | 'admin'
permissions      id, code (UNIQUE)                     'read_lessons', 'edit_lessons'…
user_roles       user_id → users, role_id → roles                    ← міст
role_permissions role_id → roles, permission_id → permissions        ← міст

lessons          id, owner_id → users, title, visibility ('public' | 'shared' | 'private'),
                 status ('draft' | 'published'), position
words            id, text, translation, part_of_speech
lesson_words     lesson_id → lessons, word_id → words, position      ← міст
word_examples    id, lesson_id, word_id → lesson_words, tense, form ('affirmative' |
                 'negative' | 'question'), sentence, translation
texts            id, lesson_id → lessons, title, body
videos           id, lesson_id → lessons, url

assignments      lesson_id → lessons, student_id → users, assigned_by → users,
                 assigned_at                                         ← міст
progress         user_id → users, lesson_id, word_id, correct, attempts, completed_at
```

- **Модуль (адміністратора) і урок (вчителя) — одна таблиця `lessons`**: різні лише `owner_id` і `visibility`.
- **Приклади прив'язані до слова в уроці** (`lesson_words`), а не до слова загалом: `order` у модулі «Ресторан» має свої приклади.
- **Вхід:** користувач один, способів входу може бути кілька (`auth_identities`); зв'язок — за `provider_user_id`, не за email.
- **Сесії:** окремий `refresh_tokens` на кожен пристрій — вхід на сайті не розлогінює телефон.

### Ще не вирішено

- Набір часів у модулі: однаковий для всіх чи свій для кожного.
