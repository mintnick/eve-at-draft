# Plan

Upcoming work, roughly by readiness. The active task lives in `docs/TODO.md`.

## Ready when you are

- **ATXXII prize ships** — CCP had not announced the Amarr reward hulls when the rules
  post landed, so `prize.rewardShips` for 2026 in `tools/data-pipeline/config.ts` is
  empty and the header hides the prize row. Fill it in once they are published.

- **Archive probe timeout** — `isArchiveAvailable` in `tools/data-pipeline/fetch.ts` has
  no timeout, so it inherits undici's defaults (~10s connect, 300s headers). A hung
  archive host stalls the pipeline after the expensive ESI work has finished. Add
  `AbortSignal.timeout(10_000)` next time that file is touched.

- **Unit tests for the static-values parser** — `parseStaticValuesTable`,
  `normalizeHullType`, and `buildOfficialHulls` in `tools/data-pipeline/fetch.ts` are
  unexported and untested. The 2026 inflation bug (a per-class summary row on a later
  line silently overwrote a ship's authoritative row) lived exactly there and was caught
  by hand, not by a test. Export them and cover the overwrite-precedence rule.

## Blocked upstream

- **PrimeVue 4 → 5** (with `@primeuix/themes` 2 → 3) — `@primeuix/themes` 3 moves
  `borderRadius` out of `semantic`, so `src/app/theme.ts:19` fails to typecheck. That
  block sets every radius to `0` and is what gives the app its square-cornered look, so
  a wrong migration silently rounds the whole UI and no test would catch it. Needs the
  migration plus visual verification in a browser.

- **TypeScript 6 → 7** — install fails under Yarn 4.9.4: its built-in typescript compat
  patch looks for `lib/_tsc.js`, which the Go rewrite no longer ships. `vue-tsc` 3.3.9
  likely does not support a TS 7 backend either. Revisit once Yarn and vue-tsc catch up.
