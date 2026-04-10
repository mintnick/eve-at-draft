<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import Button from 'primevue/button'
import Message from 'primevue/message'
import Tab from 'primevue/tab'
import TabList from 'primevue/tablist'
import TabPanel from 'primevue/tabpanel'
import TabPanels from 'primevue/tabpanels'
import Tabs from 'primevue/tabs'

import Ship from '@/components/Ship.vue'
import { useDraftBoard } from '@/features/draft/useDraftBoard'
import { getTournamentDisplayLabel } from '@/lib/i18n/labels'
import type { HullType, LocaleCode, ParsedDraft, ShipCatalog, TournamentDataset } from '@/lib/types'

const props = defineProps<{
  dataset: TournamentDataset
  shipCatalog: ShipCatalog
}>()

const { locale, t } = useI18n()
const appLocale = computed(() => locale.value as LocaleCode)
const shipGroups = computed(() =>
  Object.entries(props.dataset.hulls).map(([hullType, ships]) => ({
    hullType: hullType as HullType,
    ships,
  })),
)

const {
  activeHullType,
  addShip,
  archiveLink,
  banLink,
  banShip,
  banValidation,
  clearBans,
  clearPicks,
  dataset,
  derivedState,
  exportDraftText,
  feedbackReasons,
  hullCountLabel,
  hullTypes,
  importParsedDraft,
  localizedShipName,
  pickValidation,
  removeShip,
  ruleLink,
  shipProperty,
  unbanShip,
} = useDraftBoard(props.dataset, props.shipCatalog, appLocale)

const feedbackMessages = computed(() => feedbackReasons.value.map((reason) => t(`validation.${reason}`)))
const tournamentLabel = computed(() => getTournamentDisplayLabel(dataset.summary, appLocale.value))

function pickReason(hullType: HullType, shipKey: string) {
  const validation = pickValidation(hullType, shipKey)
  return validation.valid ? undefined : validation.reasons.map((reason) => t(`validation.${reason}`)).join(' ')
}

function banReason(hullType: HullType, shipKey: string) {
  const validation = banValidation(hullType, shipKey)
  return validation.valid ? undefined : validation.reasons.map((reason) => t(`validation.${reason}`)).join(' ')
}

function handleAddShip(hullType: HullType, shipKey: string) {
  addShip(hullType, shipKey)
}

function handleBanShip(hullType: HullType, shipKey: string) {
  banShip(hullType, shipKey)
}

defineExpose({
  exportDraftText,
  importParsedDraft(parsedDraft: ParsedDraft) {
    return importParsedDraft(parsedDraft)
  },
})
</script>

<template>
  <div class="draft-page">
    <section class="draft-hero">
      <div class="draft-meta">
        <div class="draft-meta-label">{{ tournamentLabel }}</div>
        <div class="draft-meta-links">
          <a class="rules-link" :href="ruleLink" target="_blank" rel="noreferrer">
            {{ $t('messages.rules') }}
          </a>
          <a v-if="archiveLink" class="rules-link" :href="archiveLink" target="_blank" rel="noreferrer">
            {{ $t('messages.matchArchive') }}
          </a>
        </div>
      </div>

      <div
        class="points-summary"
        :class="{
          'points-summary--over': derivedState.totalPoints > dataset.rules.maxPoints,
          'points-summary--limit': derivedState.totalPoints === dataset.rules.maxPoints,
          'points-summary--safe': derivedState.totalPoints < dataset.rules.maxPoints,
        }"
      >
        <span class="points-summary-value">{{ derivedState.totalPoints }}</span>
        <span class="points-summary-divider">/</span>
        <span class="points-summary-cap">{{ dataset.rules.maxPoints }}</span>
      </div>
    </section>

    <Message v-if="feedbackMessages.length" severity="warn" variant="outlined" class="feedback-message">
      {{ feedbackMessages[0] }}
    </Message>

    <main class="draft-layout">
      <section class="selection-panel">
        <Tabs
          :value="activeHullType"
          :show-navigators="false"
          class="draft-tabs"
          @update:value="activeHullType = $event as HullType"
        >
          <div class="selection-layout">
            <TabList class="hull-tab-list">
              <Tab v-for="hullType in hullTypes" :key="hullType" :value="hullType" class="hull-tab">
                <div class="hull-tab-content">
                  <img :src="`./hull/${hullType}.png`" class="hull-icon" />
                  <span class="hull-tab-name">{{ $t(`types.${hullType}`) }}</span>
                  <span class="hull-tab-count">{{ hullCountLabel(hullType) }}</span>
                </div>
              </Tab>
            </TabList>

            <TabPanels class="ship-panel-list">
              <TabPanel
                v-for="group in shipGroups"
                :key="group.hullType"
                :value="group.hullType"
                class="ship-panel"
              >
                <div class="ship-panel-scroll">
                  <Ship
                    v-for="(property, shipKey) in group.ships"
                    :key="shipKey"
                    :hull_type="group.hullType"
                    :ship_name="shipKey"
                    :display_name="localizedShipName(shipKey)"
                    :property="shipProperty(property)"
                    :btns="['add', 'ban']"
                    :not_pickable="!pickValidation(group.hullType, shipKey).valid"
                    :pick_reason="pickReason(group.hullType, shipKey)"
                    :not_bannable="!banValidation(group.hullType, shipKey).valid"
                    :ban_reason="banReason(group.hullType, shipKey)"
                    @add_ship="handleAddShip(group.hullType, shipKey)"
                    @ban_ship="handleBanShip(group.hullType, shipKey)"
                  />
                </div>
              </TabPanel>
            </TabPanels>
          </div>
        </Tabs>
      </section>

      <aside class="summary-panel">
        <div class="summary-header">
          <div class="summary-title summary-title--pick">
            {{ $t('messages.pick') }}
            <span
              v-if="derivedState.pickList.length"
              class="summary-title-count"
              :class="{
                'summary-title-count--limit': derivedState.pickList.length >= dataset.rules.maxShips,
                'summary-title-count--safe': derivedState.pickList.length < dataset.rules.maxShips,
              }"
            >
              ({{ derivedState.pickList.length }} / {{ dataset.rules.maxShips }})
            </span>
          </div>
          <Button
            v-if="derivedState.pickList.length"
            class="clear-button"
            severity="contrast"
            variant="outlined"
            @click="clearPicks"
          >
            <span class="button-icon-image button-icon-image--remove" aria-hidden="true"></span>
            <span>{{ $t('messages.clear') }}</span>
          </Button>
        </div>

        <div class="summary-list">
          <Ship
            v-for="ship in derivedState.pickList"
            :key="`${ship.hullType}-${ship.shipKey}`"
            :hull_type="ship.hullType"
            :ship_name="ship.shipKey"
            :display_name="localizedShipName(ship.shipKey)"
            :property="{ points: ship.points, shipId: ship.shipId, original_points: ship.originalPoints }"
            :btns="['remove']"
            @remove_ship="removeShip(ship.hullType, ship.shipKey)"
          />
        </div>
      </aside>
    </main>

    <section class="ban-section">
      <div class="summary-header">
        <div class="summary-title summary-title--ban">
          {{ $t('messages.ban') }}
          <a class="ban-rules-link" :href="banLink" target="_blank" rel="noreferrer">
            ({{ $t('messages.rules') }})
          </a>
        </div>
        <Button
          v-if="derivedState.banList.length"
          class="clear-button"
          severity="contrast"
          variant="outlined"
          @click="clearBans"
        >
          <span class="button-icon-image button-icon-image--remove" aria-hidden="true"></span>
          <span>{{ $t('messages.clear') }}</span>
        </Button>
      </div>

      <div class="ban-list">
        <div
          v-for="ship in derivedState.banList"
          :key="`${ship.hullType}-${ship.shipKey}`"
          class="ban-pill"
        >
          <img
            class="ban-pill-icon"
            :src="`https://images.evetech.net/types/${ship.shipId}/icon`"
            :alt="`${ship.shipKey} icon`"
          />
          <span class="ban-pill-name">{{ localizedShipName(ship.shipKey) }}</span>
          <Button
            rounded
            text
            class="ship-action ship-action--remove ban-pill-remove-button"
            @click="unbanShip(ship.hullType, ship.shipKey)"
          >
            <span class="ship-action-icon ship-action-icon--remove" aria-hidden="true"></span>
          </Button>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.draft-page {
  display: grid;
  gap: 1.2rem;
}

.draft-hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 1rem;
  align-items: end;
  border: 1px solid var(--app-border);
  border-radius: 1.5rem;
  background: var(--app-panel);
  box-shadow: var(--app-shadow-soft);
  backdrop-filter: blur(16px);
  padding: 1.1rem 1.2rem;
}

.draft-meta {
  display: grid;
  gap: 0.35rem;
}

.draft-meta-links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.9rem;
}

.draft-meta-label {
  font-size: clamp(1.1rem, 2vw, 1.45rem);
  font-weight: 800;
  letter-spacing: -0.03em;
}

.rules-link,
.ban-rules-link {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--app-accent-warm-muted);
}

.points-summary {
  display: flex;
  align-items: baseline;
  gap: 0.35rem;
  padding: 0.85rem 1rem;
  border-radius: 1.2rem;
  background: var(--app-panel-strong);
  border: 1px solid var(--app-border);
  font-weight: 800;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.16);
}

.points-summary-value {
  font-size: clamp(2rem, 4vw, 3rem);
  line-height: 1;
}

.points-summary-divider,
.points-summary-cap {
  font-size: 1.15rem;
  color: var(--app-text-muted);
}

.points-summary--over {
  color: var(--app-danger);
}

.points-summary--limit {
  color: var(--app-warning);
}

.points-summary--safe {
  color: var(--app-success);
}

.feedback-message {
  box-shadow: var(--app-shadow-soft);
}

.draft-layout {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(280px, 1fr);
  gap: 1.25rem;
  align-items: start;
}

.selection-panel,
.summary-panel,
.ban-section {
  border: 1px solid var(--app-border);
  border-radius: 1.4rem;
  background: var(--app-panel);
  box-shadow: var(--app-shadow-soft);
  backdrop-filter: blur(16px);
}

.selection-panel,
.summary-panel,
.ban-section {
  padding: 1rem 1rem 1.1rem;
}

.selection-layout {
  display: grid;
  grid-template-columns: minmax(180px, 240px) minmax(0, 1fr);
  gap: 1rem;
  align-items: start;
}

.hull-tab-list {
  display: grid;
  gap: 0.6rem;
  min-width: 0;
  overflow: hidden;
}

.hull-tab-list:deep(.p-tablist-content) {
  overflow: hidden;
  border: 0;
}

.hull-tab-list:deep(.p-tablist-nav-button) {
  display: none;
}

.hull-tab-list:deep(.p-tablist-active-bar) {
  display: none;
}

.hull-tab-list:deep(.p-tablist-tab-list) {
  display: grid;
  gap: 0.6rem;
  min-width: 0;
  border: 0;
}

.hull-tab {
  justify-content: stretch;
  min-width: 0;
  max-width: 100%;
  border: 1px solid transparent;
  border-bottom: 1px solid transparent;
  border-radius: 1rem;
  background: rgba(148, 163, 184, 0.08);
  transition:
    background-color 160ms ease,
    border-color 160ms ease,
    box-shadow 160ms ease,
    transform 160ms ease;
}

.hull-tab:hover {
  border-color: var(--app-border);
  background: rgba(148, 163, 184, 0.14);
}

.hull-tab.p-tab-active {
  border-color: var(--app-accent);
  background: var(--app-panel-strong);
  box-shadow:
    inset 0 0 0 1px color-mix(in srgb, var(--app-accent) 18%, transparent),
    0 12px 28px rgba(15, 23, 42, 0.12);
}

.hull-tab-content {
  display: flex;
  width: 100%;
  min-width: 0;
  gap: 0.8rem;
  align-items: center;
  justify-content: space-between;
  font-weight: 700;
}

.hull-tab-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: left;
}

.hull-tab-count {
  flex: 0 0 auto;
  white-space: nowrap;
  font-size: 0.95rem;
  color: var(--app-text-muted);
}

.hull-tab.p-tab-active .hull-tab-count {
  color: var(--app-accent);
}

.ship-panel {
  padding: 0;
}

.ship-panel-scroll {
  height: min(62vh, 760px);
  overflow: auto;
  padding-right: 0.35rem;
}

.summary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

.summary-title {
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: -0.03em;
}

.summary-title--pick {
  color: var(--app-success);
}

.summary-title--ban {
  color: var(--app-danger);
}

.summary-title-count {
  font-size: 1.125rem;
}

.summary-title-count--limit {
  color: var(--app-warning);
}

.summary-title-count--safe {
  color: var(--app-success);
}

.summary-list {
  display: grid;
  gap: 0.4rem;
}

.ban-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
}

.ban-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  max-width: 100%;
  border: 1px solid rgba(185, 28, 28, 0.22);
  border-radius: 999px;
  background: rgba(185, 28, 28, 0.1);
  color: var(--app-text);
  padding: 0.28rem 0.35rem 0.28rem 0.32rem;
  font-weight: 750;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.18);
  transition:
    background-color 160ms ease,
    border-color 160ms ease,
    transform 160ms ease;
}

.ban-pill:hover {
  border-color: rgba(185, 28, 28, 0.42);
  background: rgba(185, 28, 28, 0.16);
  transform: translateY(-1px);
}

.ban-pill-icon {
  width: 2rem;
  height: 2rem;
  border-radius: 999px;
  flex: 0 0 auto;
}

.ban-pill-name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ban-pill-remove-button {
  flex: 0 0 auto;
  width: 2.45rem;
  height: 2.45rem;
  border: 1px solid rgba(255, 255, 255, 0.28);
  background: var(--app-action-remove-bg);
  color: var(--app-action-remove-fg);
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.18);
}

.ban-pill-remove-button:hover {
  background: var(--app-action-remove-bg);
  color: var(--app-action-remove-fg);
  filter: brightness(1.08);
  transform: translateY(-1px);
}

.ban-pill-remove-button .ship-action-icon {
  display: block;
  width: 1.7rem;
  height: 1.7rem;
  background: currentColor;
  -webkit-mask-position: center;
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-size: contain;
  mask-position: center;
  mask-repeat: no-repeat;
  mask-size: contain;
}

.ban-pill-remove-button .ship-action-icon--remove {
  -webkit-mask-image: url('/icons/remove.svg');
  -webkit-mask-size: 185%;
  mask-image: url('/icons/remove.svg');
  mask-size: 185%;
}

.ban-section {
  margin-top: 0.15rem;
}

.button-icon-image {
  display: inline-block;
  width: 1.1rem;
  height: 1.1rem;
  background: currentColor;
  -webkit-mask-position: center;
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-size: contain;
  mask-position: center;
  mask-repeat: no-repeat;
  mask-size: contain;
}

.button-icon-image--remove {
  -webkit-mask-image: url('/icons/remove.svg');
  -webkit-mask-size: 145%;
  mask-image: url('/icons/remove.svg');
  mask-size: 145%;
}

.clear-button {
  border-color: var(--app-action-clear-border);
  background: var(--app-action-clear-bg);
  color: var(--app-action-clear-fg);
  font-weight: 800;
  box-shadow: 0 8px 18px rgba(180, 83, 9, 0.18);
}

.clear-button:hover {
  border-color: var(--app-action-clear-border);
  background: var(--app-action-clear-bg);
  color: var(--app-action-clear-fg);
  filter: brightness(1.08);
}

@media (max-width: 900px) {
  .draft-hero {
    grid-template-columns: 1fr;
    align-items: start;
  }

  .draft-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .selection-layout {
    grid-template-columns: 1fr;
  }

  .summary-header {
    justify-content: center;
  }

  .hull-tab-list:deep(.p-tablist-tab-list) {
    grid-template-columns: repeat(auto-fit, minmax(4.25rem, 1fr));
  }

  .hull-tab-content {
    justify-content: center;
    gap: 0.45rem;
  }

  .hull-tab-name {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }

  .hull-tab-count {
    font-size: 0.82rem;
  }

  .ship-panel-scroll {
    height: min(52vh, 560px);
  }
}
</style>
