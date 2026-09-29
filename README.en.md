# Full-stack App

[Українська](./README.md) | **English**

An English-learning app: a mobile app for learning and a web panel where it's convenient to add words and texts from a computer — they then show up in the app.

The web panel is one for everyone: both users and administrators. The only difference is roles — everyone sees the sections their permissions allow.

| Part                                    | What it is                                 | Stack                                              | Docs                                                                                           |
| --------------------------------------- | ------------------------------------------ | -------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| [`admin-panel/`](./admin-panel)         | Web panel for users and administrators     | Vue 3 · TypeScript · Vite · Pinia · Tailwind CSS 4 | [README](./admin-panel/README.en.md) · [Architecture decisions](./admin-panel/DECISIONS.en.md) |
| [`client-app/`](./client-app)           | Learning app: website + mobile (Capacitor) | Vue 3 · TypeScript · Vite · Pinia · Tailwind CSS 4 | [README](./client-app/README.en.md)                                                            |
| [`backend-node-app/`](backend-node-app) | REST API                                   | Node.js · TypeScript · Express                     | [README](backend-node-app/README.en.md)                                                        |

## Quick start

The parts run separately, each in its own terminal.

**1. Server** — `http://localhost:3000`

```bash
cd backend-node-app
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

**3. Client App** — `http://localhost:5174`

```bash
cd client-app
npm install
cp .env.example .env
npm run dev
```

Both frontends call the API at `VITE_API_BASE_URL` (`http://localhost:3000/api/v1`), the server allows requests from `CORS_ORIGIN` (`http://localhost:5173,http://localhost:5174`). The defaults in `.env.example` already match.

## Structure

```
full-stack-app/
├── admin-panel/    # web panel (Vue)
├── client-app/     # learning app (Vue + Capacitor)
└── backend-node-app/     # API (Express)
```

## Commits

```
feat(admin-panel): short description
fix(backend-node-app): short description
```

Type — only `feat` or `fix`. Scope — the part name: `admin-panel`, `client-app` or `backend-node-app`.

## Project status

**Done**

- Admin panel: routing with typed `meta` and layouts, i18n (uk / en / ru), an API client for REST and GraphQL, multi-tab-safe token refresh, a single `AppError`, an auth store.
- Server: TypeScript, `route → controller → service → repository` structure, users CRUD, error handling.

**Next**

- Server-side auth: login, refresh token in an httpOnly cookie, logout.
- Login page and route guard in the admin panel.
- UI kit (`AppButton`, `AppInput`…).
- Roles and permissions: the user's permission list from the server, guard and menu by permissions; data ownership check (`owner_id`) on the server.
- Sign in with Google and Apple in the mobile app. Sign-up happens only in the app.
- Web panel login with a one-time code from the app: the app shows a code (valid 2–3 min, single-use), the user enters it on the site. Works for any sign-in method used in the app.
- Later, if needed: "Sign in with Google" directly on the site. Apple on the site is not planned — Apple users log in with a code from the app.
- Client App: Capacitor (iOS / Android), modules and exercises.
- Tests and CI.
