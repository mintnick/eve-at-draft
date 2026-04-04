import { computed, reactive, watch } from 'vue'

import tournamentIndexData from '../../data/generated/index.json'
import shipCatalogData from '../../data/generated/ship-catalog.json'
import type { ShipCatalog, TournamentDataset, TournamentIndexEntry } from '@/lib/types'

interface TournamentAppState {
  availableTournaments: TournamentIndexEntry[]
  selectedYear: number
}

interface DraftAppState {
  resetVersion: number
}

interface UiAppState {
  isDark: boolean
}

const datasetModules = import.meta.glob('../../data/generated/*.json', {
  eager: true,
  import: 'default',
}) as Record<string, unknown>

function loadTournamentDatasets(index: TournamentIndexEntry[]) {
  const datasets = new Map<number, TournamentDataset>()

  for (const entry of index) {
    const modulePath = `../../data/generated/${entry.generatedFile}`
    const dataset = datasetModules[modulePath]

    if (dataset) {
      datasets.set(entry.year, dataset as TournamentDataset)
    }
  }

  return datasets
}

export function useAppState() {
  const availableTournaments = [...(tournamentIndexData as TournamentIndexEntry[])].sort((left, right) => right.year - left.year)
  const datasets = loadTournamentDatasets(availableTournaments)
  const shipCatalog = shipCatalogData as ShipCatalog
  const initialYear = availableTournaments[0]?.year ?? 2025

  const tournamentState = reactive<TournamentAppState>({
    availableTournaments,
    selectedYear: initialYear,
  })

  const draftState = reactive<DraftAppState>({
    resetVersion: 0,
  })

  const uiState = reactive<UiAppState>({
    isDark: document.documentElement.classList.contains('app-dark'),
  })

  const currentTournament = computed(() => {
    return datasets.get(tournamentState.selectedYear) ?? datasets.get(initialYear)
  })

  const tournamentOptions = computed(() =>
    tournamentState.availableTournaments.map((entry) => ({
      label: `${entry.year} · ${entry.label}`,
      value: entry.year,
    })),
  )

  watch(
    () => tournamentState.selectedYear,
    (selectedYear, previousYear) => {
      if (selectedYear !== previousYear) {
        draftState.resetVersion += 1
      }
    },
  )

  return {
    currentTournament,
    draftState,
    shipCatalog,
    tournamentOptions,
    tournamentState,
    uiState,
  }
}
