# Session Notes

## Current status
- Working branch: `codex/refactor`
- Remote branch exists on GitHub and tracks `origin/codex/refactor`
- Phase 0 is complete
- Phase 1 is complete
- Phase 2 is complete
- Phase 3 is complete
- Phase 4 is complete
- Refactor plan is saved in `docs/refactor-plan.md`
- Step-by-step checklist is saved in `docs/refactor-todo.md`
- Baseline and docs index are saved in `docs/current-baseline.md` and `docs/README.md`
- TypeScript, Vitest, and TS tooling support are in place
- PrimeVue now replaces Quasar in the app shell and current draft screen
- The app now reads from `data/generated/2025.json` instead of the legacy flat ship dataset
- The app resolves ship names through `data/generated/ship-catalog.json`
- The TypeScript pipeline now owns fetch/build/validate flow via `yarn data:fetch`, `yarn data:build`, `yarn data:validate`, and `yarn data:refresh`
- `data/raw/2025/source.json` is now the raw snapshot input for the current generated outputs
- `data/raw/2025/sources/` now stores upstream artifacts from the official rules page and ESI endpoints
- Validation commands currently passing:
  - `yarn data:refresh`
  - `yarn tools:validate`
  - `yarn typecheck`
  - `yarn test:run`
  - `yarn build`
- Phase 5 is the current next step

## Agreed direction
- Keep `Vue`
- Replace `Quasar` with `PrimeVue`
- Refactor toward a typed static app with generated tournament data
- Support drafting across historical tournament years
- Improve data pipeline, file structure, and i18n architecture
- Add text import/export and clipboard support
- Treat ship identity and localized ship names as shared cross-year data rather than duplicating them in yearly datasets
- Reduce `App.vue` responsibility by splitting page logic, presentation, and styles into clearer modules
- Add an explicit later UI polish pass; framework migration alone is not considered sufficient visual cleanup
- Optional future idea: support historic team draft presets, likely starting with champions, if data sourcing is practical

## Recommended next step
- Start Phase 5 from `docs/refactor-todo.md`
- First concrete implementation milestone:
  - extract draft rules and derived state out of `App.vue`
  - break up page logic, presentation, and styles into app/feature modules
  - keep current drafting behavior stable while moving logic into pure rule-engine utilities
  - prepare the app for later multi-year state and import/export features

## Resume prompt
Use this in a future session:

`Open /Users/nick/Desktop/Projects/eve-at-draft on branch codex/refactor, read docs/refactor-plan.md, docs/refactor-todo.md, and docs/session-notes.md, then continue with Phase 5 by extracting the draft rules and reducing App.vue responsibilities.`
