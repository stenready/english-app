# Backend Node App

← [Full-stack App](../README.en.md)

[Українська](./README.md) | **English**

REST API on Node.js + Express, written in TypeScript. One server serves both frontends.

## Contents

- [Who it serves](#who-it-serves)
- [Quick start](#quick-start)
- [Structure](#structure)
- [Import aliases](#import-aliases)
- [Database (planned)](#database-planned)

---

## Who it serves

| Client                          | What it is                                                           | Auth (planned)                                                                                     |
| ------------------------------- | -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| [`admin-panel`](../admin-panel) | Web panel for users and administrators: adding words, texts, modules | refresh token in an httpOnly cookie                                                                |
| [`client-app`](../client-app)   | Learning app: website + mobile (Capacitor)                           | Website — cookie; mobile — refresh token in the request body (cookies are unreliable in Capacitor) |

- **One API** — `/api/v1` for both clients. There is no separate "admin API" and "app API".
- **The only difference is permissions.** What a user may do is decided by roles and permissions on the server. The frontend only hides unavailable sections — the real check always happens here.
- **Data ownership.** Words, texts and lessons have an `owner_id`: the server returns and changes only what belongs to the user or is shared with them.
- **CORS.** `CORS_ORIGIN` is a comma-separated list of both clients' origins (for mobile — `capacitor://localhost`, `https://localhost`).

---

## Quick start

```bash
npm install
cp .env.example .env
npm run dev
```

| Script                            | What it does                                                        |
| --------------------------------- | ------------------------------------------------------------------- |
| `npm run dev`                     | Dev server with hot reload (`tsx watch`), runs `.ts` directly       |
| `npm run build`                   | Compiles `src/` to `dist/` (`tsc`)                                  |
| `npm run start`                   | Runs the compiled server: `node dist/server.js` (run `build` first) |
| `npm run typecheck`               | Type check without emitting files                                   |
| `npm run lint` / `lint:fix`       | ESLint                                                              |
| `npm run format` / `format:check` | Prettier                                                            |

Health check: `GET /api/v1/health`

---

## Structure

```text
src/
├── config/          Environment configuration
├── constants/       Constants (HTTP statuses…)
├── controllers/     HTTP request and response handling
├── errors/          AppError
├── middlewares/     Express middleware
├── repositories/    Data access (in memory for now, PostgreSQL next)
├── routes/          Route definitions
├── services/        Business logic and validation
├── types/           Domain types (User…)
├── app.ts           Express configuration
└── server.ts        Server start and graceful shutdown
```

Request flow: `route → controller → service → repository`. Example — `health`.

A new feature: `routes/<feature>/`, `controllers/<feature>/`, `services/<feature>/`, `repositories/<feature>/`.

### Response format

|         | Format                                           |
| ------- | ------------------------------------------------ |
| Success | `{ data: ... }`                                  |
| Error   | HTTP status + `{ error: { message, details? } }` |

Both frontends rely on exactly this contract.

---

## Import aliases

Imports across folders use aliases from `package.json` (`imports`): `#controllers/...`, `#services/...`, `#repositories/...` and so on.

Each alias has two targets:

- `development` → `src/*.ts` — for `tsx` and `tsc` (via `customConditions`);
- `default` → `dist/*.js` — for `node dist/server.js`.

A new top-level folder in `src/` needs a new alias with both targets.

---

## Database (planned)

**PostgreSQL** in the classic relational style: normalized tables, foreign keys, many-to-many relations via **junction tables**.

### Conventions

- Tables — `snake_case`, plural: `users`, `lessons`.
- Primary key — `id uuid`; `created_at`, `updated_at` — in every data table.
- A junction table is named after both tables (`lesson_words`, `user_roles`), with a composite primary key of the two foreign keys and no separate `id`.
- Foreign keys always have an explicit `ON DELETE` (`CASCADE` for junction tables, `RESTRICT` where deletion must be deliberate).
- Uniqueness is enforced by the database (`UNIQUE`), not only in code.

### Draft schema

> A draft from discussions — it will change once we get to the implementation.

```text
users            id, email (UNIQUE), name, created_at, updated_at
auth_identities  id, user_id → users, provider ('password' | 'google' | 'apple'),
                 provider_user_id, password_hash       UNIQUE (provider, provider_user_id)
refresh_tokens   id, user_id → users, token_hash, client ('web' | 'mobile'),
                 expires_at, revoked_at

roles            id, name (UNIQUE)                     'student' | 'teacher' | 'admin'
permissions      id, code (UNIQUE)                     'read_lessons', 'edit_lessons'…
user_roles       user_id → users, role_id → roles                    ← junction
role_permissions role_id → roles, permission_id → permissions        ← junction

lessons          id, owner_id → users, title, visibility ('public' | 'shared' | 'private'),
                 status ('draft' | 'published'), position
words            id, text, translation, part_of_speech
lesson_words     lesson_id → lessons, word_id → words, position      ← junction
word_examples    id, lesson_id, word_id → lesson_words, tense, form ('affirmative' |
                 'negative' | 'question'), sentence, translation
texts            id, lesson_id → lessons, title, body
videos           id, lesson_id → lessons, url

assignments      lesson_id → lessons, student_id → users, assigned_by → users,
                 assigned_at                                         ← junction
progress         user_id → users, lesson_id, word_id, correct, attempts, completed_at
```

- **A module (admin's) and a lesson (teacher's) are one `lessons` table**: only `owner_id` and `visibility` differ.
- **Examples belong to a word within a lesson** (`lesson_words`), not to the word in general: `order` in the "Restaurant" module has its own examples.
- **Sign-in:** one user, possibly several sign-in methods (`auth_identities`); linked by `provider_user_id`, not by email.
- **Sessions:** a separate `refresh_tokens` row per device — signing in on the website doesn't log out the phone.

### Not decided yet

- ORM / query builder (Prisma, TypeORM, Kysely, plain SQL).
- Migration tool.
- The set of tenses in a module: the same for all or per module.
