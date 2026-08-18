# Changelog

All notable project changes are documented here.

## Unreleased

- Added a real browser-local Educators activity report with a 14-day chart of saved worlds and session reflections; legacy saved worlds are backfilled from their existing timestamps without fabricated activity.
- Added bounded, Zod-validated aggregate activity history to LocalStorage and included the same metrics in anonymized educator JSON exports without titles, reflection text, images, tags, or scene coordinates.
- Added request IDs, stack-aware structured server errors, a safe client-facing `internal_error` response, and focused coverage for the error-handling contract.
- Added a committed `.env.example` and aligned configuration documentation for fresh-clone setup.
- Added an explicit reusable `server/health.ts` handler and strengthened its direct contract tests so the operational endpoint is statically discoverable.
- Added a no-cache `scripts/verify-fresh-clone.sh` check, dependency-freshness artifact, and required clean-checkout quality gate in GitHub Actions.
- Extracted Three.js scene objects and Zustand scene builders into focused modules, added paired tests, and raised the enforced coverage baseline to 70% lines/statements/branches and 55% functions.

## 1.0.1 - 2026-08-18

- Added explicit environment documentation and independently discoverable clean-install, format, lint, typecheck, coverage, browser-flow, security-audit, and build checks in CI.
- Expanded focused unit coverage for image export, opt-in sound, sidebar state, server health, structured logging, and browser-local studio actions; the enforced coverage floor is now 70% for lines/statements/branches and 55% for functions.
- Added privacy-aware structured request and error logging to the static server without logging client artwork or personal information.
- Split browser-local gallery, history, classroom starter, and gallery-control responsibilities into focused modules, reducing the central store and gallery drawer below the 500-line review threshold.

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
