# Local configuration

Creative Art Studio is intentionally usable from a fresh clone with no environment variables. Its artwork, gallery, preferences, and session data live in the browser’s LocalStorage, and the production server only needs `PORT` when a non-default port is required. This managed project does not permit committing an `.env.example` file; this document is the safe configuration template instead.

| Variable                 | Required | Purpose                                                                                         |
| ------------------------ | -------: | ----------------------------------------------------------------------------------------------- |
| `PORT`                   |       No | Changes the static server port; it defaults to `3000`.                                          |
| `NODE_ENV`               |       No | Selects standard development or production runtime behaviour.                                   |
| `BUILT_IN_FORGE_API_URL` |       No | Reserved platform endpoint. It is not read by the browser-local MVP.                            |
| `BUILT_IN_FORGE_API_KEY` |       No | Reserved platform credential. It is not read by the browser-local MVP; never commit a real key. |

> Do not add child, student, or educator information to environment files. No secret is needed for the core creative workflow.

For a custom local port, run `PORT=4173 pnpm dev`. For a production-shaped local host without manually setting values, run `docker compose up --build`. The service binds the container’s port `3000` to `${PORT:-3000}` on the host and exposes `GET /healthz`.
