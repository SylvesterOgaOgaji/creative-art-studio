# Changelog

All notable project changes are documented here.

## Unreleased

- Added an enforced ESLint gate, core-coverage threshold, focused studio component tests, and persisted-state schema tests.
- Added safe Zod validation at the browser LocalStorage rehydration boundary, rejecting malformed scene data while preserving compatible saved worlds.
- Added a compose-based production startup path and expanded fresh-clone, quality-gate, and environment guidance.
- Added automated coverage for core browser-local studio actions, reusable field errors, and the production health endpoint.
- Added GitHub Actions quality checks, weekly dependency update configuration, an isolated Docker build, and clearer fresh-clone setup guidance.
- Removed unused production dependencies and added an enforced high-severity production dependency audit.
- Removed unused `streamdown` and updated the static server to Express 5.2.1, leaving the production dependency audit with no known high-severity findings.
- Added `GET /healthz` to the static production server.

## Initial Studio Release

- Delivered the browser-local React Three Fiber maker studio, gallery, educator and family materials, classroom starters, age-adaptive controls, and accessibility-minded guidance.
