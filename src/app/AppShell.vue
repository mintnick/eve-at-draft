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
import { setStoredLocale } from '@/lib/preferences'
import { materializeParsedDraft, parseDraft } from '@/lib/rules/draft-codec'
import type { DraftValidationResult, LocaleCode, ParsedDraft } from '@/lib/types'

const { locale, t } = useI18n()
const { availableTournaments, currentTournament, draftState, getTournamentByYear, shipCatalog, tournamentOptions, tournamentState } = useAppState()

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
const ruleLink = computed(() => currentTournament.value?.sources.find((source) => source.label === 'Rules')?.url ?? null)
const archiveLink = computed(() => currentTournament.value?.sources.find((source) => source.label === 'Match Archive')?.url ?? null)

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
        <div class="page-title-copy">
          <div class="page-title">{{ $t('messages.title') }}</div>
        </div>
        <div class="language-control">
          <span class="language-label-icon" aria-hidden="true"></span>
          <Select
            id="app-language"
            :model-value="locale"
            :options="localeOptions"
            option-label="label"
            option-value="value"
            scroll-height="none"
            :aria-label="$t('messages.language')"
            class="year-select"
            @update:model-value="changeLang($event as LocaleCode)"
          />
        </div>
      </div>
      <div class="page-actions-card">
        <div class="page-actions">
          <div class="page-actions-left">
            <div class="control-group">
              <Select
                id="tournament-year"
                v-model="tournamentState.selectedYear"
                :options="tournamentOptions"
                option-label="label"
                option-value="value"
                class="year-select tournament-year-select"
              />
            </div>
            <div class="tournament-source-links">
              <a v-if="ruleLink" class="source-link" :href="ruleLink" target="_blank" rel="noreferrer">
                {{ $t('messages.rules') }}
              </a>
              <a v-if="archiveLink" class="source-link" :href="archiveLink" target="_blank" rel="noreferrer">
                {{ $t('messages.matchArchive') }}
              </a>
            </div>
          </div>
          <div class="page-actions-right">
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

    <footer class="app-footer">
      <span class="app-footer-disclaimer">{{ $t('messages.footerDisclaimer') }}</span>
      <span>&copy; Nick Ning</span>
      <span><a href="https://github.com/mintnick/eve-at-draft" target="_blank" rel="noreferrer">GitHub</a></span>
      <span><a href="https://github.com/mintnick/eve-at-draft/issues/new" target="_blank" rel="noreferrer">{{ $t('messages.reportBug') }}</a></span>
    </footer>
  </div>
</template>

<style scoped>
.page-shell {
  display: grid;
  gap: 0.85rem;
  padding-top: 1rem;
}

.page-header {
  display: grid;
  gap: 0.6rem;
}

.page-title-wrap {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 0.85rem;
  min-width: 0;
}

.page-title-copy {
  display: flex;
  align-items: baseline;
  gap: 0.85rem;
  min-width: 0;
}

.page-title {
  color: var(--app-text-strong);
  font-size: 1.15rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.page-actions-card {
  border: 1px solid var(--app-border);
  background: var(--app-panel);
  padding: 0.6rem 0.75rem;
}

.page-actions {
  display: flex;
  justify-content: space-between;
  gap: 0.6rem;
  align-items: end;
  flex-wrap: wrap;
}

.page-actions-left {
  display: flex;
  gap: 0.6rem;
  align-items: end;
  flex-wrap: wrap;
}

.page-actions-right {
  display: flex;
  gap: 0.5rem;
  align-items: end;
  flex-wrap: wrap;
}

.transfer-button {
  align-self: end;
  min-height: 2.1rem;
  border: 1px solid var(--app-border-strong);
  background: var(--app-panel-strong);
  color: var(--app-text);
  font-weight: 600;
  letter-spacing: 0.03em;
}

.transfer-button:hover {
  border-color: var(--app-text-muted);
  background: var(--app-panel-hover);
  color: var(--app-text-strong);
}

.control-group {
  display: grid;
  gap: 0.25rem;
  min-width: 200px;
}

.language-control {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--app-text-muted);
}

.language-control .year-select {
  min-width: 140px;
}

.language-label-icon {
  width: 1rem;
  height: 1rem;
  flex: 0 0 auto;
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

.tournament-source-links {
  display: flex;
  align-items: flex-end;
  align-self: end;
  gap: 0.9rem;
  min-height: 2.1rem;
  flex-wrap: wrap;
  padding-bottom: 0.35rem;
}

.source-link {
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--app-accent);
  white-space: nowrap;
}

.year-select {
  min-width: 200px;
}

.tournament-year-select {
  min-width: 280px;
}

.tournament-year-select:deep(.p-select-label) {
  font-size: 0.95rem;
  font-weight: 600;
  line-height: 1.2;
}

.transfer-message {
  border-radius: 2px;
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

  .page-title-wrap,
  .page-title-copy {
    display: grid;
  }

  .control-group,
  .year-select {
    min-width: 100%;
  }

  .language-control {
    width: 100%;
  }

  .import-dialog-actions {
    flex-direction: column-reverse;
  }

  .transfer-button {
    width: 100%;
  }

}
</style>
