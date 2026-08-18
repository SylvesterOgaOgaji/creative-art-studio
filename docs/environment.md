# Local configuration

Creative Art Studio is intentionally usable from a fresh clone with no environment variables. Its artwork, gallery, preferences, and session data live in the browser’s LocalStorage, and the production server only needs `PORT` when a non-default port is required.

| Variable                 | Required | Purpose                                                                                        |
| ------------------------ | -------: | ---------------------------------------------------------------------------------------------- |
| `PORT`                   |       No | Changes the static server port; it defaults to `3000`.                                         |
| `NODE_ENV`               |       No | Selects standard development or production runtime behaviour.                                  |
| `BUILT_IN_FORGE_API_URL` |       No | Enables the optional development storage-proxy endpoint when paired with a valid key.          |
| `BUILT_IN_FORGE_API_KEY` |       No | Authentication for the optional development storage-proxy endpoint. Never commit a real value. |

> Do not add child, student, or educator information to environment files. No secret is needed for the core creative workflow.
