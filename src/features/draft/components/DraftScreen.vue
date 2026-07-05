<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import Button from 'primevue/button'
import Tab from 'primevue/tab'
import TabList from 'primevue/tablist'
import TabPanel from 'primevue/tabpanel'
import TabPanels from 'primevue/tabpanels'
import Tabs from 'primevue/tabs'

import Ship from '@/components/Ship.vue'
import { useDraftBoard } from '@/features/draft/useDraftBoard'
import type { HullType, LocaleCode, ParsedDraft, ShipCatalog, TournamentDataset } from '@/lib/types'

const props = defineProps<{
  dataset: TournamentDataset
  shipCatalog: ShipCatalog
}>()

const { locale, t } = useI18n()
const appLocale = computed(() => locale.value as LocaleCode)
const baseUrl = import.meta.env.BASE_URL
const shipGroups = computed(() =>
  Object.entries(props.dataset.hulls).map(([hullType, ships]) => ({
    hullType: hullType as HullType,
    ships,
  })),
)

const {
  activeHullType,
  addShip,
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
  shipProperty,
  unbanShip,
} = useDraftBoard(props.dataset, props.shipCatalog, appLocale)

const feedbackMessages = computed(() => feedbackReasons.value.map((reason) => t(`validation.${reason}`)))
const toastMessage = ref('')
const toastVisible = ref(false)
const hullListElement = ref<HTMLElement | null>(null)
const shipListHeight = ref('min(62vh, 760px)')
let hullListResizeObserver: ResizeObserver | undefined
let toastTimer: ReturnType<typeof setTimeout> | undefined

function updateShipListHeight() {
  const height = hullListElement.value?.getBoundingClientRect().height

  if (height && Number.isFinite(height)) {
    shipListHeight.value = `${height}px`
  }
}

onMounted(() => {
  void nextTick(() => {
    updateShipListHeight()

    if (hullListElement.value && typeof ResizeObserver !== 'undefined') {
      hullListResizeObserver = new ResizeObserver(updateShipListHeight)
      hullListResizeObserver.observe(hullListElement.value)
    }
  })
})

onBeforeUnmount(() => {
  hullListResizeObserver?.disconnect()
  if (toastTimer) {
    clearTimeout(toastTimer)
  }
})

watch(feedbackMessages, ([message]) => {
  if (!message) {
    return
  }

  toastMessage.value = message
  toastVisible.value = true

  if (toastTimer) {
    clearTimeout(toastTimer)
  }

  toastTimer = setTimeout(() => {
    toastVisible.value = false
  }, 2000)
})

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
    <Transition name="feedback-toast">
      <div v-if="toastVisible" class="feedback-toast" role="alert" aria-live="polite">
        {{ toastMessage }}
      </div>
    </Transition>

    <main class="draft-layout">
      <section class="selection-panel">
        <Tabs
          :value="activeHullType"
          :show-navigators="false"
          class="draft-tabs"
          @update:value="activeHullType = $event as HullType"
        >
          <div class="selection-layout">
            <div ref="hullListElement" class="hull-list-frame">
              <TabList class="hull-tab-list">
                <Tab v-for="hullType in hullTypes" :key="hullType" :value="hullType" class="hull-tab">
                  <div class="hull-tab-content">
                    <img :src="`${baseUrl}hull/${hullType}.png`" class="hull-icon" />
                    <span class="hull-tab-name">{{ $t(`types.${hullType}`) }}</span>
                    <span class="hull-tab-count">{{ hullCountLabel(hullType) }}</span>
                  </div>
                </Tab>
              </TabList>
            </div>

            <TabPanels class="ship-panel-list">
              <TabPanel
                v-for="group in shipGroups"
                :key="group.hullType"
                :value="group.hullType"
                class="ship-panel"
              >
                <div class="ship-section-label">{{ $t(`types.${activeHullType}`) }}</div>
                <div class="ship-panel-scroll" :style="{ height: shipListHeight }">
                  <Ship
                    v-for="(property, shipKey) in group.ships"
                    :key="shipKey"
                    :hull-type="group.hullType"
                    :ship-name="shipKey"
                    :display-name="localizedShipName(shipKey)"
                    :property="shipProperty(property)"
                    :btns="['add', 'ban']"
                    :not-pickable="!pickValidation(group.hullType, shipKey).valid"
                    :pick-reason="pickReason(group.hullType, shipKey)"
                    :not-bannable="!banValidation(group.hullType, shipKey).valid"
                    :ban-reason="banReason(group.hullType, shipKey)"
                    @add-ship="handleAddShip(group.hullType, shipKey)"
                    @ban-ship="handleBanShip(group.hullType, shipKey)"
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
            <span
              class="summary-title-count"
              :class="{
                'summary-title-count--limit': derivedState.pickList.length >= dataset.rules.maxShips,
                'summary-title-count--safe': derivedState.pickList.length < dataset.rules.maxShips,
              }"
            >
              {{ derivedState.pickList.length }} / {{ dataset.rules.maxShips }}
            </span>
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
          <Button
            class="clear-button"
            @click="clearPicks"
          >
            <span class="button-icon-image button-icon-image--remove" aria-hidden="true"></span>
            <span>{{ $t('messages.clear') }}</span>
          </Button>
        </div>

        <div class="summary-list">
          <Ship
            v-for="(ship, index) in derivedState.pickList"
            :key="`${ship.hullType}-${ship.shipKey}-${index}`"
            :hull-type="ship.hullType"
            :ship-name="ship.shipKey"
            :display-name="localizedShipName(ship.shipKey)"
            :property="{ points: ship.points, shipId: ship.shipId, originalPoints: ship.originalPoints }"
            :btns="['remove']"
            @remove-ship="removeShip(ship.hullType, ship.shipKey)"
          />
        </div>
      </aside>
    </main>

    <section class="ban-section">
      <div class="summary-header">
        <div class="summary-title summary-title--ban">
          BAN
          <a class="ban-rules-link" :href="banLink" target="_blank" rel="noreferrer">
            ({{ $t('messages.rules') }})
          </a>
        </div>
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
            text
            class="ship-action ship-action--remove ban-pill-remove-button"
            @click="unbanShip(ship.hullType, ship.shipKey)"
          >
            <span class="ship-action-icon ship-action-icon--remove" aria-hidden="true"></span>
          </Button>
        </div>
      </div>

      <div v-if="derivedState.banList.length" class="ban-clear-row">
        <Button
          class="clear-button"
          @click="clearBans"
        >
          <span class="button-icon-image button-icon-image--remove" aria-hidden="true"></span>
          <span>{{ $t('messages.clear') }}</span>
        </Button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.draft-page {
  position: relative;
  display: grid;
  gap: 18px;
  overflow: hidden;
  padding: 14px 22px;
  background: var(--app-console-bg);
  box-shadow: inset 0 0 0 1px rgba(150, 170, 190, 0.16);
  clip-path: polygon(16px 0, 100% 0, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0 100%, 0 16px);
}

.draft-page::before {
  position: absolute;
  inset: 0;
  pointer-events: none;
  content: '';
  background: var(--app-console-stripe);
}

.draft-page > * {
  position: relative;
}

.feedback-toast {
  position: absolute;
  z-index: 3;
  top: 14px;
  left: 50%;
  width: min(72%, 680px);
  padding: 12px 18px;
  overflow: hidden;
  color: #ff4d6a;
  font-size: 16px;
  font-weight: 600;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
  background: #1c1418;
  box-shadow: inset 0 0 0 1px rgba(255, 77, 106, 0.42), inset 2px 0 0 #ff4d6a, 0 12px 30px rgba(0, 0, 0, 0.26);
  transform: translateX(-50%);
  clip-path: polygon(9px 0, 100% 0, 100% calc(100% - 9px), calc(100% - 9px) 100%, 0 100%, 0 9px);
}

.feedback-toast-enter-active,
.feedback-toast-leave-active {
  transition: opacity 0.22s ease, transform 0.22s ease;
}

.feedback-toast-enter-from,
.feedback-toast-leave-to {
  opacity: 0;
  transform: translate(-50%, -6px);
}

.ban-rules-link {
  color: #dfe7ec;
  font-family: var(--app-font-display);
  font-size: 14px;
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

.ban-rules-link:hover {
  color: #fff;
  text-decoration-color: rgba(255, 167, 51, 0.8);
}

.points-summary {
  display: flex;
  align-items: baseline;
  gap: 6px;
  flex: 0 0 auto;
  min-width: 0;
  padding: 6px 10px;
  background: linear-gradient(180deg, #201a12, #181410);
  font-family: var(--app-font-mono);
  font-variant-numeric: tabular-nums;
  font-weight: 500;
  box-shadow: inset 0 0 0 1px rgba(255, 167, 51, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.035);
  clip-path: polygon(9px 0, 100% 0, 100% calc(100% - 9px), calc(100% - 9px) 100%, 0 100%, 0 9px);
}

.points-summary-label {
  align-self: center;
  margin-right: 2px;
  color: var(--app-accent);
  font-family: var(--app-font-display);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.points-summary-value {
  color: #ffbf63;
  font-size: 20px;
  line-height: 1;
}

.points-summary-divider,
.points-summary-cap {
  color: #8a7a5a;
  font-size: 14px;
}

.points-summary--over {
  box-shadow: inset 0 0 0 1px rgba(255, 77, 106, 0.58), inset 0 1px 0 rgba(255, 255, 255, 0.035);
}

.points-summary--limit {
  box-shadow: inset 0 0 0 1px rgba(255, 177, 60, 0.62), inset 0 1px 0 rgba(255, 255, 255, 0.035);
}

.points-summary--safe {
  box-shadow: inset 0 0 0 1px rgba(255, 167, 51, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.035);
}

.draft-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 304px;
  gap: 16px;
  align-items: start;
}

.summary-panel,
.ban-section {
  background: transparent;
  border: 0;
  padding: 0;
}

.selection-panel {
  min-width: 0;
}

.selection-layout {
  display: grid;
  grid-template-columns: 212px minmax(0, 1fr);
  gap: 16px;
  align-items: start;
}

.hull-list-frame {
  min-width: 0;
}

.hull-tab-list {
  display: grid;
  gap: 7px;
  min-width: 0;
  overflow: visible;
  background: transparent;
}

.hull-tab-list:deep(.p-tablist-content) {
  overflow: visible;
  border: 0;
  background: transparent;
}

.hull-tab-list:deep(.p-tablist-nav-button) {
  display: none;
}

.hull-tab-list:deep(.p-tab) {
  background: transparent !important;
}

.hull-tab-list:deep(.p-tablist-active-bar) {
  display: none;
}

.hull-tab-list:deep(.p-tablist-tab-list) {
  display: grid;
  gap: 7px;
  min-width: 0;
  border: 0;
  background: transparent;
}

.hull-tab {
  justify-content: stretch;
  min-width: 0;
  max-width: 100%;
  padding: 9px 11px;
  background: #10151b;
  box-shadow: inset 0 0 0 1px rgba(150, 170, 190, 0.13);
  transition: background 0.14s ease, box-shadow 0.14s ease;
  clip-path: polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px);
}

.hull-tab:hover {
  background: #161d25;
  box-shadow: inset 0 0 0 1px rgba(150, 170, 190, 0.24);
}

.hull-tab.p-tab-active {
  background: #1b232c;
  box-shadow: inset 0 0 0 1px rgba(255, 167, 51, 0.5), inset 3px 0 0 #ffa733;
}

.hull-tab-content {
  display: flex;
  width: 100%;
  min-width: 0;
  gap: 9px;
  align-items: center;
  justify-content: space-between;
  color: #b9c7d3;
  font-family: var(--app-font-display);
  font-size: 15px;
  font-weight: 600;
}

.hull-tab-content .hull-icon {
  width: 30px;
  height: 30px;
  flex: 0 0 auto;
  filter: grayscale(0.4) opacity(0.8);
}

.hull-tab.p-tab-active .hull-icon {
  filter: none;
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
  font-family: var(--app-font-display);
  font-variant-numeric: tabular-nums;
  font-size: 15px;
  color: #dfe7ec;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-shadow: 0 0 6px rgba(255, 167, 51, 0.18);
}

.hull-tab.p-tab-active .hull-tab-count {
  color: #ffbf63;
  font-weight: 700;
}

.hull-tab.p-tab-active .hull-tab-name {
  color: #f4f8fb;
}

.ship-panel {
  padding: 0;
}

.ship-panel-list {
  padding: 0;
  background: transparent;
  min-width: 0;
}

.ship-section-label {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 7px;
  color: var(--app-accent);
  font-family: var(--app-font-mono);
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.14em;
  line-height: 1;
  text-transform: uppercase;
}

.ship-section-label::after {
  flex: 1;
  height: 1px;
  content: '';
  background: linear-gradient(90deg, rgba(255, 167, 51, 0.72), transparent);
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
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 9px;
}

.summary-panel .summary-header {
  flex-wrap: nowrap;
}

.summary-title {
  display: flex;
  align-items: baseline;
  gap: 8px;
  font-family: var(--app-font-mono);
  font-size: 15px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.18em;
}

.summary-title--pick {
  color: var(--app-success);
}

.summary-title--ban {
  color: var(--app-danger);
  font-family: var(--app-font-display);
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0.12em;
}

.summary-title-count {
  font-family: var(--app-font-mono);
  font-variant-numeric: tabular-nums;
  font-size: 16px;
  font-weight: 500;
  letter-spacing: 0.08em;
  color: var(--app-text);
}

.summary-title-count--limit {
  color: var(--app-warning);
}

.summary-title-count--safe {
  color: var(--app-success);
}

.summary-list {
  display: grid;
  gap: 9px;
}

.summary-list :deep(.ship-wrapper) {
  padding: 7px 9px 7px 7px;
  border: 0;
  background: #11161c;
  box-shadow: inset 2px 0 0 #3ef0bf, var(--app-inner-shadow);
  clip-path: polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px);
}

.summary-list :deep(.ship-icon) {
  width: 28px;
  height: 28px;
}

.summary-list :deep(.ship-name) {
  color: #dfe7ec;
  font-weight: 600;
  font-size: 15px;
}

.summary-list :deep(.ship-action) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  clip-path: polygon(5px 0, 100% 0, 100% calc(100% - 5px), calc(100% - 5px) 100%, 0 100%, 0 5px);
}

.summary-list :deep(.ship-action-icon--remove) {
  width: 14px;
  height: 14px;
  -webkit-mask-size: 100%;
  mask-size: 100%;
}

.ban-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.ban-clear-row {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}

.ban-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  max-width: 100%;
  background: #1c1418;
  box-shadow: inset 0 0 0 1px rgba(255, 77, 106, 0.4), inset 2px 0 0 #ff4d6a;
  color: #f0c6cd;
  padding: 5px 6px 5px 9px;
  font-weight: 600;
  transition: background 0.14s ease, box-shadow 0.14s ease;
  clip-path: polygon(7px 0, 100% 0, 100% calc(100% - 7px), calc(100% - 7px) 100%, 0 100%, 0 7px);
}

.ban-pill:hover {
  background: #21171c;
  box-shadow: inset 0 0 0 1px rgba(255, 77, 106, 0.6), inset 2px 0 0 #ff4d6a;
}

.ban-pill-icon {
  width: 26px;
  height: 26px;
  flex: 0 0 auto;
}

.ban-pill-name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 15px;
}

.ban-pill-remove-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  width: 24px;
  height: 24px;
  padding: 0;
  border: 0;
  background: var(--app-action-remove-bg);
  color: var(--app-action-remove-fg);
  clip-path: polygon(5px 0, 100% 0, 100% calc(100% - 5px), calc(100% - 5px) 100%, 0 100%, 0 5px);
}

.ban-pill-remove-button:hover {
  background: var(--app-action-remove-bg);
  color: var(--app-action-remove-fg);
  filter: brightness(1.12);
}

.ban-pill-remove-button .ship-action-icon {
  display: block;
  width: 14px;
  height: 14px;
  background: currentColor;
  -webkit-mask-position: center;
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-size: 100%;
  mask-position: center;
  mask-repeat: no-repeat;
  mask-size: 100%;
}

.ban-pill-remove-button .ship-action-icon--remove {
  -webkit-mask-image: url('/icons/remove.svg');
  mask-image: url('/icons/remove.svg');
}

.ban-section {
  margin-top: 0;
  padding-top: 14px;
  border-top: 1px solid rgba(150, 170, 190, 0.16);
}

.ban-section .summary-header {
  align-items: center;
}

.ban-section .summary-title {
  flex: 1;
  color: var(--app-danger);
}

.ban-section .summary-title::after {
  flex: 1;
  height: 1px;
  content: '';
  background: linear-gradient(90deg, rgba(255, 77, 106, 0.72), transparent);
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

.clear-button,
.clear-button.p-button {
  min-height: 28px;
  padding: 6px 12px;
  border: 0;
  background: var(--app-action-clear-bg);
  color: var(--app-action-clear-fg);
  font-family: var(--app-font-display);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.12em;
  box-shadow: none;
  transform: none;
  transition: none;
  clip-path: polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px);
}

.clear-button:hover,
.clear-button.p-button:hover,
.clear-button.p-button:enabled:hover,
.clear-button.p-button:enabled:active,
.clear-button.p-button:focus,
.clear-button.p-button:focus-visible {
  padding: 6px 12px;
  border: 0;
  background: var(--app-action-clear-bg);
  color: var(--app-action-clear-fg);
  box-shadow: none;
  transform: none;
  filter: none;
  outline: 0;
}

.clear-button:active,
.clear-button:focus,
.clear-button:focus-visible {
  box-shadow: none;
  transform: none;
}

.clear-button::before,
.clear-button::after {
  display: none;
}

@media (max-width: 900px) {
  .draft-layout {
    grid-template-columns: 1fr;
  }

  .selection-layout {
    grid-template-columns: 212px minmax(0, 1fr);
  }
}

@media (max-width: 720px) {
  .draft-page {
    padding: 12px 16px;
  }

  .selection-layout {
    grid-template-columns: 1fr;
  }

  .summary-header {
    justify-content: space-between;
  }

  .hull-tab-list:deep(.p-tablist-tab-list) {
    grid-template-columns: repeat(auto-fit, minmax(3.75rem, 1fr));
    gap: 0.35rem;
  }

  .hull-tab {
    padding: 8px 6px;
    min-width: 0;
    overflow: hidden;
  }

  .hull-tab.p-tab-active {
    box-shadow: inset 0 3px 0 #ffa733;
  }

  .hull-tab-content {
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 0.15rem;
    min-width: 0;
  }

  .hull-tab-content .hull-icon {
    width: 28px;
    height: 28px;
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
    font-size: 13px;
    line-height: 1;
  }

  .ship-panel-scroll {
    height: 440px !important;
  }

  .ban-pill-name {
    max-width: 8rem;
  }

}

@media (max-width: 480px) {
  .points-summary-value {
    font-size: 24px;
  }
}
</style>
