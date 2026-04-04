# Tournament Source Notes

This note records the official source chain for recent Alliance Tournament data and provides a reusable prompt for future sessions that need to fetch a new tournament year or backfill older years.

## Verified official source pattern

For recent tournaments, the official source chain has been:
- official EVE Online rules/announcement post
- linked Google Sheets "Quick Comp Creator" or calculator spreadsheet with the full pointed ship list
- ESI name and id resolution for stable ship metadata

The current pipeline should treat the official post and linked sheet as the primary source of tournament legality and points, while using ESI only for stable ship identity and localization.

## Verified official links

### Alliance Tournament XVII
- Official rules post:
  - [AT XVII Rules and Registration](https://www.eveonline.com/news/view/at-xvii-rules-and-registration)
  - Published: 2021-07-19T00:00:00.000Z
- Official Google Sheet:
  - [ATXVII Comp Calculator](https://docs.google.com/spreadsheets/d/1wTPRtJf6U3sE59INBOw9XHWGhOWxZZd_AZu2Yv4bwDU/edit?usp=sharing)
  - Static values tab recovered through Google Visualization JSON using `gid=1760486846`

### Alliance Tournament XVIII
- Official rules post:
  - [Alliance Tournament XVIII Rules and Registration](https://www.eveonline.com/news/view/alliance-tournament-xviii-rules-and-registration)
  - Published: 2022-08-09T00:00:00.000Z
- Official Google Sheet:
  - [ATXVIII Quick Comp Creator](https://docs.google.com/spreadsheets/d/1WzK4id6vkXBiIQMLbLpDGzOuxR7pFifldhBKKYvAYqI/edit?usp=sharing)
  - Static values tab recovered through Google Visualization JSON using `gid=1946786400`

### Alliance Tournament XIX
- Official rules post:
  - [Alliance Tournament XIX Rules and Registration](https://www.eveonline.com/news/view/alliance-tournament-xix-rules-and-registration)
  - Published: 2023-04-25T21:30:00.000Z
- Official Google Sheet:
  - [ATXIX Quick Comp Creator](https://docs.google.com/spreadsheets/d/1kd0NByVdqgQvjb_atFGl3NEe6FMddvV4fG4klVzpzW0/edit?usp=sharing)
  - Static values tab recovered through Google Visualization JSON using `gid=284772315`

### Alliance Tournament XXI
- Official rules post:
  - [Alliance Tournament XXI Rules and Regulations](https://www.eveonline.com/news/view/alliance-tournament-xxi-rules-and-regulations)
  - Published: 2025-07-17T17:45:00.000Z
- Official Google Sheet:
  - [Quick Comp Creator / New Static Values](https://docs.google.com/spreadsheets/d/1f_-vpJnwJvyOk23BmGam_ojeq2uBWTWukFHHIiwxyQQ/edit?usp=sharing)

### Alliance Tournament XX
- Official rules post:
  - [Alliance Tournament XX: Revamped Rules!](https://www.eveonline.com/news/view/alliance-tournament-xx-revamped-rules)
  - Published: 2024-06-28T22:30:00.000Z
- Official Google Sheet:
  - [Quick Comp Creator / Calculator](https://docs.google.com/spreadsheets/d/1uxKDZ4JFz_vUdVCeinyZAjYxwcNr9l414MQMdWq9_eU/edit?usp=sharing)
  - Static values tab recovered through Google Visualization JSON using `gid=284772315`
  - The current 2024 dataset in this repo is generated from that official static-values tab plus ESI name/id resolution

## Current recommendation for future data ingestion

When adding a new tournament year or backfilling an old one:
1. Find the official EVE Online announcement or rules post for that tournament year.
2. Extract the linked Quick Comp Creator / calculator / full pointed-ship spreadsheet from the post HTML.
3. Save the official post HTML into `data/raw/<year>/sources/`.
4. Save the linked Google Sheet reference into `data/raw/<year>/sources/`.
5. Parse the spreadsheet into raw tournament legality and point data.
6. Use ESI to resolve stable ship ids and localized names.
7. Keep manual fixes in `data/raw/<year>/overrides.json`.
8. Generate `ship-catalog.json`, `<year>.json`, and `index.json`.

## Current historical coverage in the repo

- 2021 is generated from the official EVE Online rules post and the official Google Sheet static-values tab.
- 2022 is generated from the official EVE Online rules post and the official Google Sheet static-values tab.
- 2023 is generated from the official EVE Online rules post and the official Google Sheet static-values tab.
- 2025 is generated from the current legacy snapshot source path plus official rules references.
- 2024 is generated from the official EVE Online rules post and the official Google Sheet static-values tab.
- `data/generated/index.json` currently exposes 2021 through 2025 to the app year selector.

## Earliest reliable official-source coverage found so far

- 2021 is the earliest year currently recovered into the app with a linked official calculator sheet and trustworthy ship-level data.
- Older tournament years still have official CCP rules posts available, for example Alliance Tournament XV and XIV.
- I have not yet recovered equally trustworthy official calculator data for those older years, so they are not bundled yet.

## Important caveat

Do not treat the current legacy app dataset as the final source of truth for future years. It is acceptable as a bootstrap or fallback only when the official post or official spreadsheet cannot be recovered.

## Reusable future-session prompt

Use this prompt in a future session when a tournament year needs to be fetched or backfilled:

`Open /Users/nick/Desktop/Projects/eve-at-draft on branch codex/refactor. Read docs/refactor-plan.md, docs/refactor-todo.md, docs/session-notes.md, and docs/tournament-source-notes.md. For tournament year <YEAR>, find the official EVE Online rules or announcement post, extract the linked Quick Comp Creator or calculator spreadsheet if it exists, store the raw upstream artifacts under data/raw/<YEAR>/sources/, parse the official spreadsheet or source into the pipeline's raw format, use ESI for stable ship ids and localized names, apply overrides only where necessary, regenerate the generated outputs, update the docs, and commit the work.` 
