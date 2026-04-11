import { describe, expect, it } from 'vitest'

import tournament from '../data/generated/2025.json'
import { materializeParsedDraft, parseDraft, serializeDraft } from '@/lib/rules/draft-codec'
import { applyDraftAction } from '@/lib/rules/draft-engine'
import { createEmptyDraftState } from '@/lib/rules/draft-state'
import type { ParsedDraft, TournamentDataset } from '@/lib/types'

const dataset = tournament as TournamentDataset
const hullTypes = Object.keys(dataset.hulls) as Array<keyof TournamentDataset['hulls']>

describe('draft codec', () => {
  it('serializes a draft with version, year, picks, and bans', () => {
    let state = createEmptyDraftState(hullTypes)

    state = applyDraftAction(dataset, state, { type: 'pick', hullType: 'Flagship', shipKey: 'Bhaalgorn' })
    state = applyDraftAction(dataset, state, { type: 'ban', hullType: 'Cruiser', shipKey: 'Osprey Navy Issue' })

    expect(serializeDraft(state, dataset)).toBe(
      ['EVE-AT-DRAFT v1', 'YEAR: 2025', 'PICKS:', '- Flagship: Bhaalgorn', 'BANS:', '- Cruiser: Osprey Navy Issue'].join('\n'),
    )
  })

  it('parses a valid v1 payload', () => {
    const parsed = parseDraft(
      ['EVE-AT-DRAFT v1', 'YEAR: 2025', 'PICKS:', '- Flagship: Bhaalgorn', '- Cruiser: Caracal', 'BANS:', '- Cruiser: Osprey Navy Issue'].join(
        '\n',
      ),
    )

    expect(parsed).toEqual<ParsedDraft>({
      version: 'v1',
      year: 2025,
      picks: [
        { hullType: 'Flagship', shipKey: 'Bhaalgorn' },
        { hullType: 'Cruiser', shipKey: 'Caracal' },
      ],
      bans: [{ hullType: 'Cruiser', shipKey: 'Osprey Navy Issue' }],
    })
  })

  it('rejects invalid payloads', () => {
    expect(() => parseDraft('YEAR: 2025')).toThrowError('invalid-format-header')
    expect(() => parseDraft(['EVE-AT-DRAFT v1', 'YEAR: nope', 'PICKS:', 'BANS:'].join('\n'))).toThrowError('invalid-year')
  })

  it('materializes a parsed draft into validated state', () => {
    const result = materializeParsedDraft(
      {
        version: 'v1',
        year: 2025,
        picks: [
          { hullType: 'Flagship', shipKey: 'Bhaalgorn' },
          { hullType: 'Cruiser', shipKey: 'Caracal' },
        ],
        bans: [{ hullType: 'Cruiser', shipKey: 'Osprey Navy Issue' }],
      },
      dataset,
    )

    expect(result.validation.valid).toBe(true)
    expect(result.state?.picks.Flagship[0]?.shipKey).toBe('Bhaalgorn')
    expect(result.state?.picks.Cruiser[0]?.shipKey).toBe('Caracal')
    expect(result.state?.bans.Cruiser[0]?.shipKey).toBe('Osprey Navy Issue')
  })

  it('rejects imported ships that are unknown to the dataset', () => {
    const result = materializeParsedDraft(
      {
        version: 'v1',
        year: 2025,
        picks: [{ hullType: 'Battleship', shipKey: 'Totally Fake Ship' }],
        bans: [],
      },
      dataset,
    )

    expect(result.validation).toEqual({
      valid: false,
      reasons: ['import-unknown-ship'],
    })
  })

  it('round-trips duplicated flagship keys without downgrading them to regular hulls', () => {
    let state = createEmptyDraftState(hullTypes)

    state = applyDraftAction(dataset, state, { type: 'pick', hullType: 'Flagship', shipKey: 'Bhaalgorn' })
    state = applyDraftAction(dataset, state, { type: 'pick', hullType: 'Battleship', shipKey: 'Raven' })

    const parsed = parseDraft(serializeDraft(state, dataset))
    const result = materializeParsedDraft(parsed, dataset)

    expect(result.validation.valid).toBe(true)
    expect(result.state?.picks.Flagship[0]?.shipKey).toBe('Bhaalgorn')
    expect(result.state?.picks.Battleship[0]?.shipKey).toBe('Raven')
  })
})
