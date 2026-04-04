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
- Official tournament source references and future-session sourcing prompt are saved in `docs/tournament-source-notes.md`
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
  - `yarn test:run`
  - `yarn build`
- Phase 5 is the current next step
- Phase 5 has started:
- Phase 5 is now complete:
  - draft state and validation logic now live in `src/lib/rules/draft-engine.ts`
  - `DraftAction` is now explicit for pick, remove, ban, unban, and clear operations
  - derived draft metrics now cover points, ship count, hull counts, logistics usage, and flagship classification
  - `App.vue` is now a thin entry point that renders `src/app/AppShell.vue`
  - draft page rendering and styling now live under `src/features/draft/components/DraftScreen.vue`
  - invalid draft actions now surface visible localized feedback in the UI
  - draft engine tests now cover flagship classification, logistics cap enforcement, ban/pick conflicts, flagship uniqueness, ship-count cap, and hull-cap behavior

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
- Start Phase 6 from `docs/refactor-todo.md`
- First concrete implementation milestone:
  - introduce app state that separates tournament selection, draft state, and UI state
  - add year selection backed by the generated tournament index
  - reset and reload the draft state when the selected tournament changes

## Resume prompt
Use this in a future session:

`Open /Users/nick/Desktop/Projects/eve-at-draft on branch codex/refactor, read docs/refactor-plan.md, docs/refactor-todo.md, docs/session-notes.md, and docs/tournament-source-notes.md, then continue with Phase 6 by adding tournament year selection and separating tournament state from draft/UI state.`
