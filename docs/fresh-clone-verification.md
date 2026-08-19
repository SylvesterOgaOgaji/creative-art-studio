# Fresh-clone verification record

This record documents the full reproducibility path executed against the repository after the robustness, test, collector, and CI-hardening changes.

| Check                           | Result | Evidence                                                                                                   |
| ------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------- |
| Frozen dependency install       | Passed | `pnpm install --frozen-lockfile` completed with the committed lockfile.                                    |
| Browser dependency installation | Passed | `pnpm exec playwright install --with-deps chromium` completed successfully.                                |
| Unit tests with coverage        | Passed | 26 test files and 72 tests passed.                                                                         |
| Production build                | Passed | Vite and the server bundle completed successfully.                                                         |
| Production asset boundary       | Passed | `pnpm verify:production-assets` confirmed that modular debug instrumentation is absent from `dist/public`. |
| Browser end-to-end tests        | Passed | 3 Chromium tests passed in 24.5 seconds.                                                                   |

The resulting aggregate Vitest report was **84.69% lines/statements**, **72.66% functions**, and **78.81% branches** for the expanded coverage include set. The repository thresholds remain enforced at 70% lines, 70% statements, 55% functions, and 70% branches. The expanded set now explicitly includes the tested Home workflow, scene renderer, gallery slice, and history slice instead of leaving those modules outside the enforced report.

The build still emits a non-blocking warning for a minified chunk larger than 500 kB. This is a performance optimization opportunity rather than a correctness failure; the existing manual chunking keeps the Three.js runtime separated from the application shell.

To refresh this record after a toolchain change, run:

```bash
bash scripts/verify-fresh-clone.sh
```
