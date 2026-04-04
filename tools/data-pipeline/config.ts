import type { HullType } from '../../src/lib/types'

export const GENERATED_INDEX_FILE = 'index.json'
export const SHIP_CATALOG_FILE = 'ship-catalog.json'

export interface TournamentPipelineConfig {
  sourceProvider: 'legacy-repo-snapshot' | 'official-sheet-static-values'
  year: number
  slug: string
  label: string
  rawDir: string
  sourcesDir: string
  generatedFile: string
  sourceFile: string
  overridesFile: string
  rulesPageUrl: string
  sheetUrl?: string
  staticValuesGid?: number
  rules: {
    maxPoints: number
    maxShips: number
    hullCaps: Record<HullType, number>
    pointInflation?: {
      duplicateShipIncrement: number
    }
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
    sourceProvider: 'official-sheet-static-values',
    year: 2024,
    slug: 'alliance-tournament-xx',
    label: 'Alliance Tournament XX',
    rawDir: 'data/raw/2024',
    sourcesDir: 'data/raw/2024/sources',
    generatedFile: '2024.json',
    sourceFile: 'source.json',
    overridesFile: 'overrides.json',
    rulesPageUrl: 'https://www.eveonline.com/news/view/alliance-tournament-xx-revamped-rules',
    sheetUrl: 'https://docs.google.com/spreadsheets/d/1uxKDZ4JFz_vUdVCeinyZAjYxwcNr9l414MQMdWq9_eU/edit?usp=sharing',
    staticValuesGid: 284772315,
    rules: {
      maxPoints: 200,
      maxShips: 10,
      hullCaps: {
        Flagship: 1,
        Logistics: 1,
        Battleship: 4,
        Battlecruiser: 4,
        Cruiser: 4,
        Destroyer: 4,
        Frigate: 4,
        Industrial: 4,
        Corvette: 4,
      },
      pointInflation: {
        duplicateShipIncrement: 1,
      },
      rulesLink: 'https://www.eveonline.com/news/view/alliance-tournament-xx-revamped-rules',
      banLink: 'https://www.eveonline.com/news/view/alliance-tournament-xx-revamped-rules#h2-17',
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
  {
    sourceProvider: 'legacy-repo-snapshot',
    year: 2025,
    slug: 'alliance-tournament-xxi',
    label: 'Alliance Tournament XXI',
    rawDir: 'data/raw/2025',
    sourcesDir: 'data/raw/2025/sources',
    generatedFile: '2025.json',
    sourceFile: 'source.json',
    overridesFile: 'overrides.json',
    rulesPageUrl: 'https://www.eveonline.com/news/view/alliance-tournament-xxi-rules-and-regulations',
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
      pointInflation: undefined,
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
