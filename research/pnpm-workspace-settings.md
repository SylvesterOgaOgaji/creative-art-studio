# pnpm workspace configuration reference

The pnpm 10 settings documentation confirms that workspace-level settings, including dependency overrides and patched dependencies, belong in `pnpm-workspace.yaml` rather than the package manifest. This repository keeps its Wouter patch declaration in the workspace file and validates its lockfile through a frozen install.

The documentation also confirms that overrides apply only from the project root and that parent-qualified selectors such as `express@4>path-to-regexp` can constrain an override to a particular dependency path. The project does not currently need such an override: an unused dependency was removed and the direct Express dependency was updated to resolve the previously reported high-severity production paths cleanly.

## Source

[1] [pnpm 10 settings — workspace configuration](https://pnpm.io/10.x/settings)
