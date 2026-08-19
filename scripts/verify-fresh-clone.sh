#!/usr/bin/env bash
set -euo pipefail

# This script intentionally uses the committed lockfile and installs the browser
# dependency explicitly so it is valid on a machine with no prior Playwright cache.
pnpm install --frozen-lockfile
pnpm exec playwright install --with-deps chromium
pnpm test:coverage
pnpm build
pnpm verify:production-assets
pnpm test:e2e
