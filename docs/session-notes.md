# Session Notes

## Current status
- Working branch: `codex/refactor`
- Remote branch exists on GitHub and tracks `origin/codex/refactor`
- Phase 0 is complete
- Phase 1 is complete
- Phase 2 is complete
- Phase 3 is complete
- Refactor plan is saved in `docs/refactor-plan.md`
- Step-by-step checklist is saved in `docs/refactor-todo.md`
- Baseline and docs index are saved in `docs/current-baseline.md` and `docs/README.md`
- TypeScript, Vitest, and TS tooling support are in place
- PrimeVue now replaces Quasar in the app shell and current draft screen
- The app now reads from `data/generated/2025.json` instead of the legacy flat ship dataset
- `tools/migrate-legacy-data.ts` generates the current yearly dataset and `data/generated/index.json`
- Validation commands currently passing:
  - `yarn data:migrate-legacy`
  - `yarn tools:validate`
  - `yarn typecheck`
  - `yarn test:run`
  - `yarn build`
- Phase 4 is the current next step

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
- Start Phase 4 from `docs/refactor-todo.md`
- First concrete implementation milestone:
  - extend the current migration script into a real fetch/normalize pipeline
  - add validation for duplicates, translations, hull mappings, and rule integrity
  - generate the current tournament dataset through the new pipeline contract
  - document the refresh flow for adding future tournament years

## Resume prompt
Use this in a future session:

`Open /Users/nick/Desktop/Projects/eve-at-draft on branch codex/refactor, read docs/refactor-plan.md, docs/refactor-todo.md, and docs/session-notes.md, then continue with Phase 4 by turning the current legacy migration into the real data fetch/normalize pipeline.`
