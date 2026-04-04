import { describe, expect, it } from 'vitest'

import { createEmptyDraftState } from '@/lib/rules/draft-state'

describe('createEmptyDraftState', () => {
  it('creates isolated pick and ban buckets for each hull type', () => {
    const state = createEmptyDraftState(['Flagship', 'Cruiser'])

    expect(state.picks.Flagship).toEqual([])
    expect(state.picks.Cruiser).toEqual([])
    expect(state.bans.Flagship).toEqual([])
    expect(state.bans.Cruiser).toEqual([])
    expect(state.picks).not.toBe(state.bans)
  })
})
