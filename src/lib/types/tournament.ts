import type { LocaleCode } from '@/lib/i18n/locales'

export type { LocaleCode } from '@/lib/i18n/locales'

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
  pointInflation?: {
    duplicateShipIncrement: number
  }
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
  originalPoints?: number
  points: number
  logisticsWeight?: number
}

export type DraftBuckets = Record<HullType, DraftShipSelection[]>

export interface DraftState {
  picks: DraftBuckets
  bans: DraftBuckets
}

export type DraftAction =
  | { type: 'pick'; hullType: HullType; shipKey: string }
  | { type: 'remove'; shipKey: string; hullType: HullType }
  | { type: 'ban'; hullType: HullType; shipKey: string }
  | { type: 'unban'; shipKey: string; hullType: HullType }
  | { type: 'clear-picks' }
  | { type: 'clear-bans' }

export interface DraftValidationResult {
  valid: boolean
  reasons: string[]
}

export interface ParsedDraft {
  version: 'v1'
  year: number
  picks: Array<{
    hullType: HullType
    shipKey: string
  }>
  bans: Array<{
    hullType: HullType
    shipKey: string
  }>
}
