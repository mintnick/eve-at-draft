import type { HullType } from '../../src/lib/types'

export const GENERATED_INDEX_FILE = 'index.json'
export const SHIP_CATALOG_FILE = 'ship-catalog.json'

export interface TournamentPipelineConfig {
  year: number
  slug: string
  label: string
  rawDir: string
  generatedFile: string
  sourceFile: string
  overridesFile: string
  rules: {
    maxPoints: number
    maxShips: number
    hullCaps: Record<HullType, number>
    rulesLink: string
    banLink: string
    banRules: {
      enabled: boolean
      enforced: boolean
      bansPerHull?: number
    }
    flagshipOverrides: Partial<Record<string, HullType>>
  }
}

export const TOURNAMENTS: TournamentPipelineConfig[] = [
  {
    year: 2025,
    slug: 'alliance-tournament-xxi',
    label: 'Alliance Tournament XXI',
    rawDir: 'data/raw/2025',
    generatedFile: '2025.json',
    sourceFile: 'source.json',
    overridesFile: 'overrides.json',
    rules: {
      maxPoints: 200,
      maxShips: 10,
      hullCaps: {
        Flagship: 1,
        Logistics: 1,
        Battleship: 3,
        Battlecruiser: 3,
        Cruiser: 3,
        Destroyer: 3,
        Frigate: 3,
        Industrial: 3,
        Corvette: 3,
      },
      rulesLink: 'https://www.eveonline.com/news/view/alliance-tournament-xxi-rules-and-regulations',
      banLink: 'https://www.eveonline.com/news/view/alliance-tournament-xxi-rules-and-regulations#h2-15',
      banRules: {
        enabled: true,
        enforced: false,
      },
      flagshipOverrides: {
        Shapash: 'Frigate',
        Geri: 'Frigate',
        Raiju: 'Frigate',
        Cybele: 'Cruiser',
        Laelaps: 'Cruiser',
        Bestla: 'Cruiser',
      },
    },
  },
]

export function getTournamentConfig(year: number): TournamentPipelineConfig {
  const config = TOURNAMENTS.find((entry) => entry.year === year)
  if (!config) throw new Error(`No pipeline config found for tournament year ${year}`)
  return config
}
