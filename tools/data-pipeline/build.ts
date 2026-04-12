import type {
  ShipCatalog,
  ShipCatalogEntry,
  TournamentDataset,
  TournamentHullRules,
  TournamentIndexEntry,
  TournamentShipRule,
} from '../../src/lib/types'
import { GENERATED_INDEX_FILE, getTournamentConfig, SHIP_CATALOG_FILE, TOURNAMENTS } from './config'
import { readJsonFile, writeJsonFile } from './fs'
import type { RawTournamentOverrides, RawTournamentSource } from './types'

export function mergeSourceWithOverrides(
  source: RawTournamentSource,
  overrides: RawTournamentOverrides,
): RawTournamentSource {
  const mergedHulls = Object.fromEntries(
    Object.entries(source.hulls).map(([hullType, shipMap]) => [
      hullType,
      Object.fromEntries(
        Object.entries(shipMap ?? {}).map(([shipKey, ship]) => {
          const override = overrides.ships?.[shipKey]
          return [
            shipKey,
            {
              ...ship,
              ...override,
              names: {
                ...ship.names,
                ...(override?.names ?? {}),
              },
            },
          ]
        }),
      ),
    ]),
  )

  return {
    ...source,
    hulls: mergedHulls,
  }
}

export function createShipCatalog(source: RawTournamentSource): ShipCatalog {
  const entries = new Map<string, ShipCatalogEntry>()

  for (const shipMap of Object.values(source.hulls)) {
    for (const [shipKey, ship] of Object.entries(shipMap ?? {})) {
      if (!entries.has(shipKey)) {
        entries.set(shipKey, {
          shipId: ship.shipId,
          names: ship.names,
        })
      }
    }
  }

  return Object.fromEntries(entries)
}

export function mergeShipCatalogEntries(sources: RawTournamentSource[]): ShipCatalog {
  const entries = new Map<string, ShipCatalogEntry>()

  for (const source of sources) {
    const catalog = createShipCatalog(source)
    for (const [shipKey, ship] of Object.entries(catalog)) {
      if (!entries.has(shipKey)) {
        entries.set(shipKey, ship)
      }
    }
  }

  return Object.fromEntries(entries)
}

export function createYearlyRules(source: RawTournamentSource): TournamentHullRules {
  return Object.fromEntries(
    Object.entries(source.hulls).map(([hullType, shipMap]) => [
      hullType,
      Object.fromEntries(
        Object.entries(shipMap ?? {})
          .map(([shipKey, ship]): [string, TournamentShipRule] => [
            shipKey,
            {
              shipId: ship.shipId,
              points: ship.points,
              logisticsWeight: ship.logisticsWeight,
            },
          ])
          .sort(([aKey, a], [bKey, b]) => b.points - a.points || aKey.localeCompare(bKey)),
      ),
    ]),
  ) as TournamentHullRules
}

export async function buildTournamentArtifacts(year: number): Promise<void> {
  const config = getTournamentConfig(year)
  const [source, overrides] = await Promise.all([
    readJsonFile<RawTournamentSource>(config.rawDir, config.sourceFile),
    readJsonFile<RawTournamentOverrides>(config.rawDir, config.overridesFile),
  ])

  const merged = mergeSourceWithOverrides(source, overrides)
  const allMergedSources = await Promise.all(
    TOURNAMENTS.map(async (entry) => {
      const [entrySource, entryOverrides] = await Promise.all([
        readJsonFile<RawTournamentSource>(entry.rawDir, entry.sourceFile),
        readJsonFile<RawTournamentOverrides>(entry.rawDir, entry.overridesFile),
      ])

      return mergeSourceWithOverrides(entrySource, entryOverrides)
    }),
  )
  const shipCatalog = mergeShipCatalogEntries(allMergedSources)

  const dataset: TournamentDataset = {
    summary: {
      year: config.year,
      prize: config.prize,
    },
    sources: [
      { label: 'Rules', url: config.rules.rulesLink },
      { label: 'Ban Rules', url: config.rules.banLink },
      ...(config.archiveUrl ? [{ label: 'Match Archive', url: config.archiveUrl }] : []),
    ],
    rules: {
      maxPoints: config.rules.maxPoints,
      maxShips: config.rules.maxShips,
      hullCaps: config.rules.hullCaps,
      pointInflation: config.rules.pointInflation,
      flagship: {
        hullTypeOverrides: config.rules.flagshipOverrides,
      },
    },
    hulls: createYearlyRules(merged),
  }

  const index: TournamentIndexEntry[] = TOURNAMENTS.map((entry) => ({
    year: entry.year,
    label: entry.label,
    generatedFile: entry.generatedFile,
  }))

  await writeJsonFile(shipCatalog, 'data', 'generated', SHIP_CATALOG_FILE)
  await writeJsonFile(dataset, 'data', 'generated', config.generatedFile)
  await writeJsonFile(index, 'data', 'generated', GENERATED_INDEX_FILE)

  console.log(`Built generated dataset for ${year}`)
}
