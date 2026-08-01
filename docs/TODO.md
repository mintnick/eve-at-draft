# TODO

## Task: hide the Match Archive link when the archive page does not exist

**Status:** ready for coder

### Goal

EVE_NT has not published an ATXXII page yet, so the 2026 tournament's `Match Archive`
link points at a 404. Detect that during the data pipeline and leave the link out of
the generated dataset, so the app does not render a dead link. When EVE_NT publishes
the page later, re-running the pipeline must bring the link back with no code change.

Verified upstream status (2026-08-01):

| URL | Status |
|---|---|
| `https://open.eve-nt.uk/portal/tournaments/ATXXII` | **404** |
| `https://open.eve-nt.uk/portal/tournaments/ATXXI` | 200 |
| `https://open.eve-nt.uk/portal/tournaments/ATXX` | 200 |

### Do not do this in the browser

The obvious reading of "detect a 404" is a client-side `fetch` in the Vue app. That
cannot work here, and attempting it will waste your time:

- `open.eve-nt.uk` sends **no `Access-Control-Allow-Origin` header** (verified with an
  `Origin: https://atdraft.nickning.me` request). A normal cross-origin `fetch` is
  blocked by CORS.
- `fetch(url, { mode: 'no-cors' })` returns an opaque response whose `status` is always
  `0`. A 404 is indistinguishable from a 200.

So the check belongs in the data pipeline, which runs in Node with no CORS. The app is
a static site; the link state is baked in at build time and refreshes when the pipeline
is re-run. That is the intended behaviour, not a compromise to work around.

### Codebase context

The `Match Archive` link already disappears on its own when the dataset omits it — the
frontend needs **no change**:

- `tools/data-pipeline/config.ts:17` — `archiveUrl?: string` on `TournamentPipelineConfig`.
  All six years currently set it (lines 55, 95, 137, 180, 229, 271).
- `tools/data-pipeline/build.ts:123-127` — builds the dataset's `sources` array. The
  archive entry is already conditional:
  `...(config.archiveUrl ? [{ label: 'Match Archive', url: config.archiveUrl }] : [])`.
- `src/app/AppShell.vue:38` — `archiveLink` resolves by looking for the source whose
  label is `Match Archive`, falling back to `null`.
- `src/app/AppShell.vue:165` — the anchor is wrapped in `v-if="archiveLink"`.

Pipeline shape — respect this split:

- `tools/data-pipeline/fetch.ts` does all network I/O and writes `data/raw/<year>/source.json`.
- `tools/data-pipeline/build.ts` is pure: it reads files and transforms them, no network.
  Its helpers are unit-tested in `tests/data-pipeline.spec.ts`. Keep it that way — do
  **not** add a network call to `build.ts`.

`fetch.ts` has two provider paths that each construct a `RawTournamentSource` and write
it out: `fetch.ts:124` / `fetch.ts:135` (legacy snapshot, used by 2025) and
`fetch.ts:195` / `fetch.ts:208` (official sheet, used by 2021–2024 and 2026). **Both**
need the new field.

### Design

**1. Record archive availability at fetch time.**

Add an optional field to `RawTournamentSource` in `tools/data-pipeline/types.ts:11`:

```ts
export interface RawTournamentSource {
  year: number
  provider: string
  capturedAt: string
  /** false only when the archive URL is known to be missing upstream; absent means available. */
  archiveAvailable?: boolean
  hulls: Partial<Record<HullType, Record<string, RawShipRecord>>>
}
```

**2. Add a probe helper in `fetch.ts`.**

```ts
async function isArchiveAvailable(archiveUrl: string | undefined): Promise<boolean> {
  if (!archiveUrl) return true

  try {
    const response = await fetch(archiveUrl, { method: 'HEAD', redirect: 'follow' })
    // Only a definitive "not there" hides the link. Anything else — success, a server
    // error, a rate limit — leaves it in place.
    return response.status !== 404 && response.status !== 410
  } catch {
    // Network failure, DNS failure, timeout: assume available.
    return true
  }
}
```

**Fail open, deliberately.** If a transient outage or an offline machine were treated as
"missing", one bad pipeline run would silently strip the archive link from every year at
once. Only 404 and 410 mark it unavailable.

Do **not** route this through the existing `fetchOk` helper (`fetch.ts:21`) — that throws
on any non-2xx response, which is exactly the case being detected. `HEAD` is verified to
return accurate statuses on this host.

**3. Populate the field in both fetch paths.**

In both `RawTournamentSource` literals (`fetch.ts:124` and `fetch.ts:195`), set
`archiveAvailable: await isArchiveAvailable(config.archiveUrl)`.

**4. Consume it in `build.ts`.**

Extract the sources array into a pure, testable helper next to the other exported helpers
in `build.ts`:

```ts
export function createSourceReferences(
  config: TournamentPipelineConfig,
  source: RawTournamentSource,
): SourceReference[] {
  const references: SourceReference[] = [
    { label: 'Rules', url: config.rules.rulesLink },
    { label: 'Ban Rules', url: config.rules.banLink },
  ]

  if (config.archiveUrl && source.archiveAvailable !== false) {
    references.push({ label: 'Match Archive', url: config.archiveUrl })
  }

  return references
}
```

Then use `sources: createSourceReferences(config, source)` at `build.ts:123`.

Note the `!== false` test: years whose `source.json` predates this change have no
`archiveAvailable` field and must keep their link. Do not re-fetch 2021–2025.

**5. Regenerate 2026 only.**

```bash
yarn data:fetch     # fetch 2026
yarn data:build     # build 2026
yarn data:validate  # validate 2026
```

Expected diff in `data/raw/2026/source.json`: `capturedAt` updated and
`"archiveAvailable": false` added. If any ship points, ids, or names change too, stop and
report it under `## Coder notes` — that would mean upstream data moved and is not part of
this task.

**6. Test.**

Add cases to `tests/data-pipeline.spec.ts` covering `createSourceReferences`:

- archive URL set, `archiveAvailable: false` → no `Match Archive` entry
- archive URL set, `archiveAvailable: true` → entry present
- archive URL set, field absent → entry present (back-compat for older years)
- no archive URL → no entry

Build the config argument inline in the test; do not import the real `TOURNAMENTS` array.

### Acceptance criteria

1. `data/raw/2026/source.json` contains `"archiveAvailable": false`.
2. `data/generated/2026.json` `sources` has exactly `Rules` and `Ban Rules` — no `Match Archive`.
3. `data/generated/2025.json` `sources` still contains `Match Archive`, and
   `data/raw/2025/source.json` is unmodified.
4. `data/generated/2021.json` through `2024.json` are unmodified.
5. `src/app/AppShell.vue` is unmodified.
6. `yarn typecheck` passes.
7. `yarn test:run` passes, including the four new `createSourceReferences` cases.
8. `yarn build` passes.
9. `tsx ./tools/data-pipeline/cli.ts validate <year>` passes for all of 2021–2026.
10. `tools/data-pipeline/build.ts` still makes no network calls.

### Constraints

- No new dependencies and no lockfile changes. Use the global `fetch` already used
  throughout `fetch.ts`.
- No build or tool config changes (`package.json`, `vite.config.ts`, `vitest.config.ts`,
  `tsconfig.json`).
- No files outside this set:
  `tools/data-pipeline/types.ts`, `tools/data-pipeline/fetch.ts`,
  `tools/data-pipeline/build.ts`, `tests/data-pipeline.spec.ts`,
  `data/raw/2026/source.json`, `data/generated/2026.json`.
- Do not touch `src/` at all — the frontend already handles a missing source entry.
- Do not edit shared or global styles.
- Do not re-fetch or rebuild any year other than 2026.
- Do not edit any file in `docs/` except to append under `## Coder notes`.
- Do not commit.

### Watch out for

- `mergeSourceWithOverrides` (`build.ts:13`) spreads `...source`, so it preserves
  `archiveAvailable`. Reading it off either `source` or `merged` works; the design above
  uses `source` because overrides never touch this field.
- `SourceReference` is exported from `src/lib/types` — import the existing type, do not
  redeclare it.
- `TournamentPipelineConfig` lives in `tools/data-pipeline/config.ts`; importing it into
  `build.ts` is fine, that file already imports `getTournamentConfig` and `TOURNAMENTS`
  from there.
- The four ship-catalog and rules tests already in `tests/data-pipeline.spec.ts` must keep
  passing untouched.

---

If an approach fails once, or this design seems impossible or wrong, **stop**. Write what
you tried and what you are unsure about under `## Coder notes` below, change nothing else,
and do not retry with a different guess.

## Coder notes

_(coder: append here if blocked)_
