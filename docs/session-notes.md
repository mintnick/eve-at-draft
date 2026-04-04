# Session Notes

## Current status
- Working branch: `codex/refactor`
- Remote branch exists on GitHub and tracks `origin/codex/refactor`
- Phase 0 is complete
- Phase 1 is complete
- Refactor plan is saved in `docs/refactor-plan.md`
- Step-by-step checklist is saved in `docs/refactor-todo.md`
- Baseline and docs index are saved in `docs/current-baseline.md` and `docs/README.md`
- TypeScript, Vitest, and TS tooling support are in place
- Validation commands currently passing:
  - `yarn tools:validate`
  - `yarn typecheck`
  - `yarn test:run`
  - `yarn build`
- Phase 2 is the current next step

## Agreed direction
- Keep `Vue`
- Replace `Quasar` with `PrimeVue`
- Refactor toward a typed static app with generated tournament data
- Support drafting across historical tournament years
- Improve data pipeline, file structure, and i18n architecture
- Add text import/export and clipboard support

## Recommended next step
- Start Phase 2 from `docs/refactor-todo.md`
- First concrete implementation milestone:
  - install PrimeVue
  - replace Quasar bootstrapping
  - swap current screen components to PrimeVue or thin app-owned wrappers
  - keep the current layout and behavior stable during the framework migration

## Resume prompt
Use this in a future session:

`Open /Users/nick/Desktop/Projects/eve-at-draft on branch codex/refactor, read docs/refactor-plan.md, docs/refactor-todo.md, and docs/session-notes.md, then continue with Phase 2 and keep the current UI behavior stable while replacing Quasar with PrimeVue.`
