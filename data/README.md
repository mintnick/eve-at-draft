# Data

- `raw/` stores upstream source snapshots and manual overrides
- `generated/` stores normalized app-consumable tournament datasets
- `raw/<year>/overrides.json` is the reserved location for year-specific manual corrections
- `raw/<year>/source.json` stores the fetched source snapshot used for normalization
- `raw/<year>/sources/` stores upstream artifacts such as rules HTML and API responses
- `generated/ship-catalog.json` stores canonical cross-year ship identity and localized names
- `generated/index.json` lists the available generated tournament datasets
