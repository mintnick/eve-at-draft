import type { HullType, ShipCatalog, TournamentDataset, TournamentIndexEntry } from '../../src/lib/types'
import { GENERATED_INDEX_FILE, getTournamentConfig, SHIP_CATALOG_FILE } from './config'
import { readJsonFile } from './fs'

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

export async function validateTournamentArtifacts(year: number): Promise<void> {
  const config = getTournamentConfig(year)
  const [catalog, dataset, index] = await Promise.all([
    readJsonFile<ShipCatalog>('data', 'generated', SHIP_CATALOG_FILE),
    readJsonFile<TournamentDataset>('data', 'generated', config.generatedFile),
    readJsonFile<TournamentIndexEntry[]>('data', 'generated', GENERATED_INDEX_FILE),
  ])

  const seenShipIds = new Map<number, string>()

  for (const [shipKey, ship] of Object.entries(catalog)) {
    assert(ship.shipId > 0, `Ship ${shipKey} must have a positive shipId`)
    assert(ship.names.en?.trim(), `Ship ${shipKey} is missing English name`)
    assert(ship.names.zh?.trim(), `Ship ${shipKey} is missing Simplified Chinese name`)

    const duplicateKey = seenShipIds.get(ship.shipId)
    assert(!duplicateKey || duplicateKey === shipKey, `Duplicate ship id ${ship.shipId} found for ${shipKey} and ${duplicateKey}`)
    seenShipIds.set(ship.shipId, shipKey)
  }

  assert(dataset.summary.year === year, `Generated dataset year mismatch for ${year}`)
  assert(dataset.rules.maxPoints > 0, 'maxPoints must be positive')
  assert(dataset.rules.maxShips > 0, 'maxShips must be positive')

  for (const [hullType, shipRules] of Object.entries(dataset.hulls) as [HullType, Record<string, { shipId: number }>][]) {
    assert(dataset.rules.hullCaps[hullType], `Missing hull cap for ${hullType}`)

    for (const [shipKey, shipRule] of Object.entries(shipRules)) {
      const catalogEntry = catalog[shipKey]
      assert(catalogEntry, `Missing ship catalog entry for ${shipKey}`)
      assert(catalogEntry.shipId === shipRule.shipId, `Ship id mismatch for ${shipKey}`)
    }
  }

  assert(index.some((entry) => entry.year === year && entry.generatedFile === config.generatedFile), `Generated index missing entry for ${year}`)

  console.log(`Validated generated dataset for ${year}`)
}
