# Refactor TODO

This checklist turns the refactor plan into reviewable implementation steps. Each section should be completed and reviewed before moving to the next one.

## Phase 0: Guardrails and baseline
- [x] Confirm the current app behavior on `codex/refactor` before changes begin.
- [x] Capture a short baseline note of current UX and known rule behavior from the existing app.
- [x] Decide whether to keep the current visual layout as the migration baseline, or allow minor layout cleanup during the framework swap.
- [x] Add or update basic project docs so the refactor structure is discoverable from the repo root.

## Phase 1: Tooling and project structure
- [x] Introduce the target folder structure for app code, shared libraries, data, and tooling.
- [x] Add TypeScript support for the Vite app.
- [x] Add TypeScript support for build-time scripts and shared types.
- [x] Establish a testing setup for unit and integration tests.
- [x] Add the first pass of shared domain types for tournament data, draft state, and rule evaluation.
- [x] Keep the app build passing during the structure migration.

## Phase 2: PrimeVue migration foundation
- [x] Install PrimeVue and remove Quasar from the bootstrapping path.
- [x] Replace Quasar app setup in the entrypoint with PrimeVue setup.
- [x] Identify the minimum component primitives needed for the current UI:
  - [x] buttons
  - [x] tabs
  - [x] select/year picker
  - [x] message or toast feedback
  - [x] dialog or modal if needed for import/export
- [x] Replace Quasar usage in the current screen with PrimeVue or app-owned wrapper components.
- [x] Preserve the existing functional layout during the framework migration.
- [x] Remove leftover Quasar-specific code and styles once the page is stable.

## Phase 3: Data model redesign
- [x] Define the canonical schema for a yearly tournament dataset.
- [x] Define the generated index format for listing available tournament years.
- [x] Separate raw source inputs from generated normalized outputs.
- [x] Decide and document where manual overrides live for broken or incomplete upstream data.
- [x] Move current single-year data into the new schema as the first migrated dataset.
- [x] Ensure ship localization data is represented inside the tournament dataset model.
- [x] Revise the schema so ship identity and localized names live in a shared cross-year ship catalog instead of being duplicated per year.

## Phase 4: Data pipeline consolidation
- [x] Replace the current scattered Python scripts with a unified TypeScript data pipeline.
- [x] Implement fetch commands for upstream source collection.
- [x] Implement normalization from upstream/raw inputs into the canonical yearly schema.
- [x] Generate and validate a shared ship catalog reused across all tournament years.
- [x] Implement override merging for exceptional data fixes.
- [x] Implement validation checks for:
  - [x] duplicate ship ids
  - [x] missing required translations
  - [x] invalid hull mappings
  - [x] broken rule definitions
- [x] Generate the first app-consumable tournament snapshot and year index from the new pipeline.
- [x] Document how to refresh or add a tournament year.

## Phase 5: Rules engine extraction
- [x] Extract draft logic out of the main view into pure rule-engine modules.
- [x] Break up `App.vue` so page logic, presentation components, and styles are separated into app or feature modules.
- [x] Define the draft action model for pick, remove, ban, unban, and clear operations.
- [x] Implement derived state calculation:
  - [x] total points
  - [x] total ship count
  - [x] hull counts
  - [x] logistics usage
  - [x] flagship classification
- [x] Implement validation results for legal and illegal actions with user-facing reasons.
- [x] Make year-specific rule variation data-driven from the tournament dataset.
- [x] Verify that the migrated current-year behavior still matches the existing app where intended.

## Phase 6: App state and year selection
- [x] Introduce a clear app state model that separates tournament data, draft state, and UI state.
- [x] Add tournament year selection backed by the generated year index.
- [x] Reset draft state when the selected year changes.
- [x] Load the correct tournament dataset and localized labels for the selected year.
- [x] Reconnect the current draft UI to the new rules engine outputs.

## Phase 7: I18n redesign
- [x] Move locale setup into a dedicated i18n module structure.
- [x] Separate app UI messages from tournament and ship labels.
- [x] Replace direct cookie handling in view code with a small preferences utility.
- [x] Preserve English and Simplified Chinese support.
- [x] Confirm the new structure can add a future locale without changing feature code.

## Phase 8: UI polish
- [ ] First polish pass landed, but detailed UI cleanup is intentionally deferred for a later pass.
- [ ] Refine the overall layout and spacing now that PrimeVue migration and app state are stable.
- [ ] Replace transitional styling with a more coherent visual system for buttons, tabs, panels, and lists.
- [ ] Continue moving page-level styles out of `App.vue` into clearer app or feature style files where it improves maintainability.
- [ ] Improve responsive behavior for mobile and narrow tablet widths.
- [ ] Revisit typography, hierarchy, and density so the draft workflow is easier to scan.
- [ ] Polish dark/light theme behavior and reduce visual regressions from the Quasar removal.
- [ ] Review the year selector and future import/export affordances as part of the UI pass.

## Phase 9: Import and export
- [x] Define the `EVE-AT-DRAFT v1` plain-text format precisely.
- [x] Implement draft serialization to text.
- [x] Implement draft parsing from text.
- [x] Validate imported year and ship keys against known datasets.
- [x] Add clipboard export in the UI.
- [x] Add paste/import UI flow with visible parse and validation errors.
- [x] Ensure import can restore both year and draft state from one text payload.

## Phase 10: Testing and acceptance
- [ ] Add unit tests for data normalization and override behavior.
- [ ] Add unit tests for rule-engine behavior across multiple tournament years.
- [x] Add unit tests for import/export round-trip behavior and invalid formats.
- [ ] Add integration tests for:
  - [ ] switching years
  - [ ] legal drafting flow
  - [ ] illegal action feedback
  - [ ] export to clipboard
  - [ ] import success
  - [ ] import failure without state corruption
- [x] Keep `yarn build` passing.
- [ ] Run the full test suite and capture any residual gaps.

## Phase 11: Cleanup and handoff
- [ ] Remove deprecated legacy files and dead code once replacements are in place.
- [ ] Update README to reflect the new architecture, tooling commands, and multi-year support.
- [ ] Add a short maintainer guide for refreshing tournament data.
- [ ] Review generated files and ignore rules so the repo only keeps intended artifacts.
- [ ] Prepare a final refactor summary describing what changed and any follow-up work.

## Optional backlog
- [ ] Investigate support for historic team draft presets, starting with champions and later expanding to other past teams.
- [ ] Identify realistic data sources and fallback/manual curation strategy for team-level historic drafts.
- [ ] Decide whether team drafts should be stored as reusable presets, reference snapshots, or a separate dataset family.

## Suggested review checkpoints
- [x] Checkpoint A: TypeScript, structure, and test harness are in place.
- [x] Checkpoint B: PrimeVue migration is complete and the current-year UI still works.
- [x] Checkpoint C: New tournament data model and pipeline generate the current year successfully.
- [x] Checkpoint D: Data pipeline fetch/build/validate flow works against the current upstream-backed raw source path.
- [x] Checkpoint E: Rules engine is extracted and behavior matches expected draft logic.
- [ ] Checkpoint F: Multi-year selection works with the new i18n structure.
- [ ] Checkpoint G: UI polish pass is complete and the app feels coherent on desktop and mobile.
- [x] Checkpoint H: Import/export and clipboard flow are complete.
- [ ] Checkpoint I: Tests, docs, and cleanup are complete.
