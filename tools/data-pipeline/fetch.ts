import type { HullType } from '../../src/lib/types'
import type { RawShipRecord, RawTournamentSource } from './types'
import { getTournamentConfig } from './config'
import { readJsonFile, writeJsonFile, writeTextFile } from './fs'

type LegacyShips = Record<
  string,
  Record<
    string,
    {
      ship_id: number
      points: number
      logistics?: number
    }
  >
>

type LegacyLocale = {
  ships: Record<string, string>
}

export async function fetchTournamentSource(year: number): Promise<void> {
  const config = getTournamentConfig(year)
  if (config.sourceProvider === 'official-sheet-static-values') {
    await fetchOfficialSheetTournamentSource(year)
    return
  }

  const [legacyShips, rulesHtml] = await Promise.all([
    readJsonFile<LegacyShips>('src', 'assets', 'ships.json'),
    fetch(config.rulesPageUrl).then((response) => response.text()),
  ])

  const shipKeys = [...new Set(Object.values(legacyShips).flatMap((shipMap) => Object.keys(shipMap)))]

  const idsResponse = await fetch('https://esi.evetech.net/latest/universe/ids/?datasource=tranquility&language=en', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(shipKeys),
  }).then((response) => response.json() as Promise<{ inventory_types?: { id: number; name: string }[] }>)

  const inventoryTypes = idsResponse.inventory_types ?? []
  const filteredIdsResponse = {
    inventory_types: inventoryTypes,
  }
  const shipIds = inventoryTypes.map((entry) => entry.id)

  const [enNames, zhNames] = await Promise.all([
    fetch('https://esi.evetech.net/latest/universe/names/?datasource=tranquility', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(shipIds),
    }).then((response) => response.json() as Promise<{ id: number; name: string }[]>),
    fetch('https://ali-esi.evepc.163.com/latest/universe/names/?datasource=serenity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(shipIds.filter((id) => id !== 88001)),
    }).then((response) => response.json() as Promise<{ id: number; name: string }[]>),
  ])

  const idByKey = Object.fromEntries(inventoryTypes.map((entry) => [entry.name, entry.id]))
  const enNamesById = Object.fromEntries(enNames.map((entry) => [entry.id, entry.name]))
  const zhNamesById = Object.fromEntries(zhNames.map((entry) => [entry.id, entry.name]))

  const hulls = Object.fromEntries(
    Object.entries(legacyShips).map(([hullType, shipMap]) => [
      hullType,
      Object.fromEntries(
        Object.entries(shipMap).map(([shipKey, ship]) => [
          shipKey,
          {
            shipId: idByKey[shipKey] ?? ship.ship_id,
            points: ship.points,
            logisticsWeight: ship.logistics,
            flagshipEligible: hullType === 'Flagship',
            names: {
              en: enNamesById[idByKey[shipKey] ?? ship.ship_id] ?? shipKey,
              zh: zhNamesById[idByKey[shipKey] ?? ship.ship_id] ?? shipKey,
            },
          },
        ]),
      ),
    ]),
  ) as Partial<Record<HullType, Record<string, RawShipRecord>>>

  const source: RawTournamentSource = {
    year,
    provider: 'legacy-repo-snapshot',
    capturedAt: new Date().toISOString(),
    hulls,
  }

  await writeTextFile(rulesHtml, config.sourcesDir, 'rules.html')
  await writeJsonFile(filteredIdsResponse, config.sourcesDir, 'ids.tranquility.json')
  await writeJsonFile(enNames, config.sourcesDir, 'names.en.tranquility.json')
  await writeJsonFile(zhNames, config.sourcesDir, 'names.zh.serenity.json')
  await writeJsonFile(source, config.rawDir, config.sourceFile)
  console.log(`Fetched upstream tournament artifacts and raw source for ${year}`)
}

async function fetchOfficialSheetTournamentSource(year: number): Promise<void> {
  const config = getTournamentConfig(year)
  const [legacyShips, rulesHtml, sheetHtml, staticValuesText] = await Promise.all([
    readJsonFile<LegacyShips>('src', 'assets', 'ships.json'),
    fetch(config.rulesPageUrl).then((response) => response.text()),
    fetch(config.sheetUrl!).then((response) => response.text()),
    fetch(`https://docs.google.com/spreadsheets/d/${extractSheetId(config.sheetUrl!)}/gviz/tq?tqx=out:json&gid=${config.staticValuesGid}`).then((response) =>
      response.text(),
    ),
  ])

  const shipKeys = new Set(Object.values(legacyShips).flatMap((shipMap) => Object.keys(shipMap)))
  const logisticsWeights = Object.fromEntries(
    Object.entries(legacyShips.Logistics ?? {}).map(([shipKey, ship]) => [shipKey, ship.logistics]),
  )

  const staticValues = parseStaticValuesTable(staticValuesText, shipKeys)
  const flagshipExtras = Object.keys(config.rules.flagshipOverrides)
  const shipKeysForIds = [...new Set([...Object.keys(staticValues), ...flagshipExtras])]

  const idsResponse = await fetch('https://esi.evetech.net/latest/universe/ids/?datasource=tranquility&language=en', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(shipKeysForIds),
  }).then((response) => response.json() as Promise<{ inventory_types?: { id: number; name: string }[] }>)

  const inventoryTypes = idsResponse.inventory_types ?? []
  const filteredIdsResponse = {
    inventory_types: inventoryTypes,
  }
  const shipIds = inventoryTypes.map((entry) => entry.id)

  const [enNames, zhNames] = await Promise.all([
    fetch('https://esi.evetech.net/latest/universe/names/?datasource=tranquility', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(shipIds),
    }).then((response) => response.json() as Promise<{ id: number; name: string }[]>),
    fetch('https://ali-esi.evepc.163.com/latest/universe/names/?datasource=serenity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(shipIds.filter((id) => id !== 88001)),
    }).then((response) => response.json() as Promise<{ id: number; name: string }[]>),
  ])

  const idByKey = Object.fromEntries(inventoryTypes.map((entry) => [entry.name, entry.id]))
  const enNamesById = Object.fromEntries(enNames.map((entry) => [entry.id, entry.name]))
  const zhNamesById = Object.fromEntries(zhNames.map((entry) => [entry.id, entry.name]))

  const hulls = buildOfficialHulls(staticValues, idByKey, enNamesById, zhNamesById, logisticsWeights, config.rules.flagshipOverrides)

  const source: RawTournamentSource = {
    year,
    provider: 'official-sheet-static-values',
    capturedAt: new Date().toISOString(),
    hulls,
  }

  await writeTextFile(rulesHtml, config.sourcesDir, 'rules.html')
  await writeTextFile(sheetHtml, config.sourcesDir, 'sheet.html')
  await writeTextFile(staticValuesText, config.sourcesDir, 'static-values.gviz.json')
  await writeJsonFile(filteredIdsResponse, config.sourcesDir, 'ids.tranquility.json')
  await writeJsonFile(enNames, config.sourcesDir, 'names.en.tranquility.json')
  await writeJsonFile(zhNames, config.sourcesDir, 'names.zh.serenity.json')
  await writeJsonFile(source, config.rawDir, config.sourceFile)
  console.log(`Fetched upstream tournament artifacts and raw source for ${year}`)
}

function extractSheetId(sheetUrl: string): string {
  const match = sheetUrl.match(/\/spreadsheets\/d\/([^/]+)/)
  if (!match) {
    throw new Error(`Could not extract sheet id from ${sheetUrl}`)
  }

  return match[1]
}

function parseStaticValuesTable(
  responseText: string,
  canonicalShipKeys: Set<string>,
): Record<string, { hullType: HullType; points: number }> {
  const match = responseText.match(/setResponse\((.*)\);/s)
  if (!match) {
    throw new Error('Could not parse Google Visualization response')
  }

  const payload = JSON.parse(match[1]) as {
    table: {
      rows: Array<{
        c: Array<{ v?: string | number | null } | null>
      }>
    }
  }

  const entries = new Map<string, { hullType: HullType; points: number }>()

  for (const row of payload.table.rows) {
    const values = row.c.map((cell) => cell?.v ?? null)

    for (const [nameIndex, pointsIndex, hullIndex] of [
      [0, 1, 2],
      [5, 7, 8],
    ] as const) {
      const rawName = values[nameIndex]
      const rawPoints = values[pointsIndex]
      const rawHull = values[hullIndex]

      if (typeof rawName !== 'string' || typeof rawPoints !== 'number' || typeof rawHull !== 'string') {
        continue
      }

      const normalizedName = normalizeStaticValueName(rawName)
      if (!canonicalShipKeys.has(normalizedName)) {
        continue
      }

      const hullType = normalizeHullType(rawHull)
      if (!hullType) {
        continue
      }

      entries.set(normalizedName, {
        hullType,
        points: rawPoints,
      })
    }
  }

  return Object.fromEntries(entries)
}

function normalizeStaticValueName(value: string): string {
  return value.replace(/\s+\([^)]*\)\s*$/, '').trim()
}

function normalizeHullType(value: string): HullType | null {
  if (value === 'Logistics') return 'Logistics'
  if (value === 'Battleship') return 'Battleship'
  if (value === 'Battlecruiser') return 'Battlecruiser'
  if (value === 'Cruiser') return 'Cruiser'
  if (value === 'Destroyer') return 'Destroyer'
  if (value === 'Frigate') return 'Frigate'
  if (value === 'Industrial') return 'Industrial'
  if (value === 'Corvette') return 'Corvette'
  return null
}

function buildOfficialHulls(
  staticValues: Record<string, { hullType: HullType; points: number }>,
  idByKey: Record<string, number>,
  enNamesById: Record<number, string>,
  zhNamesById: Record<number, string>,
  logisticsWeights: Record<string, number | undefined>,
  flagshipOverrides: Partial<Record<string, HullType>>,
): Partial<Record<HullType, Record<string, RawShipRecord>>> {
  const hulls: Partial<Record<HullType, Record<string, RawShipRecord>>> = {
    Flagship: {},
    Logistics: {},
    Battleship: {},
    Battlecruiser: {},
    Cruiser: {},
    Destroyer: {},
    Frigate: {},
    Industrial: {},
    Corvette: {},
  }

  for (const [shipKey, ship] of Object.entries(staticValues)) {
    const shipId = idByKey[shipKey]
    if (!shipId) {
      continue
    }

    hulls[ship.hullType]![shipKey] = {
      shipId,
      points: ship.points,
      logisticsWeight: ship.hullType === 'Logistics' ? logisticsWeights[shipKey] : undefined,
      flagshipEligible: false,
      names: {
        en: enNamesById[shipId] ?? shipKey,
        zh: zhNamesById[shipId] ?? shipKey,
      },
    }
  }

  for (const [shipKey, ship] of Object.entries(hulls.Battleship ?? {})) {
    hulls.Flagship![shipKey] = {
      ...ship,
      flagshipEligible: true,
    }
  }

  for (const shipKey of Object.keys(flagshipOverrides)) {
    const existing = Object.values(hulls).flatMap((shipMap) => Object.entries(shipMap ?? {})).find(([key]) => key === shipKey)?.[1]
    if (!existing) {
      continue
    }

    hulls.Flagship![shipKey] = {
      ...existing,
      flagshipEligible: true,
    }
  }

  return hulls
}
