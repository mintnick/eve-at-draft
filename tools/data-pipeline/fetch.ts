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
  await writeJsonFile(idsResponse, config.sourcesDir, 'ids.tranquility.json')
  await writeJsonFile(enNames, config.sourcesDir, 'names.en.tranquility.json')
  await writeJsonFile(zhNames, config.sourcesDir, 'names.zh.serenity.json')
  await writeJsonFile(source, config.rawDir, config.sourceFile)
  console.log(`Fetched upstream tournament artifacts and raw source for ${year}`)
}
