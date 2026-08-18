#!/usr/bin/env bash
set -euo pipefail

pnpm install --frozen-lockfile
pnpm test:coverage
pnpm build
