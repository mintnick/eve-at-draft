<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import Button from 'primevue/button'
import Select from 'primevue/select'

import { useAppState } from '@/app/useAppState'
import DraftScreen from '@/features/draft/components/DraftScreen.vue'
import { appMessages } from '@/lib/i18n'
import { setStoredLocale, setStoredThemeDark } from '@/lib/preferences'
import type { LocaleCode } from '@/lib/types'

const { locale } = useI18n()
const { currentTournament, draftState, shipCatalog, tournamentOptions, tournamentState, uiState } = useAppState()

const localeOptions = computed(() =>
  (Object.keys(appMessages) as LocaleCode[]).map((value) => ({
    value,
    label: value === 'zh' ? '简体中文' : 'English',
  })),
)

function toggleTheme() {
  uiState.isDark = !uiState.isDark
  document.documentElement.classList.toggle('app-dark', uiState.isDark)
  setStoredThemeDark(uiState.isDark)
}

function changeLang(nextLocale: LocaleCode) {
  locale.value = nextLocale
  setStoredLocale(nextLocale)
}
</script>

<template>
  <div class="page-shell">
    <header class="page-header">
      <div class="page-title-spacer"></div>
      <div class="page-title">{{ $t('messages.title') }}</div>
      <div class="page-actions">
        <div class="year-picker">
          <label class="year-picker-label" for="tournament-year">{{ $t('messages.year') }}</label>
          <Select
            id="tournament-year"
            v-model="tournamentState.selectedYear"
            :options="tournamentOptions"
            option-label="label"
            option-value="value"
            class="year-select"
          />
        </div>
        <div class="year-picker">
          <label class="year-picker-label" for="app-language">{{ $t('messages.language') }}</label>
          <Select
            id="app-language"
            :model-value="locale"
            :options="localeOptions"
            option-label="label"
            option-value="value"
            class="year-select"
            @update:model-value="changeLang($event as LocaleCode)"
          />
        </div>
        <Button rounded text class="toolbar-button" @click="toggleTheme">
          <span :class="['pi', uiState.isDark ? 'pi-sun' : 'pi-moon']"></span>
        </Button>
      </div>
    </header>

    <DraftScreen
      v-if="currentTournament"
      :key="`${tournamentState.selectedYear}-${draftState.resetVersion}`"
      :dataset="currentTournament"
      :ship-catalog="shipCatalog"
    />
  </div>
</template>

<style scoped>
.page-shell {
  display: grid;
  gap: 1rem;
  padding-top: 1.5rem;
}

.page-header {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 1rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 800;
  text-align: center;
}

.page-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
}

.toolbar-button {
  gap: 0.45rem;
}

.year-picker {
  display: grid;
  gap: 0.3rem;
  min-width: 220px;
}

.year-picker-label {
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.year-select {
  min-width: 220px;
}

@media (max-width: 720px) {
  .page-header {
    grid-template-columns: 1fr;
  }

  .page-title-spacer {
    display: none;
  }

  .page-actions {
    justify-content: center;
  }

  .year-picker,
  .year-select {
    min-width: 100%;
  }
}
</style>
