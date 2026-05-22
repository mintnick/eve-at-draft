# UI Refactor Plan — Console / Excel-like Design Language

## Goal

Realign the app's visual language with EVE third-party tooling — specifically [zKillboard](https://zkillboard.com/) and [killmail.app](https://killmail.app/) — moving from the current pastel, rounded, glass-panel look to a cold, dark, dense, operations-console aesthetic.

## Design language summary

**Mood.** Looks like a tool an analyst opened, not a page a designer styled. Communicates *"this site respects your time and assumes you know what you're looking at."*

**Surface.**
- Near-black canvas (`#0b0d10`–`#15181c`). No gradients, no glow, no glass.
- Panels are the same dark as the page or one shade lighter — separation comes from 1px hairline borders, not shadow or radius.
- Corners square or 2px max.
- No drop shadows. Depth is conveyed by border + background tone.

**Type.**
- System sans for UI chrome; tabular/monospace numerals for ISK, counts, timestamps, IDs.
- Tight line-height (1.2–1.35). Small base size (12–13px).
- Weight does the work: 600 for headers/key values, 400 for body, 400 muted for metadata. No giant H1s.

**Color as data, not decoration.**
- Grayscale dominates. Color is reserved for meaning: red = loss/ban, green = kill/add, amber = warning/clear, blue = link/info.
- Accents are saturated but slightly desaturated (e.g. `#c0392b`, `#2e7d32`). Never pastel, never neon.
- Hover = single-step background lift, ~80ms or less.

**Density / layout.**
- Excel-like rows: 28–32px tall, zebra striping, sticky header.
- Right-aligned numerics, left-aligned text, truncation with ellipsis.
- Faint vertical column dividers.

**Iconography.**
- EVE renders (ships, corps, alliances) treated as data: small, square, no rounded mask. Optional tech-level badge.
- UI icons are line-style, 14–16px, monochrome.

**Explicitly NOT.**
- No gradient backgrounds, radial blooms, glassmorphism, rounded floating cards, or pastel washes.

## Scope (confirmed)

- **Dark only.** Light mode dropped entirely. Theme toggle removed.
- **Phase 1–2 only.** Re-skin via tokens + primitives. No screen relayout — `AppShell` and `DraftScreen` keep their current structure and inherit the new look.
- **Custom PrimeVue preset** built on `@primeuix/themes` (extending Aura). No theme switch, no PrimeVue removal.

## Work breakdown

### Phase 1 — Tokens & theme primitives

1. **Rewrite `src/style.css`.**
   - Collapse `:root` + `html.app-dark` into a single dark token set.
   - New tokens: flat `#0b0d10` background, hairline `--app-border: #23272e`, `--app-panel: #13171c`, `--app-panel-strong: #1a1f26`.
   - Remove all gradient backgrounds (body radial blooms, panel glass).
   - Remove all shadow tokens (`--app-shadow`, `--app-shadow-soft`).
   - Add `--app-font-mono: ui-monospace, "JetBrains Mono", Menlo, Consolas, monospace`.
   - Reduce base radius: square or 2px max. Drop the 1rem on `.p-message`.
   - Re-map semantic action tokens (`--app-action-add/ban/remove/clear/transfer-*`) to the desaturated palette. Names unchanged → no component code changes.

2. **Custom PrimeVue preset.**
   - New file `src/app/theme.ts` exporting a preset that extends `Aura`, overriding:
     - `borderRadius` → square/2px
     - `colorScheme.dark.*` surface, content, primary tokens
     - Component-level overrides for `button`, `select`, `datatable`, `message`
   - `src/main.ts`: replace `import Aura from '@primeuix/themes/aura'` with the local preset.

3. **Drop light-mode plumbing.**
   - Remove `getInitialThemeDark` import and `documentElement.classList.toggle('app-dark', …)` from `src/main.ts`.
   - Always apply dark scheme via the preset's `darkModeSelector` (or set permanently).
   - Remove theme toggle UI from `AppShell.vue`.
   - Delete `getInitialThemeDark` (and any setter) from `src/lib/preferences/index.ts` if unused elsewhere.

### Phase 2 — Primitives

4. **DataTable styling.** Global override (in `theme.ts` or `style.css`):
   - 28px row height, zebra `#101317` / `#13171c`.
   - Sticky header, 600 weight, uppercase tracking.
   - Mono numerics, right-aligned numeric columns.
   - 1px hairline column dividers, no outer card.

5. **Button / Select / Message.**
   - Square, hairline border, no shadow.
   - Action variants pull from re-mapped `--app-action-*` tokens.
   - Hover = single-step background lift, ≤80ms.

6. **`src/components/Ship.vue`.**
   - Square crop (drop the 25% radius on `.hull-icon`).
   - 1px hairline border.
   - Slot for tech-level / faction badge overlay (corner).

## Out of scope

- Screen relayout (`DraftScreen.vue`, `AppShell.vue` structure) — Phase 3.
- IA changes (navigation, flow) — Phase 4.
- Replacing PrimeVue.
- Light mode in any form.

## Risk / rollback

- All Phase 1 changes are isolated to `style.css`, `main.ts`, and a new `theme.ts`. Reverting is a 3-file rollback.
- Phase 2 changes are additive overrides; components consume the same token names.
- Visual QA pass at 1440 / 1080 / mobile widths before considering done.

## Open questions

- None blocking. Defer Phase 3+ decisions until after the re-skin is live and we can judge the language in situ.
