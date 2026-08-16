# Repository Agents Guide

## Documentation-Only Administrator-Merge Policy

This repository adheres to the documentation-only administrator-merge policy defined in [docs/DOCS_MERGE.md](docs/DOCS_MERGE.md). 

- **Docs-Only Pull Requests:** Pull requests that modify only documentation files (such as files under `docs/`, `README.md`, `AGENTS.md`, etc.) do not require CI, unit tests, Cursor Bugbot, or other automated code-quality checks. Repository administrators may merge them after confirming the documentation-only scope.
- **Code or Mixed Changes:** Pull requests that modify application code, dependencies, configuration, or mix code and documentation changes retain all normal automated checks, reviews, and gating controls.
