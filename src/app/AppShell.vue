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
const appLocale = computed(() => locale.value as LocaleCode)
const prizeRewardShips = computed(() => {
  const tournament = currentTournament.value
  if (!tournament) {
    return []
  }

  const shipNameByShipId = new Map<number, Record<LocaleCode, string>>()
  for (const entry of Object.values(shipCatalog)) {
    shipNameByShipId.set(entry.shipId, entry.names)
  }

  return tournament.summary.prize.rewardShips.map((rewardShip) => {
    const names = shipNameByShipId.get(rewardShip.shipId)
    const localized = names?.[appLocale.value] ?? names?.en ?? rewardShip.name
    return { shipId: rewardShip.shipId, name: localized }
  })
})

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
            <div v-if="prizeRewardShips.length" class="header-prize-links">
              <span class="header-prize-label">{{ $t('messages.prizeShips') }}</span>
              <span class="header-reward-links">
                <a
                  v-for="rewardShip in prizeRewardShips"
                  :key="rewardShip.shipId"
                  class="header-reward-link"
                  :href="`https://zkillboard.com/ship/${rewardShip.shipId}/`"
                  target="_blank"
                  rel="noreferrer"
                >
                  {{ rewardShip.name }}
                </a>
              </span>
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
  gap: 18px;
  padding-top: 1rem;
}

.page-header {
  display: grid;
  gap: 0.7rem;
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
  font-family: var(--app-font-display);
  font-size: 1.75rem;
  font-weight: 700;
  letter-spacing: 0;
  text-transform: uppercase;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.page-actions-card {
  position: relative;
  overflow: hidden;
  padding: 14px 22px;
  background: var(--app-console-bg);
  box-shadow: inset 0 0 0 1px rgba(150, 170, 190, 0.16);
  clip-path: polygon(16px 0, 100% 0, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0 100%, 0 16px);
}

.page-actions-card::before {
  position: absolute;
  inset: 0;
  pointer-events: none;
  content: '';
  background: var(--app-console-stripe);
}

.page-actions {
  position: relative;
  display: flex;
  justify-content: space-between;
  gap: 14px;
  align-items: center;
  flex-wrap: wrap;
}

.page-actions-left {
  display: flex;
  gap: 14px;
  align-items: center;
  flex-wrap: wrap;
}

.page-actions-right {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.transfer-button {
  align-self: center;
  min-height: 34px;
  padding: 8px 18px;
  border: 0;
  background: #1a222b;
  color: #dfe7ec;
  font-family: var(--app-font-display);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.12em;
  box-shadow: inset 0 0 0 1px rgba(150, 170, 190, 0.24);
  clip-path: polygon(7px 0, 100% 0, 100% calc(100% - 7px), calc(100% - 7px) 100%, 0 100%, 0 7px);
  transition: box-shadow 0.14s ease, color 0.14s ease, filter 0.14s ease;
}

.transfer-button:hover {
  background: #1a222b;
  color: #fff;
  box-shadow: inset 0 0 0 1px rgba(255, 167, 51, 0.55);
}

.control-group {
  display: grid;
  gap: 0.25rem;
  min-width: 300px;
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

.tournament-source-links {
  display: flex;
  align-items: center;
  align-self: center;
  gap: 0.9rem;
  min-height: 34px;
  flex-wrap: wrap;
}

.source-link {
  color: #dfe7ec;
  font-family: var(--app-font-display);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  white-space: nowrap;
  text-decoration: underline;
  text-decoration-color: rgba(255, 167, 51, 0.55);
  text-decoration-thickness: 1px;
  text-underline-offset: 4px;
  transition: color 0.14s ease, text-decoration-color 0.14s ease;
}

.source-link:hover {
  color: #fff;
  text-decoration-color: rgba(255, 167, 51, 0.8);
}

.header-prize-links {
  display: inline-flex;
  align-items: center;
  align-self: center;
  gap: 0.55rem;
  min-height: 34px;
  min-width: 0;
  color: var(--app-text-muted);
  font-size: 13px;
  white-space: nowrap;
}

.header-prize-label {
  color: var(--app-text-muted);
}

.header-reward-links {
  display: inline-flex;
  gap: 0.65rem;
  min-width: 0;
}

.header-reward-link {
  overflow: hidden;
  color: #ffbf63;
  font-weight: 500;
  text-overflow: ellipsis;
  text-decoration: none;
}

.header-reward-link:hover {
  color: #ffd18a;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.year-select {
  min-width: 200px;
  background: #161d24;
  border-color: rgba(255, 167, 51, 0.34);
  font-family: var(--app-font-display);
  clip-path: polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px);
}

.tournament-year-select {
  min-width: 300px;
}

.year-select:deep(.p-select-dropdown) {
  color: var(--app-accent);
}

.tournament-year-select:deep(.p-select-label) {
  color: #f4f8fb;
  font-family: var(--app-font-display);
  font-size: 14px;
  font-weight: 600;
  line-height: 1.2;
}

.transfer-message {
  clip-path: polygon(9px 0, 100% 0, 100% calc(100% - 9px), calc(100% - 9px) 100%, 0 100%, 0 9px);
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
    padding: 12px 16px;
  }

  .page-actions {
    display: grid;
  }

  .page-actions-left {
    display: grid;
    width: 100%;
  }

  .page-actions-right {
    display: flex;
    width: 100%;
    gap: 0.5rem;
  }

  .page-actions-right .transfer-button {
    flex: 1;
  }

  .page-title-wrap {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }

  .page-title {
    font-size: 1.25rem;
  }

  .page-title-copy {
    min-width: 0;
    flex: 1;
  }

  .control-group,
  .year-select,
  .tournament-year-select {
    min-width: 0;
    width: 100%;
  }

  .language-control {
    flex: 0 0 auto;
  }

  .language-control .year-select {
    min-width: 0;
    width: auto;
  }

  .tournament-source-links {
    min-height: 0;
    gap: 0.75rem;
    padding-bottom: 0;
  }

  .import-dialog-actions {
    flex-direction: column-reverse;
  }

}
</style>
