# Contributing to Creative Art Studio

Creative Art Studio is maintained as a child-safe, browser-local creative tool. Contributions should preserve the no-login, no-tracking, no-public-sharing MVP boundary unless the project direction explicitly changes.

## Local workflow

Use Node 22 and pnpm. Start from a clean clone, run `corepack enable`, and run `pnpm install`. The normal browser-local studio needs no environment configuration. The development-only storage proxy is optional and recognizes `BUILT_IN_FORGE_API_URL` and `BUILT_IN_FORGE_API_KEY` only when deliberately configured. For the production-shaped local host, run `docker compose up --build` and check `http://localhost:3000/healthz`.

Before opening a pull request, run `pnpm format:check`, `pnpm lint`, `pnpm check`, `pnpm test:coverage`, `pnpm test:e2e`, `pnpm audit:production`, and `pnpm build`. New behaviour should include a focused automated test wherever the behaviour can be exercised without a live browser session.

## Change history

Keep changes small and intention-revealing. Each commit should address one feature, correction, documentation update, or refactor; avoid combining broad formatting changes with behavioural work. Describe accessible interaction changes clearly and include screenshots when a visual change affects the studio experience.

## Child safety and privacy

Do not add accounts, targeted analytics, public profiles, direct messages, location collection, or social sharing without explicit product and safeguarding approval. Never put personal details or sample child data in tests, screenshots, fixtures, or local storage seeds.
