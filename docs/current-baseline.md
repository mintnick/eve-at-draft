# Current Baseline

This document captures the behavior and constraints of the app before the refactor starts.

## Branch and scope
- Branch: `codex/refactor`
- Baseline captured before Phase 1 structural changes
- Goal of this baseline: preserve current drafting behavior unless a later refactor task explicitly changes it

## Current app shape
- Single-page `Vue 3` app built with `Vite`
- UI components and layout currently depend on `Quasar`
- Main application logic lives in `src/App.vue`
- Ship row rendering lives in `src/components/Ship.vue`
- Static ship and locale data live under `src/assets/`
- Data generation currently relies on ad hoc Python scripts under `src/python_scripts/`

## Current user-visible behavior
- User can build a single draft for the current bundled tournament data
- User can pick ships by hull tab
- User can ban ships separately from picks
- User can clear picks and bans independently
- User sees a running total of draft points against a 200-point cap
- User sees ship count against a 10-ship cap
- User can switch between English and Simplified Chinese
- User can toggle light/dark theme behavior
- User can open the linked Alliance Tournament rules page

## Current rule behavior
- Exactly one flagship can be selected
- Non-flagship hull groups are capped using the hardcoded `max_number` map
- Logistics uses weighted counting through the ship dataset
- A banned ship cannot be picked
- A picked ship cannot be banned
- Current-year rule logic is hardcoded in the view rather than represented as data
- Some historical logic exists only as comments, such as duplicate ship point increases from older formats

## Known limitations in the baseline
- Only one bundled tournament ruleset/year is supported
- Rule logic, presentation logic, and state management are tightly coupled
- Data shape is not versioned by tournament year
- Localization is split between app strings and generated ship-name files with a flat structure
- Theme and locale persistence are handled directly in view/bootstrap code
- Full tournament ban sequencing is not modeled
- README and app copy are not fully aligned on tournament year references

## Migration guardrails
- Preserve the current visual layout as the migration baseline during the framework swap
- Allow minor cleanup only when needed to replace Quasar components cleanly
- Do not change core draft behavior during Phase 1 unless required for TypeScript or test setup
- Record intentional behavior changes in the TODO and session notes when they happen
