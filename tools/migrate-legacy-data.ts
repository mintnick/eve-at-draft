import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import legacyShips from '../src/assets/ships.json'
import en from '../src/assets/locales/en.json'
import zh from '../src/assets/locales/zh.json'
import type {
  HullType,
  ShipDefinition,
  TournamentDataset,
  TournamentHullCatalog,
  TournamentIndexEntry,
} from '../src/lib/types'

const enShipNames = en.ships as Record<string, string>
const zhShipNames = zh.ships as Record<string, string>

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const generatedDir = path.resolve(__dirname, '../data/generated')

const currentYear = 2025
const datasetFile = `${currentYear}.json`

const rulesLink = 'https://www.eveonline.com/news/view/alliance-tournament-xxi-rules-and-regulations'
const banLink = 'https://www.eveonline.com/news/view/alliance-tournament-xxi-rules-and-regulations#h2-15'

const hullCaps: Record<HullType, number> = {
  Flagship: 1,
  Logistics: 1,
  Battleship: 3,
  Battlecruiser: 3,
  Cruiser: 3,
  Destroyer: 3,
  Frigate: 3,
  Industrial: 3,
  Corvette: 3,
}

function buildHullCatalog(): TournamentHullCatalog {
  return Object.fromEntries(
    Object.entries(legacyShips).map(([hullType, ships]) => {
      const entries = Object.fromEntries(
        Object.entries(ships).map(([shipKey, property]) => {
          const ship = property as {
            ship_id: number
            points: number
            logistics?: number
          }

          const localizedShip: ShipDefinition = {
            shipId: ship.ship_id,
            points: ship.points,
            logisticsWeight: ship.logistics,
            flagshipEligible: hullType === 'Flagship',
            names: {
              en: enShipNames[String(ship.ship_id)] ?? shipKey,
              zh: zhShipNames[String(ship.ship_id)] ?? shipKey,
            },
          }

          return [shipKey, localizedShip]
        }),
      )

      return [hullType, entries]
    }),
  ) as TournamentHullCatalog
}

async function main() {
  const dataset: TournamentDataset = {
    summary: {
      year: currentYear,
      slug: 'alliance-tournament-xxi',
      label: 'Alliance Tournament XXI',
      locales: ['en', 'zh'],
    },
    sources: [
      { label: 'Rules', url: rulesLink },
      { label: 'Ban Rules', url: banLink },
    ],
    rules: {
      maxPoints: 200,
      maxShips: 10,
      hullCaps,
      banRules: {
        enabled: true,
        enforced: false,
      },
      flagship: {
        enabled: true,
        hullTypeOverrides: {
          Shapash: 'Frigate',
          Geri: 'Frigate',
          Raiju: 'Frigate',
          Cybele: 'Cruiser',
          Laelaps: 'Cruiser',
          Bestla: 'Cruiser',
        },
      },
    },
    hulls: buildHullCatalog(),
  }

  const tournamentIndex: TournamentIndexEntry[] = [
    {
      ...dataset.summary,
      generatedFile: datasetFile,
    },
  ]

  await mkdir(generatedDir, { recursive: true })
  await writeFile(path.join(generatedDir, datasetFile), `${JSON.stringify(dataset, null, 2)}\n`)
  await writeFile(path.join(generatedDir, 'index.json'), `${JSON.stringify(tournamentIndex, null, 2)}\n`)

  console.log(`Generated ${datasetFile} and index.json`)
}

main().catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})
