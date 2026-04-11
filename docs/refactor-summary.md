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

- 2021: Alliance Tournament XVII
- 2022: Alliance Tournament XVIII
- 2023: Alliance Tournament XIX
- 2024: Alliance Tournament XX
- 2025: Alliance Tournament XXI

The app now switches between bundled tournament years through the generated index and resets draft state cleanly when the selected year changes.

## Historical data approach

- 2021, 2022, and 2023 are built from official EVE Online rules posts plus official Google Sheet static-values tabs.
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

## Historical Match Data Decision

- Historical champion or team draft presets are not being ingested into the app for now.
- The practical public archive for historic match compositions is EVE_NT, not CCP’s main site.
- The chosen product direction is to add per-year external match-archive links instead of trying to name and maintain a large preset library.
- The app now exposes those per-year `Match Archive` links directly from the tournament header.
