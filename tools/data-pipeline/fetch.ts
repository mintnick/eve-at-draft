import * as OpenCC from 'opencc-js'

import type { HullType } from '../../src/lib/types'
import type { LocaleCode } from '../../src/lib/i18n/locales'
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

async function fetchOk(url: string, init?: RequestInit): Promise<Response> {
  let response: Response
  try {
    response = await fetch(url, init)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    throw new Error(`Network error fetching ${url}: ${message}`)
  }
  if (!response.ok) {
    throw new Error(`Fetch failed ${response.status} ${response.statusText}: ${url}`)
  }
  return response
}

async function fetchText(url: string, init?: RequestInit): Promise<string> {
  const response = await fetchOk(url, init)
  return response.text()
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetchOk(url, init)
  return response.json() as Promise<T>
}

async function isArchiveAvailable(archiveUrl: string | undefined): Promise<boolean> {
  if (!archiveUrl) return true

  try {
    const response = await fetch(archiveUrl, { method: 'HEAD', redirect: 'follow' })
    // Fail open: only a definitive "not there" hides the link. A server error or a rate
    // limit must leave it in place.
    return response.status !== 404 && response.status !== 410
  } catch {
    // Also fail open. Returning false here would let one offline pipeline run silently
    // strip the archive link from every tournament year at once.
    return true
  }
}

const ESI_TYPE_NAME_LOCALES = ['zh-CN', 'ru', 'de', 'ja', 'ko', 'fr', 'es'] as const
const TYPE_NAME_FETCH_CONCURRENCY = 12
type EsiTypeNameLocale = (typeof ESI_TYPE_NAME_LOCALES)[number]
type LocalizedTypeNamesByLocale = Record<EsiTypeNameLocale, Record<number, string>>
const convertZhCnToZhTw = OpenCC.Converter({ from: 'cn', to: 'tw' })

const ESI_LANGUAGE_BY_LOCALE = {
  'zh-CN': 'zh',
  ru: 'ru',
  de: 'de',
  ja: 'ja',
  ko: 'ko',
  fr: 'fr',
  es: 'es',
} satisfies Record<EsiTypeNameLocale, string>

export async function fetchTournamentSource(year: number): Promise<void> {
  const config = getTournamentConfig(year)
  if (config.sourceProvider === 'official-sheet-static-values') {
    await fetchOfficialSheetTournamentSource(year)
    return
  }

  const [legacyShips, rulesHtml] = await Promise.all([
    readJsonFile<LegacyShips>('src', 'assets', 'ships.json'),
    fetchText(config.rulesPageUrl),
  ])

  const shipKeys = [...new Set(Object.values(legacyShips).flatMap((shipMap) => Object.keys(shipMap)))]

  const idsResponse = await fetchJson<{ inventory_types?: { id: number; name: string }[] }>(
    'https://esi.evetech.net/latest/universe/ids/?datasource=tranquility&language=en',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(shipKeys),
    },
  )

  const inventoryTypes = idsResponse.inventory_types ?? []
  const filteredIdsResponse = {
    inventory_types: inventoryTypes,
  }
  const shipIds = inventoryTypes.map((entry) => entry.id)

  const [enNames, localizedTypeNames] = await Promise.all([
    fetchJson<{ id: number; name: string }[]>(
      'https://esi.evetech.net/latest/universe/names/?datasource=tranquility',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(shipIds),
      },
    ),
    fetchLocalizedTypeNames(shipIds, ESI_TYPE_NAME_LOCALES),
  ])

  const idByKey = Object.fromEntries(inventoryTypes.map((entry) => [entry.name, entry.id]))
  const enNamesById = Object.fromEntries(enNames.map((entry) => [entry.id, entry.name]))

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
            names: {
              ...createShipNames(shipKey, idByKey[shipKey] ?? ship.ship_id, enNamesById, localizedTypeNames),
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
    archiveAvailable: await isArchiveAvailable(config.archiveUrl),
    hulls,
  }

  await writeTextFile(rulesHtml, config.sourcesDir, 'rules.html')
  await writeJsonFile(filteredIdsResponse, config.sourcesDir, 'ids.tranquility.json')
  await writeJsonFile(enNames, config.sourcesDir, 'names.en.tranquility.json')
  await writeJsonFile(localizedTypeNames, config.sourcesDir, 'type-names.tranquility.json')
  await writeJsonFile(source, config.rawDir, config.sourceFile)
  console.log(`Fetched upstream tournament artifacts and raw source for ${year}`)
}

async function fetchOfficialSheetTournamentSource(year: number): Promise<void> {
  const config = getTournamentConfig(year)
  const [legacyShips, rulesHtml, sheetHtml, staticValuesText] = await Promise.all([
    readJsonFile<LegacyShips>('src', 'assets', 'ships.json'),
    fetchText(config.rulesPageUrl),
    fetchText(config.sheetUrl!),
    fetchText(`https://docs.google.com/spreadsheets/d/${extractSheetId(config.sheetUrl!)}/gviz/tq?tqx=out:json&gid=${config.staticValuesGid}`),
  ])

  const shipKeys = new Set(Object.values(legacyShips).flatMap((shipMap) => Object.keys(shipMap)))
  const logisticsWeights = Object.fromEntries(
    Object.entries(legacyShips.Logistics ?? {}).map(([shipKey, ship]) => [shipKey, ship.logistics]),
  )

  const staticValues = parseStaticValuesTable(staticValuesText, shipKeys)
  for (const shipKey of config.rules.flagshipExclusions ?? []) {
    const entry = staticValues[shipKey]
    if (entry) {
      entry.flagshipEligible = false
    }
  }
  const flagshipExtras = Object.keys(config.rules.flagshipOverrides)
  const shipKeysForIds = [...new Set([...Object.keys(staticValues), ...flagshipExtras])]

  const idsResponse = await fetchJson<{ inventory_types?: { id: number; name: string }[] }>(
    'https://esi.evetech.net/latest/universe/ids/?datasource=tranquility&language=en',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(shipKeysForIds),
    },
  )

  const inventoryTypes = idsResponse.inventory_types ?? []
  const filteredIdsResponse = {
    inventory_types: inventoryTypes,
  }
  const shipIds = inventoryTypes.map((entry) => entry.id)

  const [enNames, localizedTypeNames] = await Promise.all([
    fetchJson<{ id: number; name: string }[]>(
      'https://esi.evetech.net/latest/universe/names/?datasource=tranquility',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(shipIds),
      },
    ),
    fetchLocalizedTypeNames(shipIds, ESI_TYPE_NAME_LOCALES),
  ])

  const idByKey = Object.fromEntries(inventoryTypes.map((entry) => [entry.name, entry.id]))
  const enNamesById = Object.fromEntries(enNames.map((entry) => [entry.id, entry.name]))

  const hulls = buildOfficialHulls(staticValues, idByKey, enNamesById, localizedTypeNames, logisticsWeights, config.rules.flagshipOverrides)

  const source: RawTournamentSource = {
    year,
    provider: 'official-sheet-static-values',
    capturedAt: new Date().toISOString(),
    archiveAvailable: await isArchiveAvailable(config.archiveUrl),
    hulls,
  }

  await writeTextFile(rulesHtml, config.sourcesDir, 'rules.html')
  await writeTextFile(sheetHtml, config.sourcesDir, 'sheet.html')
  await writeTextFile(staticValuesText, config.sourcesDir, 'static-values.gviz.json')
  await writeJsonFile(filteredIdsResponse, config.sourcesDir, 'ids.tranquility.json')
  await writeJsonFile(enNames, config.sourcesDir, 'names.en.tranquility.json')
  await writeJsonFile(localizedTypeNames, config.sourcesDir, 'type-names.tranquility.json')
  await writeJsonFile(source, config.rawDir, config.sourceFile)
  console.log(`Fetched upstream tournament artifacts and raw source for ${year}`)
}

async function fetchLocalizedTypeNames(
  shipIds: number[],
  locales: readonly EsiTypeNameLocale[],
): Promise<LocalizedTypeNamesByLocale> {
  const entries = await Promise.all(
    locales.map(async (locale) => {
      const names: Array<readonly [number, string | undefined]> = []
      for (let index = 0; index < shipIds.length; index += TYPE_NAME_FETCH_CONCURRENCY) {
        const batch = shipIds.slice(index, index + TYPE_NAME_FETCH_CONCURRENCY)
        const batchNames = await Promise.all(batch.map(async (shipId) => {
          const esiLanguage = ESI_LANGUAGE_BY_LOCALE[locale]
          const payload = await fetchJson<{ name?: string }>(
            `https://esi.evetech.net/latest/universe/types/${shipId}/?datasource=tranquility&language=${esiLanguage}`,
          )
          return [shipId, payload.name] as const
        }))
        names.push(...batchNames)
      }

      return [
        locale,
        Object.fromEntries(names.filter((entry): entry is [number, string] => Boolean(entry[1]))),
      ] as const
    }),
  )

  return Object.fromEntries(entries) as LocalizedTypeNamesByLocale
}

function createShipNames(
  shipKey: string,
  shipId: number,
  enNamesById: Record<number, string>,
  localizedTypeNames: LocalizedTypeNamesByLocale,
): Record<LocaleCode, string> {
  const en = enNamesById[shipId] ?? shipKey
  const zhCN = localizedTypeNames['zh-CN'][shipId] ?? en

  return {
    en,
    'zh-CN': zhCN,
    'zh-TW': convertZhCnToZhTw(zhCN),
    ru: localizedTypeNames.ru[shipId] ?? en,
    de: localizedTypeNames.de[shipId] ?? en,
    ja: localizedTypeNames.ja[shipId] ?? en,
    ko: localizedTypeNames.ko[shipId] ?? en,
    fr: localizedTypeNames.fr[shipId] ?? en,
    es: localizedTypeNames.es[shipId] ?? en,
  }
}

function extractSheetId(sheetUrl: string): string {
  const match = sheetUrl.match(/\/spreadsheets\/d\/([^/]+)/)
  if (!match) {
    throw new Error(`Could not extract sheet id from ${sheetUrl}`)
  }

  return match[1]
}

interface StaticValueEntry {
  hullType: HullType
  points: number
  logisticsWeight?: number
  inflationIncrement?: number
  flagshipEligible: boolean
}

function parseStaticValuesTable(
  responseText: string,
  canonicalShipKeys: Set<string>,
): Record<string, StaticValueEntry> {
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

  const entries = new Map<string, StaticValueEntry>()
  // The last column set is the authoritative full ship list; the earlier ones are
  // per-class summary blocks whose rows are only trusted when they name a known ship.
  // Column sets are the outer loop so the authoritative block always wins: a ship can
  // appear in a summary block on a *later* row than its authoritative row, and the
  // summary columns carry no inflation value to copy over.
  const columnSets = [
    { name: 0, points: 1, hull: 2, inflation: -1, authoritative: false },
    { name: 4, points: 6, hull: 7, inflation: -1, authoritative: false },
    { name: 5, points: 7, hull: 8, inflation: 9, authoritative: true },
  ] as const

  for (const columnSet of columnSets) {
    for (const row of payload.table.rows) {
      const values = row.c.map((cell) => cell?.v ?? null)

      const rawName = values[columnSet.name]
      const rawPoints = values[columnSet.points]
      const rawHull = values[columnSet.hull]

      if (typeof rawName !== 'string' || typeof rawPoints !== 'number' || typeof rawHull !== 'string') {
        continue
      }

      const normalizedName = normalizeStaticValueName(rawName)
      if (!columnSet.authoritative && !canonicalShipKeys.has(normalizedName)) {
        continue
      }

      const hull = normalizeHullType(rawHull)
      if (!hull) {
        continue
      }

      const rawInflation = columnSet.inflation >= 0 ? values[columnSet.inflation] : null

      entries.set(normalizedName, {
        hullType: hull.hullType,
        points: rawPoints,
        logisticsWeight: hull.logisticsWeight,
        inflationIncrement: typeof rawInflation === 'number' ? rawInflation : undefined,
        flagshipEligible: hull.hullType === 'Battleship',
      })
    }
  }

  return Object.fromEntries(entries)
}

function normalizeStaticValueName(value: string): string {
  return value.replace(/\s+\([^)]*\)\s*$/, '').trim()
}

function normalizeHullType(value: string): { hullType: HullType; logisticsWeight?: number } | null {
  // Logistics cruisers fill the single logistics slot; two logistics frigates fill it instead.
  if (value === 'Logistics') return { hullType: 'Logistics', logisticsWeight: 1 }
  if (value === 'Logistics Frigate') return { hullType: 'Logistics', logisticsWeight: 0.5 }
  if (value === 'Battleship') return { hullType: 'Battleship' }
  if (value === 'Battlecruiser') return { hullType: 'Battlecruiser' }
  if (value === 'Cruiser') return { hullType: 'Cruiser' }
  if (value === 'Destroyer') return { hullType: 'Destroyer' }
  if (value === 'Frigate') return { hullType: 'Frigate' }
  if (value === 'Industrial') return { hullType: 'Industrial' }
  if (value === 'Corvette') return { hullType: 'Corvette' }
  return null
}

function buildOfficialHulls(
  staticValues: Record<string, StaticValueEntry>,
  idByKey: Record<string, number>,
  enNamesById: Record<number, string>,
  localizedTypeNames: LocalizedTypeNamesByLocale,
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
      logisticsWeight: ship.hullType === 'Logistics'
        ? ship.logisticsWeight ?? logisticsWeights[shipKey]
        : undefined,
      inflationIncrement: ship.inflationIncrement,
      names: {
        ...createShipNames(shipKey, shipId, enNamesById, localizedTypeNames),
      },
    }
  }

  for (const [shipKey, ship] of Object.entries(hulls.Battleship ?? {})) {
    if (staticValues[shipKey]?.flagshipEligible === false) {
      continue
    }

    hulls.Flagship![shipKey] = {
      ...ship,
    }
  }

  for (const shipKey of Object.keys(flagshipOverrides)) {
    const existing = Object.values(hulls).flatMap((shipMap) => Object.entries(shipMap ?? {})).find(([key]) => key === shipKey)?.[1]
    if (!existing) {
      continue
    }

    hulls.Flagship![shipKey] = {
      ...existing,
    }
  }

  return hulls
}
