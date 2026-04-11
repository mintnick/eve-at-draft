import type { HullType, LocaleCode } from '../../src/lib/types'

export interface RawShipRecord {
  shipId: number
  points: number
  logisticsWeight?: number
  flagshipEligible?: boolean
  names: Record<LocaleCode, string>
}

export interface RawTournamentSource {
  year: number
  provider: string
  capturedAt: string
  hulls: Partial<Record<HullType, Record<string, RawShipRecord>>>
}

export interface RawTournamentOverrides {
  ships?: Record<
    string,
    Omit<Partial<Pick<RawShipRecord, 'points' | 'logisticsWeight' | 'flagshipEligible'>>, 'names'> & {
      names?: Partial<Record<LocaleCode, string>>
    }
  >
}
