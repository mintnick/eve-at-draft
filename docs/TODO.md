# TODO

## Task: Readability pass — larger, heavier text across the draft UI

### Goal

The GUNMETAL cockpit redesign is approved visually, but text is too small and too thin in many places. Raise font sizes and weights across the draft screen without changing the design language (colors, fonts, layout, angled panels all stay).

### Codebase context

- Vue 3 + PrimeVue. All styles are plain scoped CSS inside SFCs; global tokens live in `src/style.css`.
- `src/style.css:148-158` scales the root font-size responsively (15px → 17px @1024 → 18px @1440), but almost every text style in the draft UI uses **hardcoded px**, so that ramp never applies to them. Do not touch the ramp; this task fixes the px values directly.
- Fonts loaded in `index.html:9`: Chakra Petch 600/700 (display), IBM Plex Sans 400/500/600 (body), Share Tech Mono (400 only — it has no heavier weight, so mono text can only get bigger, not bolder).
- The three files below own all the affected styles. No shared/global style changes are needed.

### Changes (prescriptive — apply exactly)

`src/features/draft/components/DraftScreen.vue` (all in the `<style scoped>` block):

| Selector | Line | Change |
|---|---|---|
| `.feedback-toast` | 316 | font-size 14px → 15px |
| `.ban-rules-link` | 341 | font-size 12px → 13px |
| `.points-summary-label` | 378 | font-size 11px → 12px |
| `.hull-tab-content` | 501 | font-size 13px → 14px |
| `.hull-tab-count` | 530 | font-size 13px → 14px |
| `.ship-section-label` | 563 | font-size 10px → 12px |
| `.summary-title` | 600 | font-size 13px → 14px |
| `.summary-title--ban` | 613 | font-size 14px → 15px |
| `.summary-title-count` | 621, 623 | font-size 14px → 15px; color `#9aa7b1` → `var(--app-text)` |
| `.summary-list :deep(.ship-name)` | 654–655 | font-size 13px → 14px; font-weight 500 → 600 |
| `.ban-pill` | 696 | font-weight 500 → 600 |
| `.ban-pill-name` | 717 | font-size 13px → 14px |
| `.clear-button` | 808 | font-size 11px → 12px |

`src/components/Ship.vue`:

| Selector | Line | Change |
|---|---|---|
| `.ship-name` | 169 | font-size 14px → 15px |
| `.ship-name` (mobile, ≤600px) | 267 | font-size 0.85rem → 0.9rem |

`src/app/AppShell.vue`:

| Selector | Line | Change |
|---|---|---|
| `.transfer-button` | 312 | font-size 12px → 13px |
| `.source-link` | 355 | font-size 12px → 13px |
| `.header-prize-links` | 380 | font-size 13px → 14px |
| `.tournament-year-select:deep(.p-select-label)` | 427 | font-size 14px → 15px |

Line numbers are as of this writing; match by selector if they drift.

### Why this approach

Explicit px bumps keep the fix reviewable and zero-risk to layout. Converting to rem so the root ramp applies would be cleaner long-term but changes proportions at every breakpoint — out of scope here.

### Acceptance criteria

- All values in the tables above are applied exactly; no other style declarations change.
- No `font-size` below 12px remains in `src/` (`grep -rn 'font-size: 1[01]px\|font-size: [0-9]px' src/` returns nothing).
- `yarn typecheck` passes.
- Layout metrics untouched: no changes to padding, gap, grid, clip-path, width/height values.

### Constraints

- Only touch the three files listed. No edits to `src/style.css`, `index.html`, or any other file.
- No new dependencies, no lockfile changes, no build/tool config changes.
- No font-family swaps, no new font weights in the Google Fonts URL.
- No color changes beyond the single one listed for `.summary-title-count`.
- Do not run or open the dev server; typecheck is enough.

### Coder notes

_(Coder: if an approach fails once, or the design seems impossible or wrong, stop — write what you tried and what you're unsure about here, and change nothing else. Do not retry with a different guess.)_
