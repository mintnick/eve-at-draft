# Refactor Plan: Historical EVE AT Draft Platform with PrimeVue

## Summary
Refactor the app into a typed static Vue SPA backed by a versioned historical tournament-data pipeline, a standalone rules engine, scalable i18n, and clipboard import/export. Replace Quasar with PrimeVue as the UI framework, while keeping deployment static and making multi-year tournament support the core architectural goal.

## Key Changes

### 1. Architecture and stack
- Keep `Vue` and migrate the app and build-time tooling to `TypeScript`.
- Replace Quasar with `PrimeVue`.
- Use PrimeVue in a way that avoids another deep framework lock-in:
  - prefer app-owned layout and domain components
  - use PrimeVue mainly for primitives such as buttons, tabs, selects, dialogs, messages, and form inputs
  - avoid embedding business logic in framework-specific patterns
- Restructure the codebase by domain:
  - `src/app` for bootstrap and app shell
  - `src/features/draft` for drafting flows
  - `src/features/tournament` for year selection and metadata
  - `src/lib/rules` for pure draft validation/scoring logic
  - `src/lib/i18n` for locale bootstrapping and translation helpers
  - `data/` for source and generated tournament datasets
  - `tools/` for fetch/normalize/build scripts
- Keep the deployment model as a static app with prebuilt datasets.

### 2. Tournament data model and automation
- Replace the single current-year `ships.json` with versioned, normalized datasets per tournament year.
- Define a canonical generated dataset per year containing:
  - tournament metadata and source references
  - rule config: point cap, ship cap, hull caps, logistics rules, flagship rules, and ban rules
  - ship definitions with ids, hull type, point value, logistics weight, flagship eligibility, and localized names
- Split data into:
  - `data/raw/<year>/` for fetched source data and manual overrides
  - `data/generated/<year>.json` for app-consumable normalized outputs
- Consolidate the current ad hoc scripts into one TypeScript-based pipeline that:
  - fetches upstream source data first
  - normalizes it into the canonical schema
  - applies repo overrides where upstream data is incomplete or inconsistent
  - validates and emits generated year snapshots plus an index of available tournaments
- Add pipeline validation for duplicate ids, missing translations, invalid hull mappings, and broken rule configurations.

### 3. Rules engine and draft flows
- Extract draft logic from the view into a pure rules engine driven by tournament dataset plus draft state.
- Rules engine handles:
  - points total
  - ship count
  - hull caps
  - logistics weighting
  - flagship classification
  - ban validation
  - pickable/bannable state with reasons
- Make historical rule variation data-driven wherever possible.
- Add year selection to the UI; changing year clears the current draft by default.
- Add plain-text draft import/export with a versioned format:
  - header line with format version and year
  - `PICKS:` section
  - `BANS:` section
  - canonical English ship keys for v1
- Add clipboard export and paste/import flows with validation and visible error handling.

### 4. I18n and UI migration
- Keep English and Simplified Chinese, but redesign i18n so more locales can be added cleanly later.
- Move ship names into the tournament dataset instead of maintaining them as a separate flat locale file.
- Split translation concerns into:
  - app UI messages
  - tournament/ship localized labels
- Move theme/locale preferences out of direct view logic into a small preferences utility.
- PrimeVue migration path:
  - replace Quasar bootstrapping in the app entrypoint
  - replace `q-btn` with PrimeVue `Button`
  - replace vertical `q-tabs`/`q-tab-panels` with PrimeVue `Tabs` or a thin app-owned tab shell backed by PrimeVue primitives
  - replace status/feedback patterns with PrimeVue `Message`, `Toast`, and `Dialog` where needed
  - preserve current custom CSS and app-specific layout instead of adopting a stock admin look
- Keep styling intentionally lightweight so PrimeVue is a component layer, not the whole design system.

## Public Interfaces and Types
- Introduce shared typed contracts:
  - `TournamentSummary`
  - `TournamentDataset`
  - `RuleConfig`
  - `ShipDefinition`
  - `DraftState`
  - `DraftAction`
  - `DraftValidationResult`
- Add generated tournament index data for the year selector.
- Add a draft codec interface:
  - `serializeDraft(state, tournament): string`
  - `parseDraft(text): ParsedDraft`
- Do not introduce backend APIs in this refactor.

## Test Plan
- Unit tests for data normalization and override handling.
- Unit tests for rules engine behavior across multiple years:
  - point caps
  - hull caps
  - logistics rules
  - flagship handling
  - ban restrictions
- Unit tests for import/export round-tripping and invalid input cases.
- Integration tests for UI behavior:
  - switch year and load the correct dataset
  - complete a legal draft
  - reject illegal actions with visible feedback
  - export to clipboard
  - import valid text and restore state
  - reject malformed text without corrupting current state
- Acceptance checks:
  - `yarn build`
  - test suite passes after PrimeVue migration and Quasar removal
  - UI polish pass preserves core drafting flows across desktop and mobile breakpoints

## Assumptions and Defaults
- PrimeVue is the target UI framework for this refactor.
- Vue remains the app framework; no backend is introduced.
- The app stays static and ships generated datasets.
- TypeScript is adopted for both frontend and tooling.
- Historical support is designed for all available years, with repo overrides allowed where upstream data is incomplete.
- English ship keys are the canonical identifiers for v1 import/export.
- Switching tournament year clears the current draft instead of attempting cross-year conversion.

## Optional Future Extension
- Add historic team draft presets or references for past tournament teams, including champions and other notable teams.
- Treat this as optional because upstream data discovery and normalization may be difficult or incomplete.
- Keep the current refactor architecture compatible with future team-level datasets, but do not block the active refactor phases on this feature.

## Explicit UI Polish Scope
- Add a dedicated polish pass after the core data, rules, and state work is stable enough to avoid repeated visual rework.
- Polish includes layout refinement, responsive behavior, consistent PrimeVue customization, visual hierarchy, spacing, theme cleanup, and import/export or year-selection UX cleanup.
- The goal is not just framework migration; the app should end the refactor looking intentional and coherent on desktop and mobile.
