# Handoff: AT Draft — "GUNMETAL" UI Redesign

## Overview
A visual re-skin of the EVE Alliance Tournament draft tool's main draft screen. **The layout, structure, and behavior are unchanged** — this is purely a new visual treatment: a solid-panel "cockpit MFD" (multi-function display) look with chamfered corners, an amber/gunmetal chrome, and reinterpreted semantic colors. No new screens, no new features.

## About the Design Files
The files in this bundle are a **design reference created in HTML** — a prototype showing the intended look, not production code to copy verbatim. The task is to **recreate this look inside the existing Vue 3 + PrimeVue codebase**, using its established patterns (PrimeVue theme preset, scoped component styles, the `style.css` token layer). Do **not** drop the HTML in directly and do **not** restructure the app — re-style the components that already exist.

- `AT Draft Redesign.dc.html` — the reference screen. Open it in a browser to see the target. (It loads three Google Fonts and pulls ship icons live from `https://images.evetech.net/types/{id}/icon`, so it needs a network connection. `support.js` is the prototype's render runtime — **ignore it**, it is not part of the spec.)
- `assets/hull/*.png` — the hull-class icons used in the left rail. These already exist in the real repo at `public/hull/`.

## Fidelity
**High-fidelity.** Colors, typography, spacing, and corner geometry below are final — match them. Where a value isn't specified, follow the nearest analogous value in the token tables.

## Target codebase map
The redesign touches these existing files (paths relative to repo root):

| File | What changes |
|---|---|
| `src/app/theme.ts` | PrimeVue `definePreset(Aura, …)` — repoint primary to **amber**, surfaces to the **gunmetal** ramp, and semantic (success/danger/warn) to the new pick/ban/clear hues. Set component border-radius to the chamfer story (see "Shape"). |
| `src/style.css` | Add the three font families to `--app-font-family` / a new `--app-font-display` / `--app-font-mono`; add the page background; import fonts. |
| `src/index.html` | Add the Google Fonts `<link>` (or self-host). |
| `src/features/draft/components/DraftScreen.vue` | Re-style header strip, prize+points banner, hull rail, pick column, ban row. Structure stays. |
| `src/components/Ship.vue` | Re-style the ship list row + its add/ban buttons and the points readout. |

---

## Design Tokens

### Color — base / surfaces
| Token | Hex / value | Use |
|---|---|---|
| Page background base | `#06080b` → `#070a0e` (vertical) | `body` / app shell |
| Page glow (top) | radial `rgba(255,167,51,.06)` at 50% -10% | ambient amber wash |
| Page glow (right) | radial `rgba(52,216,255,.045)` at 88% 6% | ambient cyan wash |
| Console panel fill | linear-gradient(180deg, `#0e1217`, `#0c1014`) | the outer draft container |
| Console pinstripe | repeating-linear-gradient(45deg, `rgba(255,167,51,.016)` 0 2px, transparent 2px 9px) | faint diagonal texture over panel |
| Console border | inset 0 0 0 1px `rgba(150,170,190,.16)` | 1px hairline frame |
| Inner card fill | `#11161c` | ship rows, pick rows, prize banner |
| Inner card border | inset 0 0 0 1px `rgba(150,170,190,.13)` | + top highlight inset 0 1px 0 `rgba(255,255,255,.035)` |
| Card hover fill | `#161d25` | ship rows on hover |
| Rail item (inactive) | fill `#10151b`, border `rgba(150,170,190,.13)` | hull rail rows |
| Rail item (active) | fill `#1b232c`, border `rgba(255,167,51,.5)` + left bar inset 3px 0 0 `#ffa733` | selected hull class |
| Neutral button fill | `#1a222b`, border `rgba(150,170,190,.24)` | IMPORT / EXPORT |

### Color — accents & semantics
The old meanings are preserved but recolored. **Keep these meanings consistent** — they're how players read the screen fast.

| Role (old → new) | Hex | Notes |
|---|---|---|
| Chrome / primary (was muted blue) | `#ffa733` (amber), light `#ffbf63` | active states, labels, section ticks, focus borders |
| Pick / add (was green) | `#3ef0bf` (mint) | add buttons, pick points, PICK label, pick row left-bar |
| Ban (was red) | `#ff4d6a` | ban buttons, ban chips, all remove buttons |
| Clear / caution (was gold) | `#ffb13c` | CLEAR button |
| Secondary accent (sparing) | `#34d8ff` (cyan) | reserved accent; used only in the swatch legend |

### Color — text ramp
| Hex | Use |
|---|---|
| `#eef6fb` | brightest — H1, console headings |
| `#f4f8fb` / `#dfe7ec` | strong body / button labels |
| `#cdd9e2` | emphasized inline (e.g. sponsor name) |
| `#b9c7d3` | default body |
| `#9aa7b1` / `#8b99a4` | secondary text |
| `#7e8d99` / `#7a8794` | muted labels, descriptions |
| `#66747f` | faintest (inactive counts) |
| POINTS number `#ffbf63`, denominator `#8a7a5a` | the points readout only |

### Typography
Three families (Google Fonts: `Chakra Petch`, `IBM Plex Sans`, `Share Tech Mono`):

| Family | Weights | Role |
|---|---|---|
| **Chakra Petch** (squared industrial) | 600 / 700 | display: H1, console headings, hull names, year selector text, IMPORT/EXPORT/CLEAR, RULES/ARCHIVE |
| **IBM Plex Sans** | 400 / 500 / 600 | body: ship names (600), pick names (500), ban names (500), descriptions |
| **Share Tech Mono** | 400 | all numeric readouts (points, counts) and small tracked labels (`BATTLESHIP`, `PICK`, `BAN`, `04 / 10`) |

Label convention: Share Tech Mono, ~10px, `letter-spacing: .18–.22em`, uppercase, in the role color.

### Shape — chamfered ("cockpit") corners
Every panel/card/button cuts its **top-left and bottom-right** corner. Implement with `clip-path`:

```css
clip-path: polygon(
  Npx 0, 100% 0,
  100% calc(100% - Npx), calc(100% - Npx) 100%,
  0 100%, 0 Npx
);
```

`N` (chamfer size) by element:
| N | Elements |
|---|---|
| 16px | console outer container, masthead legend tile |
| 9px | inner cards (ship rows, prize banner, points readout) |
| 8px | rail rows, year selector |
| 7px | header buttons (IMPORT/EXPORT), ban chips |
| 6px | add/ban action buttons, CLEAR |
| 5px | small remove buttons |

In PrimeVue (`theme.ts`) you cannot express a chamfer via `borderRadius` — set radii to `0` there and apply the `clip-path` in component CSS (a shared utility class, e.g. `.chamfer-9 { clip-path: … }`, is the cleanest approach).

### Spacing & layout
- Console padding: `22px`.
- Main grid: `grid-template-columns: 212px minmax(0,1fr) 304px; gap: 16px; align-items: start;` (rail | ship list | picks).
- Section vertical rhythm: `18px` between header strip → banner → grid → ban row.
- Row gaps: `7px` (rail, ship list), `9px` (picks).
- Max content width: `1240px`, centered.

---

## Screens / Views

### Draft screen (single view)
Top-to-bottom inside the console panel:

**1. Header strip** (flex row, space-between, wraps)
- Left group: **Year selector** + **RULES** / **ARCHIVE** links.
  - Year selector: pill, fill `#161d24`, border `rgba(255,167,51,.34)`, chamfer 8px, `min-width:300px`. Text "Alliance Tournament · 2025" in Chakra Petch 600 14px `#f4f8fb`; trailing `▾` chevron in `#ffa733`. (No "YEAR" prefix label.)
  - RULES / ARCHIVE: Chakra Petch **700** 12px `#dfe7ec`, underline in `rgba(255,167,51,.55)` offset 4px, hover → `#fff`.
- Right group: **IMPORT** + **EXPORT** — both neutral buttons (fill `#1a222b`, border `rgba(150,170,190,.24)`, chamfer 7px, Chakra Petch 600 12px `#dfe7ec`, `letter-spacing:.12em`, padding `8px 18px`). Hover: border → `rgba(255,167,51,.55)`, text → `#fff`. (Neither uses an amber fill.)

**2. Prize + Points banner** (grid: `1fr auto`, gap 14px)
- Prize banner: inner card (`#11161c`, chamfer 9px). Content inline, 13px: `Sponsored by` + **Pandemic Horde** (`#cdd9e2`); a 1px vertical divider `rgba(150,170,190,.18)`; `Prize —` (`#8b99a4`) then **Komodo** **Vanquisher** in `#ffbf63`. (No "PRIZE" label.)
- Points readout: fill linear-gradient(180deg, `#201a12`, `#181410`), border `rgba(255,167,51,.5)`, chamfer 9px, padding `11px 22px`. `POINTS` label (mono 10px `#ffa733`) + `119` (mono **28px** `#ffbf63`) + `/` + `120` (mono 18px `#8a7a5a`).

**3. Main grid**

- **Hull rail** (left, 212px) — 7 fixed rows: Battleship, Battlecruiser, Cruiser, Destroyer, Frigate, Logistics, Flagship. Each: icon 30px + name (Chakra 600 13px) + count (mono 11px, e.g. `2/4`), padding `9px 11px`. Active row uses the amber-active treatment (left bar + amber border, name `#f4f8fb`, count `#ffbf63`); inactive rows use the inactive treatment with icon `filter: grayscale(.4) opacity(.8)`, hover fill `#161d25`.

- **Ship list** (center) — section label `BATTLESHIP` (mono 10px `#ffa733`) with an amber gradient hairline to the right. Each ship row (inner card, chamfer 9px, padding `7px 9px 7px 7px`):
  - Left: ship icon **34px** (from `images.evetech.net/types/{id}/icon`) → **points** (Share Tech Mono **16px** `#3ef0bf`, `min-width:28px`, centered — plain text, *not* a filled badge) → ship name (IBM Plex 600 14px `#dfe7ec`, ellipsis).
  - Right: two **34px** action buttons, chamfer 6px:
    - **Add**: solid mint `#3ef0bf`, icon `#06120e` (plus glyph). Hover `brightness(1.12)`.
    - **Ban**: solid red `#ff4d6a`, icon `#fff` (circle-slash glyph). Hover `brightness(1.1)`.

- **Pick column** (right, 304px) — header row: `PICK` (mono **13px** `#3ef0bf`) + `04 / 10` (mono **14px** `#9aa7b1`) on the left; **CLEAR** button on the right (fill `#ffb13c`, text `#1a1206`, Chakra 600 11px, chamfer 6px, padding `6px 12px`, hover `brightness(1.08)`). Each pick row (inner card, chamfer 8px, **left bar** inset 2px 0 0 `#3ef0bf`, padding `7px 9px 7px 7px`): icon 28px → points (mono **16px** `#3ef0bf`, min-width 28px) → name (IBM Plex 500 13px `#dfe7ec`) → **remove** button (28px, chamfer 5px, **solid red `#ff4d6a`, icon `#fff`**, minus glyph, hover `brightness(1.1)`). *(There is no "REMAINING NN" footer — do not add one.)*

**4. Ban row** (full width, separated by a 1px top border `rgba(150,170,190,.16)`)
- Label `BAN` (mono 10px `#ff4d6a`) + `(RULES)` (mono 10px `#66747f`) + red gradient hairline.
- Ban chips (wrap, gap 8px): fill `#1c1418`, border `rgba(255,77,106,.4)`, **left bar** inset 2px 0 0 `#ff4d6a`, chamfer 7px, padding `5px 6px 5px 9px`. Icon 26px → name (IBM Plex 500 13px `#f0c6cd`) → remove button (24px, solid red, chamfer 5px).

## Interactions & Behavior
Behavior is **identical to the current app** — only visuals change. For reference, the states that need styling:
- **Hover** — ship rows lighten to `#161d25`; neutral buttons gain an amber border + white text; solid colored buttons brighten ~10–12%; links go to `#fff`.
- **Active hull** — amber left bar + amber border + brightened name/count (drives the center list's contents in the real app).
- **Add** appends to the pick column and updates the points total; **Ban** appends to the ban row; **remove** (minus) removes from pick/ban; **CLEAR** empties the picks. (All already implemented — keep the logic.)
- Transitions: keep them subtle — `background .14s ease` / `box-shadow .14s ease`. No large motion.

## State Management
No changes. Reuse the existing `useAppState.ts` / draft state. The redesign introduces **no** new state.

## Assets
- **Hull icons**: `public/hull/{Battleship,Battlecruiser,Cruiser,Destroyer,Frigate,Logistics,Flagship}.png` — already in the repo (copies included here under `assets/hull/`).
- **Ship icons**: served live from `https://images.evetech.net/types/{ship_id}/icon` — already how the app resolves them.
- **Fonts**: Chakra Petch, IBM Plex Sans, Share Tech Mono (Google Fonts). Add via `index.html` `<link>` or self-host in `public/`.

## Files in this bundle
- `README.md` — this spec (self-sufficient).
- `AT Draft Redesign.dc.html` — the visual reference. Open in a browser to view the target.
- `support.js` — prototype runtime only; **not** part of the implementation.
- `assets/hull/*.png` — hull-class icons.
- `screenshots/annotated-overview.png` — the full screen with numbered callouts + a token legend keyed to every region.
- `screenshots/annotated-ban-row.png` — close-up of the ban row with its tokens.

## Suggested implementation order
1. `index.html` + `style.css`: load fonts, set page background and font CSS variables.
2. `theme.ts`: repoint PrimeVue primary→amber, surfaces→gunmetal ramp, success→mint / danger→red / warn→`#ffb13c`; radii→0; add a shared `.chamfer-*` utility.
3. `Ship.vue`: row, points text, add/ban buttons.
4. `DraftScreen.vue`: header strip, prize+points banner, hull rail, pick column, ban row.
5. Diff against `AT Draft Redesign.dc.html` in a browser, side by side.
