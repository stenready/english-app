# Contributing

← [Full-stack App](./README.en.md)

[Українська](./CONTRIBUTING.md) | **English**

Thanks for wanting to help! The project is a learning one and open — any contribution is welcome: code, reviews, advice, testing.

## Where to start

- **Starter tasks** — issues labeled [`good first issue`](https://github.com/stenready/english-app/labels/good%20first%20issue).
- **An idea or a question** — open an issue or write in the Telegram chat.
- **Code review** — comments on any commit or pull request help a lot too.

## Running the project

How to run all the parts — see the [README](./README.en.md#quick-start).

## Pull requests

1. Fork the repository and create a branch from `main`.
2. Make your changes following the [project rules](./admin-panel/README.en.md#rules).
3. Check the part you changed:

   ```bash
   npm run typecheck && npm run lint && npm run format:check
   ```

4. Open a pull request with a short description: what was changed and why.

## Commits

```
feat(admin-panel): short description
fix(backend-node-app): short description
```

|       | Value                                                                                         |
| ----- | --------------------------------------------------------------------------------------------- |
| Type  | `feat` or `fix`                                                                               |
| Scope | `admin-panel`, `client-app`, `backend-node-app`, or `root` — for files in the repository root |

## Documentation

Docs are in two languages: `*.md` — Ukrainian (primary), `*.en.md` — English. Changed one — update the other.

## License

By submitting changes, you agree that they are distributed under the [MIT](./LICENSE) license.
