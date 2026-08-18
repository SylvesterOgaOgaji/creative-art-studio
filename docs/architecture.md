# Creative Art Studio architecture

Creative Art Studio is a browser-local React application designed to make the core creative journey reliable without collecting personal information. The central design boundary is between the **creative engine**, which holds structured scene data, and the **interface**, which adapts the same engine for Explorer, Creator, and Designer modes.

| Layer                | Location                                                            | Responsibility                                                                                         |
| -------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Application routes   | `client/src/App.tsx`, `client/src/pages/`                           | Keeps the public field-journal routes light while lazy-loading the Three.js studio entry.              |
| Creative interface   | `client/src/components/studio/`                                     | Presents the maker shelf, canvas, inspector, gallery, tutorial, and reflection flow.                   |
| Creative state       | `client/src/store/useStudioStore.ts`                                | Owns reversible scene changes, saved artwork metadata, age preferences, and browser-local actions.     |
| Data boundaries      | `client/src/types/studio.ts`, `client/src/lib/studioPersistence.ts` | Defines structured scene records and validates LocalStorage before persistence is merged into the app. |
| Gallery organization | `client/src/lib/galleryOrganization.ts`                             | Provides independently tested folder, tag, search, and favourites filtering logic.                     |
| Production host      | `server/index.ts`                                                   | Serves the static bundle and exposes `GET /healthz`; it does not receive artwork data.                 |

## Persistence and privacy

Artwork configurations, gallery metadata, settings, and the most recent short reflection are stored only in the current browser’s LocalStorage. The persistence parser treats that data as untrusted: malformed payloads are ignored, and compatible earlier object records receive safe defaults for later-added texture and sticker fields. No account, analytics, public sharing, location, or server-side artwork storage is included in this release.

## Quality boundaries

`pnpm format:check`, `pnpm lint`, `pnpm check`, `pnpm test:coverage`, `pnpm test:e2e`, `pnpm audit:production`, and `pnpm build` form the local quality sequence. The CI workflow runs the corresponding checks on clean lockfile installations. Generated Manus browser-debug instrumentation is intentionally excluded from application linting and formatting because it is runtime support code, not authored studio logic.
