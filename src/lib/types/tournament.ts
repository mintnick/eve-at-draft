export type LocaleCode = 'en' | 'zh'

export type HullType =
  | 'Flagship'
  | 'Logistics'
  | 'Battleship'
  | 'Battlecruiser'
  | 'Cruiser'
  | 'Destroyer'
  | 'Frigate'
  | 'Industrial'
  | 'Corvette'

export interface TournamentSummary {
  year: number
  slug: string
  label: string
  locales: LocaleCode[]
}

export interface TournamentIndexEntry extends TournamentSummary {
  generatedFile: string
}

export interface SourceReference {
  label: string
  url: string
}

export interface RuleConfig {
  maxPoints: number
  maxShips: number
  hullCaps: Partial<Record<HullType, number>>
  banRules: {
    enabled: boolean
    enforced: boolean
    bansPerHull?: number
  }
  flagship: {
    enabled: boolean
    hullTypeOverrides: Partial<Record<string, HullType>>
  }
}

export interface ShipCatalogEntry {
  shipId: number
  key: string
  names: Record<LocaleCode, string>
}

export type ShipCatalog = Record<string, ShipCatalogEntry>

export interface TournamentShipRule {
  shipId: number
  points: number
  logisticsWeight?: number
  flagshipEligible?: boolean
}

export type TournamentHullRules = Record<HullType, Record<string, TournamentShipRule>>

export interface TournamentDataset {
  summary: TournamentSummary
  sources: SourceReference[]
  rules: RuleConfig
  hulls: TournamentHullRules
}

export interface DraftShipSelection {
  hullType: HullType
  shipKey: string
  shipId: number
  points: number
}

export type DraftBuckets = Partial<Record<HullType, DraftShipSelection[]>>

export interface DraftState {
  picks: DraftBuckets
  bans: DraftBuckets
}

export type DraftAction =
  | { type: 'pick'; shipKey: string }
  | { type: 'remove'; shipKey: string; hullType: HullType }
  | { type: 'ban'; shipKey: string }
  | { type: 'unban'; shipKey: string; hullType: HullType }
  | { type: 'clear-picks' }
  | { type: 'clear-bans' }

export interface DraftValidationResult {
  valid: boolean
  reasons: string[]
}
