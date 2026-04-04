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
import type { HullType, LocaleCode, ShipCatalog, TournamentDataset } from '@/lib/types'

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
  banLink,
  banShip,
  banValidation,
  clearBans,
  clearPicks,
  dataset,
  derivedState,
  feedbackReasons,
  hullCountLabel,
  hullTypes,
  localizedShipName,
  pickValidation,
  removeShip,
  ruleLink,
  shipProperty,
  unbanShip,
} = useDraftBoard(props.dataset, props.shipCatalog, appLocale)

const feedbackMessages = computed(() => feedbackReasons.value.map((reason) => t(`validation.${reason}`)))

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
</script>

<template>
  <div class="draft-page">
    <a class="rules-link" :href="ruleLink" target="_blank" rel="noreferrer">
      {{ $t('messages.rules') }} : {{ dataset.summary.label }}
    </a>

    <div
      class="points-summary"
      :class="{
        'points-summary--over': derivedState.totalPoints > dataset.rules.maxPoints,
        'points-summary--limit': derivedState.totalPoints === dataset.rules.maxPoints,
        'points-summary--safe': derivedState.totalPoints < dataset.rules.maxPoints,
      }"
    >
      {{ derivedState.totalPoints }} / {{ dataset.rules.maxPoints }}
    </div>

    <Message v-if="feedbackMessages.length" severity="warn" variant="outlined">
      {{ feedbackMessages[0] }}
    </Message>

    <main class="draft-layout">
      <section class="selection-panel">
        <Tabs :value="activeHullType" class="draft-tabs" @update:value="activeHullType = $event as HullType">
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
            <img src="/icons/remove.svg" alt="" class="button-icon-image" />
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
          <img src="/icons/remove.svg" alt="" class="button-icon-image" />
          <span>{{ $t('messages.clear') }}</span>
        </Button>
      </div>

      <div class="ban-list">
        <Ship
          v-for="ship in derivedState.banList"
          :key="`${ship.hullType}-${ship.shipKey}`"
          :hull_type="ship.hullType"
          :ship_name="ship.shipKey"
          :display_name="localizedShipName(ship.shipKey)"
          :property="{ points: ship.points, shipId: ship.shipId, original_points: ship.originalPoints }"
          :btns="['unban']"
          @unban_ship="unbanShip(ship.hullType, ship.shipKey)"
        />
      </div>
    </section>
  </div>
</template>

<style scoped>
.draft-page {
  display: grid;
  gap: 1rem;
}

.rules-link,
.ban-rules-link {
  font-size: 1.1rem;
}

.points-summary {
  font-size: 2rem;
  font-weight: 800;
}

.points-summary--over {
  color: #c62828;
}

.points-summary--limit {
  color: #b7791f;
}

.points-summary--safe {
  color: #2e7d32;
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
  border: 1px solid var(--surface-border);
  border-radius: 1rem;
  background: var(--surface-card);
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08);
}

.selection-panel,
.summary-panel,
.ban-section {
  padding: 1rem;
}

.selection-layout {
  display: grid;
  grid-template-columns: minmax(180px, 240px) minmax(0, 1fr);
  gap: 1rem;
  align-items: start;
}

.hull-tab-list {
  display: grid;
  gap: 0.5rem;
}

.hull-tab {
  justify-content: stretch;
}

.hull-tab-content {
  display: flex;
  width: 100%;
  gap: 0.75rem;
  align-items: center;
  justify-content: space-between;
  font-weight: 700;
}

.hull-tab-name {
  flex: 1;
  text-align: left;
}

.hull-tab-count {
  white-space: nowrap;
  font-size: 0.95rem;
}

.ship-panel {
  padding: 0;
}

.ship-panel-scroll {
  height: 510px;
  overflow: auto;
  padding-right: 0.25rem;
}

.summary-header {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

.summary-title {
  font-size: 1.5rem;
  font-weight: 800;
}

.summary-title--pick {
  color: #2e7d32;
}

.summary-title--ban {
  color: #c62828;
}

.summary-title-count {
  font-size: 1.125rem;
}

.summary-title-count--limit {
  color: #b7791f;
}

.summary-title-count--safe {
  color: #2e7d32;
}

.summary-list,
.ban-list {
  display: grid;
  gap: 0.25rem;
}

.ban-section {
  margin-top: 1rem;
}

.button-icon-image {
  width: 0.95rem;
  height: 0.95rem;
}

@media (max-width: 900px) {
  .draft-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .selection-layout {
    grid-template-columns: 1fr;
  }

  .hull-tab-name {
    display: none;
  }
}
</style>
