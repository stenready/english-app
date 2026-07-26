# Server App

## Start

```bash
npm install
cp .env.example .env
npm run dev
```

Health check: `GET /api/v1/health`

Node ESM aliases are configured in `package.json`. Use `#controllers/...`, `#services/...`, `#repositories/...`, and similar aliases for imports across directories.

The health-check is an educational example of the full request flow: `route → controller → service → repository`. Its repository reads runtime data from Node.js; real database repositories are added after selecting a database.

## Structure

```text
src/
├── config/          Environment configuration
├── controllers/     HTTP request and response handling
├── errors/          Application errors
├── middlewares/     Express middleware
├── repositories/    Database access layers
├── routes/          HTTP route definitions
├── services/        Business logic
├── app.js           Express configuration
└── server.js        HTTP server lifecycle
```

For a new feature, create `routes/<feature>/`, `controllers/<feature>/`, and `services/<feature>/`. Add the database adapter in `src/repositories/` after choosing a database.
