<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import Message from 'primevue/message'
import Select from 'primevue/select'
import Textarea from 'primevue/textarea'

import { useAppState } from '@/app/useAppState'
import DraftScreen from '@/features/draft/components/DraftScreen.vue'
import { appMessages } from '@/lib/i18n'
import { LOCALE_LABELS } from '@/lib/i18n/locales'
import { setStoredLocale, setStoredThemeDark } from '@/lib/preferences'
import { materializeParsedDraft, parseDraft } from '@/lib/rules/draft-codec'
import type { DraftValidationResult, LocaleCode, ParsedDraft } from '@/lib/types'

const { locale, t } = useI18n()
const { availableTournaments, currentTournament, draftState, getTournamentByYear, shipCatalog, tournamentOptions, tournamentState, uiState } = useAppState()

type DraftScreenExpose = {
  exportDraftText: () => string
  importParsedDraft: (parsedDraft: ParsedDraft) => DraftValidationResult
}

const draftScreenRef = ref<DraftScreenExpose | null>(null)
const importDialogVisible = ref(false)
const importText = ref('')
const transferMessage = ref<{ severity: 'success' | 'warn'; text: string } | null>(null)

const localeOptions = computed(() =>
  (Object.keys(appMessages) as LocaleCode[]).map((value) => ({
    value,
    label: LOCALE_LABELS[value],
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

async function exportDraft() {
  const text = draftScreenRef.value?.exportDraftText()
  if (!text) {
    return
  }

  if (!navigator.clipboard?.writeText) {
    transferMessage.value = { severity: 'warn', text: t('validation.clipboard-unavailable') }
    return
  }

  await navigator.clipboard.writeText(text)
  transferMessage.value = { severity: 'success', text: t('messages.copied') }
}

function openImportDialog() {
  importDialogVisible.value = true
  transferMessage.value = null
}

async function applyImport() {
  let parsedDraft: ParsedDraft

  try {
    parsedDraft = parseDraft(importText.value)
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'invalid-format-header'
    transferMessage.value = { severity: 'warn', text: t(`validation.${reason}`) }
    return
  }

  const hasYear = availableTournaments.value.some((entry) => entry.year === parsedDraft.year)
  if (!hasYear) {
    transferMessage.value = { severity: 'warn', text: t('validation.import-unknown-year') }
    return
  }

  const targetTournament = getTournamentByYear(parsedDraft.year)
  if (!targetTournament) {
    transferMessage.value = { severity: 'warn', text: t('validation.import-unknown-year') }
    return
  }

  const preview = materializeParsedDraft(parsedDraft, targetTournament)
  if (!preview.validation.valid) {
    transferMessage.value = { severity: 'warn', text: t(`validation.${preview.validation.reasons[0] ?? 'invalid-format-header'}`) }
    return
  }

  tournamentState.selectedYear = parsedDraft.year
  await nextTick()

  const validation = draftScreenRef.value?.importParsedDraft(parsedDraft)
  if (!validation?.valid) {
    transferMessage.value = { severity: 'warn', text: t(`validation.${validation?.reasons[0] ?? 'invalid-format-header'}`) }
    return
  }

  importDialogVisible.value = false
  importText.value = ''
  transferMessage.value = { severity: 'success', text: t('messages.importApplied') }
}
</script>

<template>
  <div class="page-shell">
    <header class="page-header">
      <div class="page-title-wrap">
        <div class="page-title">{{ $t('messages.title') }}</div>
        <div class="page-subtitle">EVE Online Alliance Tournaments Drafting Tool</div>
      </div>
      <div class="page-actions-card">
        <div class="page-actions">
          <div class="page-actions-left">
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
              <label class="year-picker-label year-picker-label--icon" for="app-language">
                <span class="language-label-icon" aria-hidden="true"></span>
                <span>{{ $t('messages.language') }}</span>
              </label>
              <Select
                id="app-language"
                :model-value="locale"
                :options="localeOptions"
                option-label="label"
                option-value="value"
                scroll-height="none"
                class="year-select"
                @update:model-value="changeLang($event as LocaleCode)"
              />
            </div>
          </div>
          <div class="page-actions-right">
            <Button rounded text class="toolbar-button" @click="toggleTheme">
              <span :class="['pi', uiState.isDark ? 'pi-sun' : 'pi-moon']"></span>
            </Button>
            <Button outlined class="transfer-button" @click="openImportDialog">{{ $t('messages.import') }}</Button>
            <Button outlined class="transfer-button" @click="exportDraft">{{ $t('messages.export') }}</Button>
          </div>
        </div>
      </div>
    </header>

    <Message v-if="transferMessage" :severity="transferMessage.severity" variant="outlined" class="transfer-message">
      {{ transferMessage.text }}
    </Message>

    <DraftScreen
      v-if="currentTournament"
      ref="draftScreenRef"
      :key="`${tournamentState.selectedYear}-${draftState.resetVersion}`"
      :dataset="currentTournament"
      :ship-catalog="shipCatalog"
    />

    <Dialog v-model:visible="importDialogVisible" modal class="import-dialog" :header="$t('messages.importDraft')">
      <div class="import-dialog-body">
        <Textarea v-model="importText" rows="12" auto-resize class="import-textarea" :placeholder="$t('messages.importPlaceholder')" />
        <div class="import-dialog-actions">
          <Button text @click="importDialogVisible = false">{{ $t('messages.cancel') }}</Button>
          <Button @click="applyImport">{{ $t('messages.applyImport') }}</Button>
        </div>
      </div>
    </Dialog>
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
  gap: 0.9rem;
}

.page-title-wrap {
  display: flex;
  align-items: baseline;
  gap: 0.85rem;
  min-width: 0;
}

.page-subtitle {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--app-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.page-title {
  color: var(--app-accent-warm);
  font-size: clamp(2.2rem, 4vw, 3.4rem);
  font-weight: 800;
  line-height: 0.95;
  letter-spacing: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
  justify-content: space-between;
  gap: 0.75rem;
  align-items: end;
  flex-wrap: wrap;
}

.page-actions-left {
  display: flex;
  gap: 0.75rem;
  align-items: end;
  flex-wrap: wrap;
}

.page-actions-right {
  display: flex;
  gap: 0.75rem;
  align-items: end;
  flex-wrap: wrap;
}

.toolbar-button {
  gap: 0.45rem;
  align-self: end;
  border: 1px solid var(--app-border);
  background: var(--app-panel-strong);
  color: var(--app-text);
  min-height: 2.65rem;
}

.transfer-button {
  align-self: end;
  min-height: 2.65rem;
  border-color: var(--app-action-transfer-border);
  background: var(--app-action-transfer-bg);
  color: var(--app-action-transfer-fg);
  font-weight: 800;
  box-shadow: 0 8px 18px rgba(29, 78, 216, 0.12);
}

.transfer-button:hover {
  border-color: var(--app-action-transfer-border);
  background: var(--app-action-transfer-bg);
  color: var(--app-action-transfer-fg);
  filter: brightness(1.06);
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

.year-picker-label--icon {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.language-label-icon {
  width: 1rem;
  height: 1rem;
  background: currentColor;
  -webkit-mask-image: url('/icons/language.svg');
  -webkit-mask-position: center;
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-size: contain;
  mask-image: url('/icons/language.svg');
  mask-position: center;
  mask-repeat: no-repeat;
  mask-size: contain;
}

.year-select {
  min-width: 220px;
}

.transfer-message {
  box-shadow: var(--app-shadow-soft);
}

.import-dialog-body {
  display: grid;
  gap: 1rem;
}

.import-textarea {
  width: min(78vw, 720px);
  max-width: 100%;
}

.import-dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

@media (max-width: 720px) {
  .page-actions-card {
    padding: 0.75rem;
  }

  .page-actions {
    display: grid;
  }

  .page-actions-left,
  .page-actions-right {
    display: grid;
    width: 100%;
  }

  .control-group,
  .year-select {
    min-width: 100%;
  }

  .toolbar-button {
    justify-self: stretch;
  }

  .import-dialog-actions {
    flex-direction: column-reverse;
  }

  .transfer-button {
    width: 100%;
  }

  .page-subtitle {
    display: none;
  }
}
</style>
