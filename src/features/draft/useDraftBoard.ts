import { computed, ref } from 'vue'
import type { Ref } from 'vue'

import {
  applyDraftAction,
  getDraftDerivedState,
  getHullTypes,
  validateDraftAction,
} from '@/lib/rules/draft-engine'
import { createEmptyDraftState } from '@/lib/rules/draft-state'
import type { DraftAction, HullType, LocaleCode, ShipCatalog, TournamentDataset, TournamentShipRule } from '@/lib/types'

export function useDraftBoard(
  dataset: TournamentDataset,
  shipCatalog: ShipCatalog,
  locale: Ref<LocaleCode>,
) {
  const hullTypes = getHullTypes(dataset)
  const state = ref(createEmptyDraftState(hullTypes))
  const activeHullType = ref<HullType>(hullTypes[0] ?? 'Flagship')

  const ruleLink = dataset.sources.find((source) => source.label === 'Rules')?.url ?? '#'
  const banLink = dataset.sources.find((source) => source.label === 'Ban Rules')?.url ?? '#'
  const feedbackReasons = ref<string[]>([])

  const derivedState = computed(() => getDraftDerivedState(dataset, state.value))

  function runAction(action: DraftAction) {
    const validation = validateDraftAction(dataset, state.value, action)
    if (!validation.valid) {
      feedbackReasons.value = validation.reasons
      return validation
    }

    state.value = applyDraftAction(dataset, state.value, action)
    feedbackReasons.value = []
    return validation
  }

  function addShip(hullType: HullType, shipKey: string) {
    return runAction({ type: 'pick', hullType, shipKey })
  }

  function removeShip(hullType: HullType, shipKey: string) {
    return runAction({ type: 'remove', hullType, shipKey })
  }

  function banShip(hullType: HullType, shipKey: string) {
    return runAction({ type: 'ban', hullType, shipKey })
  }

  function unbanShip(hullType: HullType, shipKey: string) {
    return runAction({ type: 'unban', hullType, shipKey })
  }

  function clearPicks() {
    return runAction({ type: 'clear-picks' })
  }

  function clearBans() {
    return runAction({ type: 'clear-bans' })
  }

  function pickValidation(hullType: HullType, shipKey: string) {
    return validateDraftAction(dataset, state.value, {
      type: 'pick',
      hullType,
      shipKey,
    })
  }

  function banValidation(hullType: HullType, shipKey: string) {
    return validateDraftAction(dataset, state.value, {
      type: 'ban',
      hullType,
      shipKey,
    })
  }

  function hullCountLabel(hullType: HullType) {
    if (hullType === 'Logistics') {
      return `${derivedState.value.logisticsUsage} / ${dataset.rules.hullCaps.Logistics ?? 0}`
    }

    return `${derivedState.value.hullCounts[hullType]} / ${dataset.rules.hullCaps[hullType] ?? 0}`
  }

  function localizedShipName(shipKey: string) {
    const ship = shipCatalog[shipKey]
    if (!ship) {
      return shipKey
    }

    return ship.names[locale.value] ?? ship.names.en
  }

  function shipProperty(rule: TournamentShipRule) {
    return {
      points: rule.points,
      shipId: rule.shipId,
      original_points: rule.points,
    }
  }

  return {
    activeHullType,
    banLink,
    clearBans,
    clearPicks,
    dataset,
    derivedState,
    feedbackReasons,
    hullCountLabel,
    hullTypes,
    localizedShipName,
    pickValidation,
    ruleLink,
    addShip,
    removeShip,
    banShip,
    banValidation,
    shipProperty,
    state,
    unbanShip,
  }
}
