# Tools

Build-time fetch, normalization, and validation scripts live here.

- `data-pipeline/cli.ts` provides `fetch`, `build`, `validate`, and `refresh` commands
- `validate-data.ts` verifies the baseline refactor file layout

Current commands:
- `yarn data:fetch` snapshots the current source provider into `data/raw/2025/source.json`
- `yarn data:build` normalizes raw data into generated outputs
- `yarn data:validate` validates generated outputs
- `yarn data:refresh` runs fetch, build, and validate for the configured year
