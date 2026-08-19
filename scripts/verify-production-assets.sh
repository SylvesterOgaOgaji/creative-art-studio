#!/usr/bin/env bash
set -euo pipefail

DIST_PUBLIC="${1:-dist/public}"

if [[ ! -f "$DIST_PUBLIC/index.html" ]]; then
  echo "Expected production index at $DIST_PUBLIC/index.html" >&2
  exit 1
fi

if find "$DIST_PUBLIC" -type f -name 'debug-collector.js' -print -quit | grep -q .; then
  echo "Generated debug collector must not be shipped in $DIST_PUBLIC" >&2
  exit 1
fi

echo "Production asset check passed: generated debug collector is absent from $DIST_PUBLIC."
