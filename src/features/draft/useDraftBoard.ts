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

  const banOrder = ref<Record<string, number>>({})
  let banCounter = 0
  const banOrderKey = (hullType: HullType, shipKey: string) => `${hullType}:${shipKey}`

  const derivedState = computed(() => {
    const base = getDraftDerivedState(dataset, state.value)
    const order = banOrder.value
    const orderedBanList = [...base.banList].sort((left, right) => {
      const leftOrder = order[banOrderKey(left.hullType, left.shipKey)] ?? 0
      const rightOrder = order[banOrderKey(right.hullType, right.shipKey)] ?? 0
      return leftOrder - rightOrder
    })
    return { ...base, banList: orderedBanList }
  })
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
    const result = runAction({ type: 'ban', hullType, shipKey })
    if (result.valid) {
      banCounter += 1
      banOrder.value = { ...banOrder.value, [banOrderKey(hullType, shipKey)]: banCounter }
    }
    return result
  }

  function unbanShip(hullType: HullType, shipKey: string) {
    const result = runAction({ type: 'unban', hullType, shipKey })
    if (result.valid) {
      const { [banOrderKey(hullType, shipKey)]: _removed, ...rest } = banOrder.value
      banOrder.value = rest
    }
    return result
  }

  function clearPicks() {
    return runAction({ type: 'clear-picks' })
  }

  function clearBans() {
    const result = runAction({ type: 'clear-bans' })
    if (result.valid) {
      banOrder.value = {}
      banCounter = 0
    }
    return result
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
      originalPoints: rule.points,
    }
  }

  function replaceDraftState(nextState: DraftState) {
    state.value = nextState
    feedbackReasons.value = []

    const nextOrder: Record<string, number> = {}
    banCounter = 0
    for (const hullType of hullTypes) {
      for (const selection of nextState.bans[hullType] ?? []) {
        banCounter += 1
        nextOrder[banOrderKey(hullType, selection.shipKey)] = banCounter
      }
    }
    banOrder.value = nextOrder
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
