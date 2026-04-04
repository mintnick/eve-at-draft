import { describe, expect, it } from 'vitest'

import tournament from '../data/generated/2025.json'
import { applyDraftAction, getDraftDerivedState, validateDraftAction } from '@/lib/rules/draft-engine'
import { createEmptyDraftState } from '@/lib/rules/draft-state'
import type { TournamentDataset } from '@/lib/types'

const dataset = tournament as TournamentDataset
const hullTypes = Object.keys(dataset.hulls) as Array<keyof TournamentDataset['hulls']>

describe('draft engine', () => {
  it('derives flagship hull counts from dataset overrides', () => {
    let state = createEmptyDraftState(hullTypes)

    state = applyDraftAction(dataset, state, {
      type: 'pick',
      hullType: 'Flagship',
      shipKey: 'Shapash',
    })

    const derived = getDraftDerivedState(dataset, state)

    expect(derived.totalPoints).toBe(30)
    expect(derived.totalShips).toBe(1)
    expect(derived.hullCounts.Flagship).toBe(1)
    expect(derived.hullCounts.Frigate).toBe(1)
    expect(derived.hullCounts.Battleship).toBe(0)
    expect(derived.flagshipClassification.Frigate).toBe(1)
  })

  it('blocks logistics picks when the weighted logistics cap is already filled', () => {
    let state = createEmptyDraftState(hullTypes)

    state = applyDraftAction(dataset, state, {
      type: 'pick',
      hullType: 'Logistics',
      shipKey: 'Bantam',
    })
    state = applyDraftAction(dataset, state, {
      type: 'pick',
      hullType: 'Logistics',
      shipKey: 'Burst',
    })

    const validation = validateDraftAction(dataset, state, {
      type: 'pick',
      hullType: 'Logistics',
      shipKey: 'Navitas',
    })

    expect(getDraftDerivedState(dataset, state).logisticsUsage).toBe(1)
    expect(validation).toEqual({
      valid: false,
      reasons: ['logistics-cap-reached'],
    })
  })

  it('blocks ships that were already banned from being picked', () => {
    let state = createEmptyDraftState(hullTypes)

    state = applyDraftAction(dataset, state, {
      type: 'ban',
      hullType: 'Cruiser',
      shipKey: 'Osprey Navy Issue',
    })

    const validation = validateDraftAction(dataset, state, {
      type: 'pick',
      hullType: 'Cruiser',
      shipKey: 'Osprey Navy Issue',
    })

    expect(validation).toEqual({
      valid: false,
      reasons: ['ship-banned'],
    })
  })

  it('blocks a second flagship pick', () => {
    let state = createEmptyDraftState(hullTypes)

    state = applyDraftAction(dataset, state, {
      type: 'pick',
      hullType: 'Flagship',
      shipKey: 'Bhaalgorn',
    })

    const validation = validateDraftAction(dataset, state, {
      type: 'pick',
      hullType: 'Flagship',
      shipKey: 'Rattlesnake',
    })

    expect(validation).toEqual({
      valid: false,
      reasons: ['flagship-already-picked'],
    })
  })

  it('blocks picks once the ship count cap is reached', () => {
    let state = createEmptyDraftState(hullTypes)

    const tenShips = [
      ['Flagship', 'Bhaalgorn'],
      ['Cruiser', 'Osprey Navy Issue'],
      ['Cruiser', 'Caracal'],
      ['Cruiser', 'Moa'],
      ['Destroyer', 'Corax'],
      ['Destroyer', 'Talwar'],
      ['Destroyer', 'Algos'],
      ['Frigate', 'Condor'],
      ['Frigate', 'Rifter'],
      ['Frigate', 'Merlin'],
    ] as const

    for (const [hullType, shipKey] of tenShips) {
      state = applyDraftAction(dataset, state, {
        type: 'pick',
        hullType,
        shipKey,
      })
    }

    const validation = validateDraftAction(dataset, state, {
      type: 'pick',
      hullType: 'Battleship',
      shipKey: 'Raven',
    })

    expect(getDraftDerivedState(dataset, state).totalShips).toBe(10)
    expect(validation).toEqual({
      valid: false,
      reasons: ['max-ships-reached'],
    })
  })

  it('blocks picks once a hull cap is reached', () => {
    let state = createEmptyDraftState(hullTypes)

    for (const shipKey of ['Caracal', 'Moa', 'Blackbird'] as const) {
      state = applyDraftAction(dataset, state, {
        type: 'pick',
        hullType: 'Cruiser',
        shipKey,
      })
    }

    const validation = validateDraftAction(dataset, state, {
      type: 'pick',
      hullType: 'Cruiser',
      shipKey: 'Celestis',
    })

    expect(getDraftDerivedState(dataset, state).hullCounts.Cruiser).toBe(3)
    expect(validation).toEqual({
      valid: false,
      reasons: ['hull-cap-reached'],
    })
  })
})
