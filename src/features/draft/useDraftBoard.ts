import { computed, ref } from 'vue'
import type { Ref } from 'vue'

import { materializeParsedDraft, serializeDraft } from '@/lib/rules/draft-codec'
import {
  applyDraftAction,
  getDraftDerivedState,
  getHullTypes,
  validateDraftAction,
} from '@/lib/rules/draft-engine'
import { getShipDisplayName } from '@/lib/i18n/labels'
import { createEmptyDraftState } from '@/lib/rules/draft-state'
import type {
  DraftAction,
  DraftState,
  DraftValidationResult,
  HullType,
  LocaleCode,
  ParsedDraft,
  ShipCatalog,
  TournamentDataset,
  TournamentShipRule,
} from '@/lib/types'

interface ShipValidationState {
  pick: DraftValidationResult
  ban: DraftValidationResult
}

export function useDraftBoard(
  dataset: TournamentDataset,
  shipCatalog: ShipCatalog,
  locale: Ref<LocaleCode>,
) {
  const hullTypes = getHullTypes(dataset)
  const state = ref(createEmptyDraftState(hullTypes))
  const activeHullType = ref<HullType>(hullTypes[0] ?? 'Flagship')

  const banLink = dataset.sources.find((source) => source.label === 'Ban Rules')?.url ?? '#'
  const feedbackReasons = ref<string[]>([])

  const derivedState = computed(() => getDraftDerivedState(dataset, state.value))
  const shipValidation = computed(() => {
    const validation = new Map<string, ShipValidationState>()
    const currentState = state.value
    const currentDerivedState = derivedState.value

    for (const hullType of hullTypes) {
      for (const shipKey of Object.keys(dataset.hulls[hullType])) {
        validation.set(getShipValidationKey(hullType, shipKey), {
          pick: validateDraftAction(
            dataset,
            currentState,
            {
              type: 'pick',
              hullType,
              shipKey,
            },
            currentDerivedState,
          ),
          ban: validateDraftAction(dataset, currentState, {
            type: 'ban',
            hullType,
            shipKey,
          }),
        })
      }
    }

    return validation
  })

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
    return shipValidation.value.get(getShipValidationKey(hullType, shipKey))?.pick
      ?? validateDraftAction(dataset, state.value, {
        type: 'pick',
        hullType,
        shipKey,
      })
  }

  function banValidation(hullType: HullType, shipKey: string) {
    return shipValidation.value.get(getShipValidationKey(hullType, shipKey))?.ban
      ?? validateDraftAction(dataset, state.value, {
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
    return getShipDisplayName(shipCatalog, shipKey, locale.value)
  }

  function shipProperty(rule: TournamentShipRule) {
    return {
      points: rule.points,
      shipId: rule.shipId,
      original_points: rule.points,
    }
  }

  function replaceDraftState(nextState: DraftState) {
    state.value = nextState
    feedbackReasons.value = []
  }

  function exportDraftText() {
    return serializeDraft(state.value, dataset)
  }

  function importParsedDraft(parsedDraft: ParsedDraft) {
    const result = materializeParsedDraft(parsedDraft, dataset)
    if (!result.validation.valid || !result.state) {
      feedbackReasons.value = result.validation.reasons
      return result.validation
    }

    replaceDraftState(result.state)
    return result.validation
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
    addShip,
    removeShip,
    banShip,
    banValidation,
    exportDraftText,
    importParsedDraft,
    shipProperty,
    unbanShip,
  }
}

function getShipValidationKey(hullType: HullType, shipKey: string) {
  return `${hullType}:${shipKey}`
}
