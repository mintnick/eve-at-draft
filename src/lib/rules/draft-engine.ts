import type {
  DraftAction,
  DraftShipSelection,
  DraftState,
  DraftValidationResult,
  HullType,
  TournamentDataset,
  TournamentShipRule,
} from '@/lib/types'

import { createEmptyDraftState } from '@/lib/rules/draft-state'

export interface RegisteredShip {
  hullType: HullType
  shipKey: string
  rule: TournamentShipRule
}

export interface DraftDerivedState {
  totalPoints: number
  totalShips: number
  hullCounts: Record<HullType, number>
  logisticsUsage: number
  flagshipClassification: Record<HullType, number>
  pickList: DraftShipSelection[]
  banList: DraftShipSelection[]
}

export function getHullTypes(dataset: TournamentDataset): HullType[] {
  return Object.keys(dataset.hulls) as HullType[]
}

export function createShipSelection(
  hullType: HullType,
  shipKey: string,
  rule: TournamentShipRule,
): DraftShipSelection {
  return {
    hullType,
    shipKey,
    shipId: rule.shipId,
    originalPoints: rule.points,
    points: rule.points,
    logisticsWeight: rule.logisticsWeight,
  }
}

export function findRegisteredShip(
  dataset: TournamentDataset,
  hullType: HullType,
  shipKey: string,
): RegisteredShip | null {
  const rule = dataset.hulls[hullType]?.[shipKey]
  if (!rule) {
    return null
  }

  return {
    hullType,
    shipKey,
    rule,
  }
}

export function findRegisteredShipByKey(dataset: TournamentDataset, shipKey: string): RegisteredShip | null {
  for (const hullType of getHullTypes(dataset)) {
    const ship = findRegisteredShip(dataset, hullType, shipKey)
    if (ship) {
      return ship
    }
  }

  return null
}

export function listSelections(state: DraftState, key: keyof DraftState): DraftShipSelection[] {
  return [...Object.values(state[key])
    .flat()
  ].sort((left, right) => right.points - left.points || left.shipKey.localeCompare(right.shipKey))
}

export function getFlagshipClassification(
  dataset: TournamentDataset,
  state: DraftState,
): Record<HullType, number> {
  const hullTypes = getHullTypes(dataset)
  const classification = hullTypes.reduce<Record<HullType, number>>((counts, hullType) => {
    counts[hullType] = 0
    return counts
  }, {} as Record<HullType, number>)

  if (!dataset.rules.flagship.enabled) {
    return classification
  }

  const flagship = state.picks.Flagship[0]
  if (!flagship) {
    return classification
  }

  const overriddenHullType = dataset.rules.flagship.hullTypeOverrides[flagship.shipKey] ?? 'Battleship'
  classification[overriddenHullType] = 1

  return classification
}

export function getDraftDerivedState(dataset: TournamentDataset, state: DraftState): DraftDerivedState {
  const hullTypes = getHullTypes(dataset)
  const pickList = listSelections(state, 'picks')
  const banList = listSelections(state, 'bans')
  const flagshipClassification = getFlagshipClassification(dataset, state)

  const totalPoints = pickList.reduce((total, ship) => total + ship.points, 0)
  const logisticsUsage = state.picks.Logistics.reduce(
    (total, ship) => total + (ship.logisticsWeight ?? 0),
    0,
  )

  const hullCounts = hullTypes.reduce<Record<HullType, number>>((counts, hullType) => {
    const draftCount = state.picks[hullType].length
    counts[hullType] = draftCount + (flagshipClassification[hullType] ?? 0)
    return counts
  }, {} as Record<HullType, number>)

  return {
    totalPoints,
    totalShips: pickList.length,
    hullCounts,
    logisticsUsage,
    flagshipClassification,
    pickList,
    banList,
  }
}

export function validateDraftAction(
  dataset: TournamentDataset,
  state: DraftState,
  action: DraftAction,
  derivedState?: DraftDerivedState,
): DraftValidationResult {
  if (action.type === 'pick') {
    const ship = findRegisteredShip(dataset, action.hullType, action.shipKey)
    if (!ship) {
      return invalid('ship-not-found')
    }

    const currentDerivedState = derivedState ?? getDraftDerivedState(dataset, state)

    if (currentDerivedState.totalShips >= dataset.rules.maxShips) {
      return invalid('max-ships-reached')
    }

    if (action.hullType === 'Flagship') {
      return state.picks.Flagship.length === 0 ? valid() : invalid('flagship-already-picked')
    }

    if (state.bans[action.hullType].some((selection) => selection.shipKey === action.shipKey)) {
      return invalid('ship-banned')
    }

    if (action.hullType === 'Logistics') {
      const logisticsCap = dataset.rules.hullCaps.Logistics ?? 0
      const logisticsWeight = ship.rule.logisticsWeight ?? 0

      return currentDerivedState.logisticsUsage + logisticsWeight > logisticsCap
        ? invalid('logistics-cap-reached')
        : valid()
    }

    const hullCap = dataset.rules.hullCaps[action.hullType] ?? 0

    if (currentDerivedState.hullCounts[action.hullType] >= hullCap) {
      return invalid('hull-cap-reached')
    }

    if (
      getProjectedPickTotalPoints(currentDerivedState.totalPoints, dataset, state, ship.shipKey, ship.rule)
      > dataset.rules.maxPoints
    ) {
      return invalid('max-points-reached')
    }

    return valid()
  }

  if (action.type === 'ban') {
    const ship = findRegisteredShip(dataset, action.hullType, action.shipKey)
    if (!ship) {
      return invalid('ship-not-found')
    }

    if (state.picks[action.hullType].some((selection) => selection.shipKey === action.shipKey)) {
      return invalid('ship-picked')
    }

    if (state.bans[action.hullType].some((selection) => selection.shipKey === action.shipKey)) {
      return invalid('ship-already-banned')
    }

    return valid()
  }

  if (action.type === 'remove') {
    return state.picks[action.hullType].some((selection) => selection.shipKey === action.shipKey)
      ? valid()
      : invalid('ship-not-picked')
  }

  if (action.type === 'unban') {
    return state.bans[action.hullType].some((selection) => selection.shipKey === action.shipKey)
      ? valid()
      : invalid('ship-not-banned')
  }

  return valid()
}

export function applyDraftAction(
  dataset: TournamentDataset,
  state: DraftState,
  action: DraftAction,
): DraftState {
  const hullTypes = getHullTypes(dataset)
  const nextState = cloneDraftState(state, hullTypes)

  if (action.type === 'pick') {
    const ship = findRegisteredShip(dataset, action.hullType, action.shipKey)
    if (ship) {
      nextState.picks[action.hullType].push(createShipSelection(ship.hullType, ship.shipKey, ship.rule))
      recalculatePickPoints(dataset, nextState)
    }
    return nextState
  }

  if (action.type === 'remove') {
    const selectionIndex = nextState.picks[action.hullType].findIndex(
      (selection) => selection.shipKey === action.shipKey,
    )
    if (selectionIndex >= 0) {
      nextState.picks[action.hullType].splice(selectionIndex, 1)
    }
    recalculatePickPoints(dataset, nextState)
    return nextState
  }

  if (action.type === 'ban') {
    const ship = findRegisteredShip(dataset, action.hullType, action.shipKey)
    if (ship) {
      nextState.bans[action.hullType].push(createShipSelection(ship.hullType, ship.shipKey, ship.rule))
    }
    return nextState
  }

  if (action.type === 'unban') {
    nextState.bans[action.hullType] = nextState.bans[action.hullType].filter(
      (selection) => selection.shipKey !== action.shipKey,
    )
    return nextState
  }

  if (action.type === 'clear-picks') {
    return {
      ...nextState,
      picks: createEmptyDraftState(hullTypes).picks,
    }
  }

  if (action.type === 'clear-bans') {
    return {
      ...nextState,
      bans: createEmptyDraftState(hullTypes).bans,
    }
  }

  return nextState
}

function cloneDraftState(state: DraftState, hullTypes: HullType[]): DraftState {
  const nextState = createEmptyDraftState(hullTypes)

  for (const hullType of hullTypes) {
    nextState.picks[hullType] = [...state.picks[hullType]]
    nextState.bans[hullType] = [...state.bans[hullType]]
  }

  return nextState
}

function recalculatePickPoints(dataset: TournamentDataset, state: DraftState) {
  const duplicateIncrement = dataset.rules.pointInflation?.duplicateShipIncrement ?? 0
  if (duplicateIncrement === 0) {
    return
  }

  const shipCounts = new Map<string, number>()

  for (const selection of Object.values(state.picks).flat()) {
    shipCounts.set(selection.shipKey, (shipCounts.get(selection.shipKey) ?? 0) + 1)
  }

  for (const selection of Object.values(state.picks).flat()) {
    const duplicates = shipCounts.get(selection.shipKey) ?? 1
    selection.points = (selection.originalPoints ?? selection.points) + duplicateIncrement * (duplicates - 1)
  }
}

function getProjectedPickTotalPoints(
  currentTotalPoints: number,
  dataset: TournamentDataset,
  state: DraftState,
  shipKey: string,
  rule: TournamentShipRule,
) {
  const duplicateIncrement = dataset.rules.pointInflation?.duplicateShipIncrement ?? 0
  if (duplicateIncrement === 0) {
    return currentTotalPoints + rule.points
  }

  const duplicateCount = Object.values(state.picks)
    .flat()
    .filter((selection) => selection.shipKey === shipKey)
    .length

  return currentTotalPoints + rule.points + duplicateCount * duplicateIncrement * 2
}

function valid(): DraftValidationResult {
  return {
    valid: true,
    reasons: [],
  }
}

function invalid(reason: string): DraftValidationResult {
  return {
    valid: false,
    reasons: [reason],
  }
}
