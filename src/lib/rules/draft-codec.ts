import type { DraftState, DraftValidationResult, HullType, ParsedDraft, TournamentDataset } from '@/lib/types'

import { applyDraftAction, findRegisteredShip, listSelections, validateDraftAction } from '@/lib/rules/draft-engine'
import { createEmptyDraftState } from '@/lib/rules/draft-state'

const FORMAT_HEADER = 'EVE-AT-DRAFT v1'

export function serializeDraft(state: DraftState, tournament: TournamentDataset): string {
  const picks = listSelections(state, 'picks')
  const bans = listSelections(state, 'bans')

  return [
    FORMAT_HEADER,
    `YEAR: ${tournament.summary.year}`,
    'PICKS:',
    ...picks.map((selection) => formatDraftEntry(selection.hullType, selection.shipKey)),
    'BANS:',
    ...bans.map((selection) => formatDraftEntry(selection.hullType, selection.shipKey)),
  ].join('\n')
}

export function parseDraft(text: string): ParsedDraft {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  if (lines[0] !== FORMAT_HEADER) {
    throw new Error('invalid-format-header')
  }

  const yearLine = lines[1]
  if (!yearLine?.startsWith('YEAR: ')) {
    throw new Error('missing-year')
  }

  const year = Number.parseInt(yearLine.slice(6), 10)
  if (!Number.isFinite(year)) {
    throw new Error('invalid-year')
  }

  const picksIndex = lines.indexOf('PICKS:')
  const bansIndex = lines.indexOf('BANS:')

  if (picksIndex === -1 || bansIndex === -1 || bansIndex < picksIndex) {
    throw new Error('invalid-sections')
  }

  const picks = lines.slice(picksIndex + 1, bansIndex).map(parseDraftEntry)
  const bans = lines.slice(bansIndex + 1).map(parseDraftEntry)

  return {
    version: 'v1',
    year,
    picks,
    bans,
  }
}

export function materializeParsedDraft(
  parsedDraft: ParsedDraft,
  tournament: TournamentDataset,
): { state: DraftState | null; validation: DraftValidationResult } {
  const hullTypes = Object.keys(tournament.hulls)
  let state = createEmptyDraftState(hullTypes as Array<keyof TournamentDataset['hulls']>)

  for (const entry of parsedDraft.bans) {
    const ship = findRegisteredShip(tournament, entry.hullType, entry.shipKey)
    if (!ship) {
      return invalid('import-unknown-ship')
    }

    const validation = validateDraftAction(tournament, state, {
      type: 'ban',
      hullType: entry.hullType,
      shipKey: entry.shipKey,
    })

    if (!validation.valid) {
      return { state: null, validation }
    }

    state = applyDraftAction(tournament, state, {
      type: 'ban',
      hullType: entry.hullType,
      shipKey: entry.shipKey,
    })
  }

  for (const entry of parsedDraft.picks) {
    const ship = findRegisteredShip(tournament, entry.hullType, entry.shipKey)
    if (!ship) {
      return invalid('import-unknown-ship')
    }

    const validation = validateDraftAction(tournament, state, {
      type: 'pick',
      hullType: entry.hullType,
      shipKey: entry.shipKey,
    })

    if (!validation.valid) {
      return { state: null, validation }
    }

    state = applyDraftAction(tournament, state, {
      type: 'pick',
      hullType: entry.hullType,
      shipKey: entry.shipKey,
    })
  }

  return {
    state,
    validation: {
      valid: true,
      reasons: [],
    },
  }
}

function parseDraftEntry(line: string): { hullType: HullType; shipKey: string } {
  if (!line.startsWith('- ')) {
    throw new Error('invalid-entry')
  }

  const body = line.slice(2).trim()
  const separatorIndex = body.indexOf(':')
  if (separatorIndex === -1) {
    throw new Error('invalid-entry')
  }

  const hullType = body.slice(0, separatorIndex).trim() as HullType
  const shipKey = body.slice(separatorIndex + 1).trim()

  if (!isHullType(hullType) || shipKey.length === 0) {
    throw new Error('invalid-entry')
  }

  return {
    hullType,
    shipKey,
  }
}

function formatDraftEntry(hullType: HullType, shipKey: string) {
  return `- ${hullType}: ${shipKey}`
}

function isHullType(value: string): value is HullType {
  return [
    'Flagship',
    'Logistics',
    'Battleship',
    'Battlecruiser',
    'Cruiser',
    'Destroyer',
    'Frigate',
    'Industrial',
    'Corvette',
  ].includes(value)
}

function invalid(reason: string) {
  return {
    state: null,
    validation: {
      valid: false,
      reasons: [reason],
    },
  }
}
