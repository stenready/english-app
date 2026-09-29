# Client App

← [Full-stack App](../README.en.md)

[Українська](./README.md) | **English**

The learning app: a website and a mobile app (Capacitor) from one codebase. Users go through modules and lessons and practice words in constructions.

**Stack:** Vue 3 · TypeScript · Vite · Pinia · Vue Router · vue-i18n · Tailwind CSS 4 · ofetch

## Quick start

```bash
npm install
cp .env.example .env
npm run dev
```

Opens at `http://localhost:5174` (the admin panel runs on `5173`, both can run at the same time). Requires a running [`backend-node-app`](../backend-node-app).

Scripts are the same as in the admin panel: `dev`, `build`, `preview`, `typecheck`, `lint`, `format`.

## Rules

Structure and rules are **the same as in the [admin panel](../admin-panel/README.en.md#rules)**. Differences:

|                 | Admin panel                          | Client App                                                    |
| --------------- | ------------------------------------ | ------------------------------------------------------------- |
| Layouts         | `AuthLayout`, `DashboardLayout`      | `AuthLayout`, `MainLayout`                                    |
| Route `meta`    | `layout`, `permissions`, `isPrivate` | `layout`, `isPrivate` — permissions are checked by the server |
| Dev server port | `5173`                               | `5174`                                                        |
| Platforms       | web                                  | web + iOS / Android (Capacitor, coming)                       |

The API client, `AppError`, the auth store and themes work the same way — docs: [API](../admin-panel/src/api/README.en.md), [Assets](../admin-panel/src/assets/README.en.md). The code is copied, not shared: the apps evolve independently.

## Next

- Capacitor: iOS and Android.
- Token storage on mobile — the device's secure storage, refresh token in the request body (on the website — same as the admin panel).
