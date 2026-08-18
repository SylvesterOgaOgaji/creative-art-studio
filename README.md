# Creative Art Studio

> A browser-local 3D maker space where children can explore shapes, colour, light, texture, movement, and imaginative challenges.

Creative Art Studio is a React and Three.js learning project created during a collaborative training programme. It is designed as a private-by-default creative experience: no accounts, login, database, public profiles, advertising, or cloud storage are required. Artwork, favourites, sound preferences, badges, and tutorial progress stay in the browser that created them.

## Makers

**Created by Sylvester Oga Ogaji with student developers Simeon Ogaji, Samuel Ogaji, Daniel Ogaji, Michael Ogaji, and other learners in the training studio.**

## What children can do

| Area    | Current capabilities                                                                                            |
| ------- | --------------------------------------------------------------------------------------------------------------- |
| Create  | Add cubes, spheres, cones, cylinders, and toruses; directly move, rotate, and scale them.                       |
| Play    | Change colour, material, stickers, dots, stripes, checkerboard, glitter, lighting, and environments.            |
| Explore | Use optional sound, Surprise Me scenes, first-run guidance, and short creative challenges.                      |
| Keep    | Save browser-local worlds with thumbnails, favourites, badges, PNG export, search, rename, and delete controls. |
| Reflect | Review a real 14-day activity history of saved worlds and session reflections from the Educators route.         |

## Run locally from a fresh clone

```bash
corepack enable
pnpm install
pnpm dev
```

The app works without accounts, databases, external APIs, or a local configuration file. For development, the Express host defaults to port `3000`; provide `PORT` only when another local process already uses that port. `NODE_ENV=production` is set by the production container command. Platform-managed credentials are intentionally not required to run this browser-local MVP and are never committed to the repository. See [docs/environment.md](docs/environment.md) for the complete optional configuration contract and safe local examples.

To build and smoke-test the same production container used in CI, run:

```bash
docker build --tag creative-art-studio:local .
docker run --detach --name creative-art-studio-local --publish 3000:3000 creative-art-studio:local
curl --fail http://localhost:3000/healthz
curl --fail http://localhost:3000/metrics
docker rm --force creative-art-studio-local
```

Run the consolidated local quality gate with:

```bash
pnpm quality:ci
pnpm test:e2e
bash scripts/verify-fresh-clone.sh
```

The coverage gate enforces 70% for lines, statements, and branches, and 55% for functions.

## Architecture

| Layer               | Responsibility                                                                                                                                          |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| React interface     | Age-adaptive studio, gallery, classroom, family, educator, and maker routes.                                                                            |
| Creative engine     | React Three Fiber scene, object manipulation, materials, lighting, environments, textures, and procedural compositions.                                 |
| Browser-local state | Zustand scene history, gallery metadata, preferences, badges, session reflections, and aggregate activity history persisted to LocalStorage.            |
| Production delivery | A small Express server serves the built static application and exposes privacy-safe `GET /healthz` and `GET /metrics` endpoints for operational checks. |

The artwork model is structured data rather than a screenshot alone, so a saved composition can be reconstructed in the studio. The Educators route also includes a privacy-preserving activity report: its chart is derived only from actual save and reflection events, and it excludes titles, names, reflection text, images, tags, and scene coordinates. UI interactions and persistent artwork state are deliberately separated so a future optional storage provider can replace LocalStorage without rewriting the scene engine. The Three.js scene-object controls and Zustand scene builders live in focused modules so rendering and state construction can be tested independently.

## Tests and automation

The project uses Vitest with Testing Library for focused store, persistence, maker-shelf, inspector, canvas interaction, server error, health, and metrics coverage, plus Playwright for browser-level creative flows. Browser-local state is parsed with Zod before rehydration, so malformed saved data is ignored rather than merged into the creative engine. GitHub Actions installs from the lockfile and runs formatting, linting, type checking, unit tests with coverage thresholds, a no-cache fresh-clone install/build check, Chromium creative-flow tests, dependency freshness reporting, dependency review on pull requests, a production build, and a production-container smoke test on every push and pull request.

See [CONTRIBUTING.md](CONTRIBUTING.md) for the focused-change workflow and [CHANGELOG.md](CHANGELOG.md) for project release notes.
See [docs/architecture.md](docs/architecture.md) for the module boundaries, browser-local persistence contract, and intentional generated-debug policy.

## Browser-local data

The project uses LocalStorage for MVP persistence. Clearing browser site data clears saved creations, badges, favourites, settings, and tutorial progress. This is intentional for the current child-safety-focused, no-login version.

## Reuse

This project is released under the MIT License. You may clone, learn from, adapt, and build on it, provided the licence notice is retained. Please preserve the maker credits when sharing substantially derived versions.
