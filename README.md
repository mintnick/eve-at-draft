# EVE Online Alliance Tournament Draft Tool

This is a Vue + PrimeVue draft helper for EVE Alliance Tournament formats.

Current bundled tournament years:
- 2021: Alliance Tournament XVII
- 2022: Alliance Tournament XVIII
- 2023: Alliance Tournament XIX
- 2024: Alliance Tournament XX
- 2025: Alliance Tournament XXI

## Development

```bash
yarn
yarn dev
```

App validation:

```bash
yarn typecheck
yarn test:run
yarn build
```

## Tournament data pipeline

The generated app data lives under `data/generated/`. Raw upstream captures live under `data/raw/<year>/`.

Default refresh commands still target 2025:

```bash
yarn data:fetch
yarn data:build
yarn data:validate
yarn data:refresh
```

To fetch, build, or validate another year explicitly, run the pipeline CLI with the year:

```bash
tsx ./tools/data-pipeline/cli.ts fetch 2024
tsx ./tools/data-pipeline/cli.ts build 2024
tsx ./tools/data-pipeline/cli.ts validate 2024
```

## Rules notes

The ban rules are intentionally not auto-enforced in the UI, because tournament ban flow can include shared bans and final-day carry-over bans.

Official rules links:
- [AT XVII Rules and Registration](https://www.eveonline.com/news/view/at-xvii-rules-and-registration)
- [Alliance Tournament XVIII Rules and Registration](https://www.eveonline.com/news/view/alliance-tournament-xviii-rules-and-registration)
- [Alliance Tournament XIX Rules and Registration](https://www.eveonline.com/news/view/alliance-tournament-xix-rules-and-registration)
- [Alliance Tournament XXI Rules and Regulations](https://www.eveonline.com/news/view/alliance-tournament-xxi-rules-and-regulations)
- [Alliance Tournament XX: Revamped Rules!](https://www.eveonline.com/news/view/alliance-tournament-xx-revamped-rules)

## Refactor docs

- [Docs index](./docs/README.md)
- [Current baseline](./docs/current-baseline.md)
- [Refactor plan](./docs/refactor-plan.md)
- [Refactor TODO](./docs/refactor-todo.md)
- [Session notes](./docs/session-notes.md)
- [Tournament source notes](./docs/tournament-source-notes.md)
- [Maintainer guide](./docs/maintainer-guide.md)
