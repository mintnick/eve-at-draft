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
- The app now exposes `data/generated/2021.json` through `data/generated/2025.json` through the generated year index
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
- Phase 5 is now complete:
  - draft state and validation logic now live in `src/lib/rules/draft-engine.ts`
  - `DraftAction` is now explicit for pick, remove, ban, unban, and clear operations
  - derived draft metrics now cover points, ship count, hull counts, logistics usage, and flagship classification
  - `App.vue` is now a thin entry point that renders `src/app/AppShell.vue`
  - draft page rendering and styling now live under `src/features/draft/components/DraftScreen.vue`
  - invalid draft actions now surface visible localized feedback in the UI
  - draft engine tests now cover flagship classification, logistics cap enforcement, ban/pick conflicts, flagship uniqueness, ship-count cap, and hull-cap behavior
- Phase 6 is now complete:
  - app-level state now separates tournament selection, draft reset state, and UI preferences in `src/app/useAppState.ts`
  - the app now reads available tournament years from `data/generated/index.json`
  - the app shell can switch the active tournament dataset by selected year
  - changing the selected tournament resets the current draft screen instance cleanly
  - the draft UI remains connected to the extracted rules engine through the selected dataset
- Phase 7 is now complete:
  - locale bootstrapping now lives under `src/lib/i18n/`
  - app UI messages now live in dedicated i18n message files separate from ship labels
  - tournament and ship label lookup now go through i18n label helpers
  - cookie-backed locale and theme persistence now live in `src/lib/preferences/index.ts`
  - view components no longer read or write cookies directly for language or theme
  - the header now uses a locale selector instead of hardcoded language buttons, which scales cleanly for future locale additions
- Phase 8 has started, but is intentionally not finished:
  - top-level layout, panel styling, points summary, and ship row presentation received a first polish pass
  - responsive behavior for the header and draft layout was improved
  - deeper UI/detail tuning is deferred for a later pass before Phase 8 is marked complete
- Phase 9 is now complete:
  - the `EVE-AT-DRAFT v1` text codec now lives in `src/lib/rules/draft-codec.ts`
  - codec entries now preserve hull type explicitly, so flagship ships round-trip correctly even when the same ship key also exists in another hull bucket
  - drafts can be exported to clipboard from the app shell
  - drafts can be pasted/imported through a dialog with visible parse and validation feedback
  - import now restores both tournament year and draft state from one payload
  - codec tests now cover format parsing, serialization, and import materialization
  - the hull-type tab list was corrected back to a vertical column after the recent UI pass
- Phase 10 has started:
  - component-level integration tests now cover legal drafting flow, illegal flagship feedback, clipboard export, import success, year switching, and failed-import state preservation
  - test setup now includes the browser mocks PrimeVue needs in jsdom (`ResizeObserver`, `matchMedia`, and teleports)
  - the import dialog failure during testing was a harness issue caused by teleported PrimeVue dialog content, not an app-side import bug
  - a real import acceptance bug was fixed: failed imports are now validated against the target tournament year before the app switches years or resets draft state
  - rule-engine coverage now includes historical multi-year dataset assertions
  - full test suite is currently passing with 20 tests across codec, rules, state, and UI layers
- Historical year support is now live for 2024:
  - `tools/data-pipeline/config.ts` now includes 2024 and 2025 tournament configs
  - 2024 is fetched from the official Alliance Tournament XX rules post plus the official Google Sheet static-values tab (`gid=284772315`)
  - the generated year index now lets the app switch cleanly between 2024 and 2025
  - 2024-specific rule metadata is now data-driven, including the higher non-logistics hull caps and duplicate-ship inflation metadata
- Historical year support now extends back to 2021:
  - `2021`, `2022`, and `2023` are now generated from official CCP rules posts plus official Google Sheet static-values tabs
  - the static-values parser now supports both the newer 9-column sheet layout and the older 8-column layout used by ATXVII through ATXIX
  - the earliest trustworthy official-source tournament data currently bundled is 2021
- Historical team drafts will not be ingested as app presets for now:
  - EVE_NT was identified as the most useful public archive for match-level historical lineups
  - we are intentionally choosing per-year external archive links over importing champion or team draft presets into the app
  - this avoids a large naming and curation problem while still giving interested users a direct path to historic match comps
  - the draft header now surfaces a per-year `Match Archive` link that opens the corresponding EVE_NT tournament page
- Phase 11 has started:
  - `README.md` now documents the multi-year app, validation commands, and per-year pipeline usage
  - `docs/maintainer-guide.md` now documents refresh and backfill workflow for tournament years
  - placeholder internal README files were updated to describe the current structure instead of future-tense refactor intent
  - `docs/refactor-summary.md` now captures the resulting architecture, supported years, validation status, and deferred follow-up work
  - generated artifact and ignore-rule review is complete; raw upstream captures and generated tournament datasets are intentionally tracked, while transient build outputs remain ignored

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
- Continue Phase 11 from `docs/refactor-todo.md`
- First concrete implementation milestone:
  - remove or quarantine any remaining deprecated legacy files that are no longer part of the new pipeline or app path
  - decide whether any remaining scaffold README files should stay or be folded into root/docs documentation
  - keep 2021 as the current earliest bundled year unless an older official ship-level source is recovered later
  - continue cleanup and close out Phase 11 once the remaining legacy-file pass is done

## Resume prompt
Use this in a future session:

`Open /Users/nick/Desktop/Projects/eve-at-draft on branch codex/refactor, read docs/refactor-plan.md, docs/refactor-todo.md, docs/session-notes.md, docs/refactor-summary.md, docs/maintainer-guide.md, and docs/tournament-source-notes.md, then continue with Phase 11 by doing the last legacy-file cleanup pass and deciding whether Checkpoint I can be closed.`
