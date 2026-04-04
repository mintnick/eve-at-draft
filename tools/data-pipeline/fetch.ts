import type { HullType } from '../../src/lib/types'
import type { RawShipRecord, RawTournamentSource } from './types'
import { getTournamentConfig } from './config'
import { readJsonFile, writeJsonFile } from './fs'

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
  const [legacyShips, en, zh] = await Promise.all([
    readJsonFile<LegacyShips>('src', 'assets', 'ships.json'),
    readJsonFile<LegacyLocale>('src', 'assets', 'locales', 'en.json'),
    readJsonFile<LegacyLocale>('src', 'assets', 'locales', 'zh.json'),
  ])

  const hulls = Object.fromEntries(
    Object.entries(legacyShips).map(([hullType, shipMap]) => [
      hullType,
      Object.fromEntries(
        Object.entries(shipMap).map(([shipKey, ship]) => [
          shipKey,
          {
            shipId: ship.ship_id,
            points: ship.points,
            logisticsWeight: ship.logistics,
            flagshipEligible: hullType === 'Flagship',
            names: {
              en: en.ships[String(ship.ship_id)] ?? shipKey,
              zh: zh.ships[String(ship.ship_id)] ?? shipKey,
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

  await writeJsonFile(source, config.rawDir, config.sourceFile)
  console.log(`Fetched raw tournament source for ${year} into ${config.rawDir}/${config.sourceFile}`)
}
