# Session Notes

## Current status
- Working branch: `codex/refactor`
- Remote branch exists on GitHub and tracks `origin/codex/refactor`
- Phase 0 is complete
- Phase 1 is complete
- Phase 2 is complete
- Refactor plan is saved in `docs/refactor-plan.md`
- Step-by-step checklist is saved in `docs/refactor-todo.md`
- Baseline and docs index are saved in `docs/current-baseline.md` and `docs/README.md`
- TypeScript, Vitest, and TS tooling support are in place
- PrimeVue now replaces Quasar in the app shell and current draft screen
- Validation commands currently passing:
  - `yarn tools:validate`
  - `yarn typecheck`
  - `yarn test:run`
  - `yarn build`
- Phase 3 is the current next step

## Agreed direction
- Keep `Vue`
- Replace `Quasar` with `PrimeVue`
- Refactor toward a typed static app with generated tournament data
- Support drafting across historical tournament years
- Improve data pipeline, file structure, and i18n architecture
- Add text import/export and clipboard support

## Recommended next step
- Start Phase 3 from `docs/refactor-todo.md`
- First concrete implementation milestone:
  - define the canonical yearly tournament dataset schema
  - define the generated year index format
  - move the current dataset into the new schema as the first migrated year
  - document where overrides will live for future historical data fixes

## Resume prompt
Use this in a future session:

`Open /Users/nick/Desktop/Projects/eve-at-draft on branch codex/refactor, read docs/refactor-plan.md, docs/refactor-todo.md, and docs/session-notes.md, then continue with Phase 3 by defining the yearly tournament dataset model and migrating the current data into it.`
