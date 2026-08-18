#!/usr/bin/env bash
set -euo pipefail

DIST_PUBLIC="${1:-dist/public}"
if [[ ! -f "$DIST_PUBLIC/index.html" ]]; then
  echo "Expected production index at $DIST_PUBLIC/index.html" >&2
  exit 1
fi

if find "$DIST_PUBLIC" -type f \( -name 'debug-collector.js' -o -path '*/debug-collector/*' \) -print -quit | grep -q .; then
  echo "Generated debug collector files must not be shipped in $DIST_PUBLIC" >&2
  exit 1
fi

if grep -R --binary-files=without-match -E '__manus__/debug-collector|debug-collector' "$DIST_PUBLIC" >/dev/null 2>&1; then
  echo "Production assets must not reference development debug instrumentation" >&2
  exit 1
fi

echo "Production asset check passed: generated debug instrumentation is absent from $DIST_PUBLIC."
