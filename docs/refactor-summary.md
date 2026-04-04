# Refactor Summary

## What changed

The app was refactored from a single-year, view-heavy Vue page into a typed multi-year static app with:

- a reusable rules engine under `src/lib/rules/`
- app-level state and year selection under `src/app/`
- feature-level draft state wiring under `src/features/draft/`
- generated yearly tournament datasets under `data/generated/`
- raw upstream captures plus normalization tooling under `data/raw/` and `tools/data-pipeline/`
- a dedicated i18n structure and preferences utility under `src/lib/i18n/` and `src/lib/preferences/`
- plain-text draft import/export with clipboard support

## Current supported tournament years

- 2025: Alliance Tournament XXI
- 2024: Alliance Tournament XX

The app now switches between bundled tournament years through the generated index and resets draft state cleanly when the selected year changes.

## Historical data approach

- 2025 currently uses the repo’s legacy raw snapshot path with official rules references.
- 2024 is built from the official EVE Online rules post and the official Google Sheet static-values tab, then enriched with ESI ids and localized names.
- Cross-year ship metadata is normalized into `data/generated/ship-catalog.json`.

## Testing status

Current validation coverage includes:

- rule-engine behavior
- codec round-trips and invalid payloads
- UI drafting flow
- UI illegal-action feedback
- year switching
- import success
- failed import without state corruption

Latest validation commands passing:

```bash
yarn typecheck
yarn test:run
yarn build
tsx ./tools/data-pipeline/cli.ts validate 2024
```

## Deferred follow-up

- Phase 8 UI polish is intentionally incomplete and should get a later focused pass.
- Data-pipeline unit tests are still lighter than app/rules coverage.
- Legacy-file cleanup should continue only where the remaining files are clearly unused by the current app or pipeline.
