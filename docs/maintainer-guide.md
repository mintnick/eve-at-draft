# Maintainer Guide

## Architecture

- `src/app/` — app shell and top-level state
- `src/features/draft/` — draft screen and wiring
- `src/lib/rules/` — pure rules engine (points, hull caps, logistics, flagship, import/export)
- `src/lib/i18n/` — locale bootstrapping and ship label helpers
- `src/lib/preferences/` — cookie-backed locale and theme persistence
- `data/raw/<year>/` — fetched upstream artifacts and normalized raw source snapshot
- `data/generated/` — app-consumable yearly datasets, shared ship catalog, year index
- `tools/data-pipeline/` — fetch, build, and validate pipeline

## Supported tournament years

| Year | Label | Source |
|------|-------|--------|
| 2021 | Alliance Tournament XVII | Official rules post + Google Sheet static-values |
| 2022 | Alliance Tournament XVIII | Official rules post + Google Sheet static-values |
| 2023 | Alliance Tournament XIX | Official rules post + Google Sheet static-values |
| 2024 | Alliance Tournament XX | Official rules post + Google Sheet static-values |
| 2025 | Alliance Tournament XXI | Legacy snapshot + official rules references |

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
2. Fetch upstream artifacts: `tsx ./tools/data-pipeline/cli.ts fetch <year>`
3. Review `data/raw/<year>/source.json`. Add manual corrections to `data/raw/<year>/overrides.json` only where necessary — the pipeline treats a missing `overrides.json` the same as an empty one.
4. Build and validate: `tsx ./tools/data-pipeline/cli.ts build <year> && tsx ./tools/data-pipeline/cli.ts validate <year>`
5. Run `yarn typecheck`, `yarn test:run`, and `yarn build`.
6. Update `docs/tournament-source-notes.md` with the new year's source links.

## Source policy

- Prefer the official EVE Online rules post and linked official spreadsheet for a tournament year.
- Use ESI only for stable ship ids and localized names.
- Use `overrides.json` only for real source gaps or corrections.
- Keep fetched upstream artifacts checked in under `data/raw/<year>/sources/` so future sessions can audit what the dataset came from.

## Deferred work

- **Phase 8 UI polish** — layout refinement, responsive behavior, and visual hierarchy pass is intentionally incomplete and should get a focused later pass.
- **Data-pipeline unit tests** — coverage is lighter than app/rules layer; worth expanding when the pipeline is extended.
