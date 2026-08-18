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

## Run locally from a fresh clone

```bash
corepack enable
pnpm install
pnpm dev
```

The app works without accounts, databases, or external services, so a normal local clone requires no environment file. The optional development storage proxy recognizes `BUILT_IN_FORGE_API_URL` and `BUILT_IN_FORGE_API_KEY`; leave it unused unless you intentionally configure that isolated development feature.

Run the full local quality gate with:

```bash
pnpm check
pnpm test
pnpm test:e2e
pnpm build
pnpm format:check
pnpm audit:production
```

## Architecture

| Layer               | Responsibility                                                                                                          |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| React interface     | Age-adaptive studio, gallery, classroom, family, educator, and maker routes.                                            |
| Creative engine     | React Three Fiber scene, object manipulation, materials, lighting, environments, textures, and procedural compositions. |
| Browser-local state | Zustand scene history, gallery metadata, preferences, badges, and session reflections persisted to LocalStorage.        |
| Production delivery | A small Express server serves the built static application and exposes `GET /healthz` for operational checks.           |

The artwork model is structured data rather than a screenshot alone, so a saved composition can be reconstructed in the studio. UI interactions and persistent artwork state are deliberately separated so a future optional storage provider can replace LocalStorage without rewriting the scene engine.

## Tests and automation

The project uses Vitest with Testing Library for focused unit and integration coverage, plus Playwright for a browser-level creative flow. The browser test opens a fresh studio, creates and colours a shape, saves it locally, verifies the gallery card, and restores the saved world. GitHub Actions installs from the lockfile and runs formatting, type checking, unit tests, the Chromium creative-flow test, and the production build on every push and pull request.

See [CONTRIBUTING.md](CONTRIBUTING.md) for the focused-change workflow and [CHANGELOG.md](CHANGELOG.md) for project release notes.

## Browser-local data

The project uses LocalStorage for MVP persistence. Clearing browser site data clears saved creations, badges, favourites, settings, and tutorial progress. This is intentional for the current child-safety-focused, no-login version.

## Reuse

This project is released under the MIT License. You may clone, learn from, adapt, and build on it, provided the licence notice is retained. Please preserve the maker credits when sharing substantially derived versions.
