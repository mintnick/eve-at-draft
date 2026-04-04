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
      <div class="page-title-wrap">
        <p class="page-eyebrow">Alliance Tournament</p>
        <div class="page-title">{{ $t('messages.title') }}</div>
      </div>
      <div class="page-actions-card">
        <div class="page-actions">
          <div class="control-group">
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
          <div class="control-group">
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
  gap: 1.25rem;
  padding-top: 1.75rem;
}

.page-header {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: end;
  gap: 1.25rem;
}

.page-title-wrap {
  display: grid;
  gap: 0.35rem;
}

.page-eyebrow {
  margin: 0;
  color: var(--app-accent-warm);
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.page-title {
  font-size: clamp(2.2rem, 4vw, 3.4rem);
  font-weight: 800;
  line-height: 0.95;
  letter-spacing: -0.04em;
  text-wrap: balance;
}

.page-actions-card {
  border: 1px solid var(--app-border);
  border-radius: 1.5rem;
  background: var(--app-panel);
  box-shadow: var(--app-shadow-soft);
  backdrop-filter: blur(16px);
  padding: 0.85rem;
}

.page-actions {
  display: flex;
  justify-content: flex-start;
  gap: 0.75rem;
  align-items: end;
  flex-wrap: wrap;
}

.toolbar-button {
  gap: 0.45rem;
  align-self: center;
  border: 1px solid var(--app-border);
  background: var(--app-panel-strong);
  color: var(--app-text);
}

.control-group {
  display: grid;
  gap: 0.3rem;
  min-width: 220px;
}

.year-picker-label {
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--app-text-muted);
}

.year-select {
  min-width: 220px;
}

@media (max-width: 720px) {
  .page-header {
    grid-template-columns: 1fr;
    align-items: stretch;
  }

  .page-actions-card {
    padding: 0.75rem;
  }

  .page-actions {
    display: grid;
  }

  .control-group,
  .year-select {
    min-width: 100%;
  }

  .toolbar-button {
    justify-self: stretch;
  }
}
</style>
