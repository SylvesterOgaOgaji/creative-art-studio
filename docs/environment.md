Creative Art Studio is intentionally usable from a fresh clone with no environment variables. Its artwork, gallery, preferences, and session data live in the browser’s LocalStorage, and the production server only needs `PORT` when a non-default port is required. Copy `.env.example` to `.env` when you want a documented starting point; every value is optional for the browser-local MVP.

| Variable                      | Required | Purpose                                                                                                |
| ----------------------------- | -------: | ------------------------------------------------------------------------------------------------------ |
| `PORT`                        |       No | Changes the static server port; it defaults to `3000`.                                                 |
| `NODE_ENV`                    |       No | Selects standard development or production runtime behaviour.                                          |
| `LOG_LEVEL`                   |       No | Sets the Pino log level for the production-shaped Express host; it defaults to `info`.                 |
| `BUILT_IN_FORGE_API_URL`      |       No | Reserved platform endpoint. It is not read by the browser-local MVP.                                   |
| `BUILT_IN_FORGE_API_KEY`      |       No | Reserved platform credential. It is not read by the browser-local MVP; never commit a real key.        |
| `VITE_FRONTEND_FORGE_API_URL` |       No | Optional Forge proxy endpoint for the map integration; leave blank for offline-first operation.        |
| `VITE_FRONTEND_FORGE_API_KEY` |       No | Optional browser map credential; the map does not request an external script when it is blank.         |
| `ERROR_TRACKING_FILE`         |       No | Optional local JSONL error-tracking path; leave blank to disable the sink without an external account. |

> Do not add child, student, or educator information to environment files. No secret is needed for the core creative workflow, and `.env` remains ignored by Git.

For a custom local port, run `PORT=4173 pnpm dev`. For a production-shaped local host without manually setting values, run `docker compose up --build`. The service binds the container’s port `3000` to `${PORT:-3000}` on the host and exposes `GET /healthz`. When `ERROR_TRACKING_FILE` is configured, unhandled server errors are appended as structured JSONL records; no external account is required by default.

## Clean-machine verification

From a fresh clone with no existing project dependencies, run the following sequence:

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm exec playwright install --with-deps chromium
pnpm test:coverage
pnpm build
pnpm verify:production-assets
pnpm test:e2e
```

The equivalent repository check is `bash scripts/verify-fresh-clone.sh`. It runs the frozen install, installs the pinned browser dependency, executes coverage before the build, verifies the production asset boundary, and completes the Playwright creative flow against a production-shaped preview server. The `verify:production-assets` step confirms that development-only Manus debug instrumentation is absent from `dist/public`. A known-good verification record is maintained in [`docs/fresh-clone-verification.md`](fresh-clone-verification.md); refresh it when the toolchain or command sequence changes.
