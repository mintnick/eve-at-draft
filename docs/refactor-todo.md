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
- [ ] Install PrimeVue and remove Quasar from the bootstrapping path.
- [ ] Replace Quasar app setup in the entrypoint with PrimeVue setup.
- [ ] Identify the minimum component primitives needed for the current UI:
  - [ ] buttons
  - [ ] tabs
  - [ ] select/year picker
  - [ ] message or toast feedback
  - [ ] dialog or modal if needed for import/export
- [ ] Replace Quasar usage in the current screen with PrimeVue or app-owned wrapper components.
- [ ] Preserve the existing functional layout during the framework migration.
- [ ] Remove leftover Quasar-specific code and styles once the page is stable.

## Phase 3: Data model redesign
- [ ] Define the canonical schema for a yearly tournament dataset.
- [ ] Define the generated index format for listing available tournament years.
- [ ] Separate raw source inputs from generated normalized outputs.
- [ ] Decide and document where manual overrides live for broken or incomplete upstream data.
- [ ] Move current single-year data into the new schema as the first migrated dataset.
- [ ] Ensure ship localization data is represented inside the tournament dataset model.

## Phase 4: Data pipeline consolidation
- [ ] Replace the current scattered Python scripts with a unified TypeScript data pipeline.
- [ ] Implement fetch commands for upstream source collection.
- [ ] Implement normalization from upstream/raw inputs into the canonical yearly schema.
- [ ] Implement override merging for exceptional data fixes.
- [ ] Implement validation checks for:
  - [ ] duplicate ship ids
  - [ ] missing required translations
  - [ ] invalid hull mappings
  - [ ] broken rule definitions
- [ ] Generate the first app-consumable tournament snapshot and year index from the new pipeline.
- [ ] Document how to refresh or add a tournament year.

## Phase 5: Rules engine extraction
- [ ] Extract draft logic out of the main view into pure rule-engine modules.
- [ ] Define the draft action model for pick, remove, ban, unban, and clear operations.
- [ ] Implement derived state calculation:
  - [ ] total points
  - [ ] total ship count
  - [ ] hull counts
  - [ ] logistics usage
  - [ ] flagship classification
- [ ] Implement validation results for legal and illegal actions with user-facing reasons.
- [ ] Make year-specific rule variation data-driven from the tournament dataset.
- [ ] Verify that the migrated current-year behavior still matches the existing app where intended.

## Phase 6: App state and year selection
- [ ] Introduce a clear app state model that separates tournament data, draft state, and UI state.
- [ ] Add tournament year selection backed by the generated year index.
- [ ] Reset draft state when the selected year changes.
- [ ] Load the correct tournament dataset and localized labels for the selected year.
- [ ] Reconnect the current draft UI to the new rules engine outputs.

## Phase 7: I18n redesign
- [ ] Move locale setup into a dedicated i18n module structure.
- [ ] Separate app UI messages from tournament and ship labels.
- [ ] Replace direct cookie handling in view code with a small preferences utility.
- [ ] Preserve English and Simplified Chinese support.
- [ ] Confirm the new structure can add a future locale without changing feature code.

## Phase 8: Import and export
- [ ] Define the `EVE-AT-DRAFT v1` plain-text format precisely.
- [ ] Implement draft serialization to text.
- [ ] Implement draft parsing from text.
- [ ] Validate imported year and ship keys against known datasets.
- [ ] Add clipboard export in the UI.
- [ ] Add paste/import UI flow with visible parse and validation errors.
- [ ] Ensure import can restore both year and draft state from one text payload.

## Phase 9: Testing and acceptance
- [ ] Add unit tests for data normalization and override behavior.
- [ ] Add unit tests for rule-engine behavior across multiple tournament years.
- [ ] Add unit tests for import/export round-trip behavior and invalid formats.
- [ ] Add integration tests for:
  - [ ] switching years
  - [ ] legal drafting flow
  - [ ] illegal action feedback
  - [ ] export to clipboard
  - [ ] import success
  - [ ] import failure without state corruption
- [ ] Keep `yarn build` passing.
- [ ] Run the full test suite and capture any residual gaps.

## Phase 10: Cleanup and handoff
- [ ] Remove deprecated legacy files and dead code once replacements are in place.
- [ ] Update README to reflect the new architecture, tooling commands, and multi-year support.
- [ ] Add a short maintainer guide for refreshing tournament data.
- [ ] Review generated files and ignore rules so the repo only keeps intended artifacts.
- [ ] Prepare a final refactor summary describing what changed and any follow-up work.

## Suggested review checkpoints
- [x] Checkpoint A: TypeScript, structure, and test harness are in place.
- [ ] Checkpoint B: PrimeVue migration is complete and the current-year UI still works.
- [ ] Checkpoint C: New tournament data model and pipeline generate the current year successfully.
- [ ] Checkpoint D: Rules engine is extracted and behavior matches expected draft logic.
- [ ] Checkpoint E: Multi-year selection works with the new i18n structure.
- [ ] Checkpoint F: Import/export and clipboard flow are complete.
- [ ] Checkpoint G: Tests, docs, and cleanup are complete.
