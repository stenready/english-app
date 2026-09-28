# Full-stack App

[Українська](./README.md) | **English**

An English-learning app. The repository contains the admin panel and the server.

| Part                            | What it is  | Stack                                              | Docs                                                                                           |
| ------------------------------- | ----------- | -------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| [`admin-panel/`](./admin-panel) | Admin panel | Vue 3 · TypeScript · Vite · Pinia · Tailwind CSS 4 | [README](./admin-panel/README.en.md) · [Architecture decisions](./admin-panel/DECISIONS.en.md) |
| [`server-app/`](./server-app)   | REST API    | Node.js · Express                                  | [README](./server-app/README.md)                                                               |

## Quick start

The two parts run separately, in two terminals.

**1. Server** — `http://localhost:3000`

```bash
cd server-app
npm install
cp .env.example .env
npm run dev
```

**2. Admin panel** — `http://localhost:5173`

```bash
cd admin-panel
npm install
cp .env.example .env
npm run dev
```

The admin panel calls the API at `VITE_API_BASE_URL` (`http://localhost:3000/api/v1`), the server allows requests from `CORS_ORIGIN` (`http://localhost:5173`). The defaults in `.env.example` already match.

## Structure

```
full-stack-app/
├── admin-panel/    # admin panel (Vue)
└── server-app/     # API (Express)
```

## Commits

```
feat(admin-panel): short description
fix(server-app): short description
```

Type — only `feat` or `fix`. Scope — the part name: `admin-panel` or `server-app`.

## Project status

**Done**

- Admin panel: routing with typed `meta` and layouts, i18n (uk / en / ru), an API client for REST and GraphQL, multi-tab-safe token refresh, a single `AppError`, an auth store.
- Server: `route → controller → service → repository` structure, users CRUD, error handling.

**Next**

- Migrating the server to TypeScript.
- Server-side auth: login, refresh token in an httpOnly cookie, logout.
- Login page and route guard in the admin panel.
- UI kit (`AppButton`, `AppInput`…).
- Tests and CI.
