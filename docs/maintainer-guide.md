# Maintainer Guide

## Repo shape

- `src/` contains the app shell, draft feature, rules engine, i18n, and preferences code.
- `data/raw/<year>/` stores fetched upstream artifacts and the normalized raw source snapshot for a tournament year.
- `data/generated/` stores app-consumable yearly datasets, the shared ship catalog, and the year index.
- `tools/data-pipeline/` contains the fetch, build, and validate pipeline.

## Common commands

Install and run:

```bash
yarn
yarn dev
```

Validation:

```bash
yarn typecheck
yarn test:run
yarn build
```

Default 2025 data refresh:

```bash
yarn data:refresh
```

Explicit per-year pipeline usage:

```bash
tsx ./tools/data-pipeline/cli.ts fetch 2024
tsx ./tools/data-pipeline/cli.ts build 2024
tsx ./tools/data-pipeline/cli.ts validate 2024
```

## Adding or refreshing a tournament year

1. Add or update the year entry in `tools/data-pipeline/config.ts`.
2. Fetch upstream artifacts into `data/raw/<year>/sources/`.
3. Review `data/raw/<year>/source.json` and `data/raw/<year>/overrides.json`.
4. Build the generated dataset.
5. Validate the generated outputs.
6. Run `yarn typecheck`, `yarn test:run`, and `yarn build`.
7. Update `README.md`, `docs/tournament-source-notes.md`, `docs/refactor-todo.md`, and `docs/session-notes.md` if the supported years or pipeline behavior changed.

## Source policy

- Prefer the official EVE Online rules post and linked official spreadsheet for a tournament year.
- Use ESI only for stable ship ids and localized names.
- Use `overrides.json` only for real source gaps or corrections.
- Keep fetched upstream artifacts checked in under `data/raw/<year>/sources/` so future sessions can audit what the dataset came from.
