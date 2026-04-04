<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import Button from 'primevue/button'
import Tab from 'primevue/tab'
import TabList from 'primevue/tablist'
import TabPanel from 'primevue/tabpanel'
import TabPanels from 'primevue/tabpanels'
import Tabs from 'primevue/tabs'
import tournament from '../data/generated/2025.json'
import Ship from './components/Ship.vue'
import { useI18n } from 'vue-i18n'
import type { HullType, TournamentDataset, TournamentHullCatalog } from './lib/types'

const currentTournament = tournament as TournamentDataset
const data = currentTournament.hulls as TournamentHullCatalog
type LogisticsEntry = {
  shipId: number
  points: number
  logisticsWeight?: number
}
type ShipProperty = {
  shipId: number
  points: number
  logisticsWeight?: number
}

type DraftedShip = {
  hull_type: HullType
  ship_name: string
  property: {
    original_points?: number
    points: number
    shipId: number
  }
}

const i18n = useI18n()

const rule_link = currentTournament.sources.find((source) => source.label === 'Rules')?.url ?? '#'
const ban_link = currentTournament.sources.find((source) => source.label === 'Ban Rules')?.url ?? '#'
const max_points = currentTournament.rules.maxPoints
const max_ships = currentTournament.rules.maxShips
const max_number = currentTournament.rules.hullCaps as Record<HullType, number>

const hullTypes = Object.keys(data) as HullType[]

function createBuckets(): Record<HullType, DraftedShip[]> {
  return hullTypes.reduce(
    (buckets, hullType) => {
      buckets[hullType] = []
      return buckets
    },
    {} as Record<HullType, DraftedShip[]>,
  )
}

const pick = reactive(createBuckets())
const ban = reactive(createBuckets())

const tab = ref<HullType>('Flagship')
const isDark = ref(document.documentElement.classList.contains('app-dark'))

const total_points = computed(() => {
  let points = 0
  for (const ships of Object.values(pick)) {
    for (const ship of ships) points += ship.property.points
  }
  return points
})

const logi_count = computed(() => {
  let totalLogi = 0
  for (const logi of pick.Logistics) {
    totalLogi += (data.Logistics as Record<string, LogisticsEntry>)[logi.ship_name]?.logisticsWeight ?? 0
  }
  return totalLogi
})

const pick_list = computed(() => {
  const list = Object.values(pick).flat()
  return list.sort((a, b) => b.property.points - a.property.points)
})

const ban_list = computed(() => {
  const list = Object.values(ban).flat()
  return list.sort((a, b) => b.property.points - a.property.points)
})

const flagship_type = computed<Record<HullType, number>>(() => {
  const result: Record<HullType, number> = {
    Flagship: 0,
    Logistics: 0,
    Battleship: 0,
    Battlecruiser: 0,
    Cruiser: 0,
    Destroyer: 0,
    Frigate: 0,
    Industrial: 0,
    Corvette: 0,
  }

  const at_frigates = ['Shapash', 'Geri', 'Raiju']
  const at_cruisers = ['Cybele', 'Laelaps', 'Bestla']

  if (pick.Flagship.length) {
    const flagship = pick.Flagship[0].ship_name
    if (at_frigates.includes(flagship)) result.Frigate = 1
    else if (at_cruisers.includes(flagship)) result.Cruiser = 1
    else result.Battleship = 1
  }

  return result
})

function add_ship(hull_type: string, ship_name: string, property: ShipProperty) {
  const typedHullType = hull_type as HullType
  const original_points = property.points

  pick[typedHullType].push({
    hull_type: typedHullType,
    ship_name,
    property: {
      original_points,
      points: property.points,
      shipId: property.shipId,
    },
  })
}

function remove_ship(hull_type: string, ship_name: string) {
  const typedHullType = hull_type as HullType
  const index = pick[typedHullType].findIndex((ship) => ship.ship_name === ship_name)
  pick[typedHullType].splice(index, 1)
}

function ban_ship(hull_type: string, ship_name: string, property: ShipProperty) {
  const typedHullType = hull_type as HullType
  ban[typedHullType].push({
    hull_type: typedHullType,
    ship_name,
    property: {
      points: property.points,
      shipId: property.shipId,
    },
  })
}

function unban_ship(hull_type: string, ship_name: string) {
  const typedHullType = hull_type as HullType
  const index = ban[typedHullType].findIndex((ship) => ship.ship_name === ship_name)
  ban[typedHullType].splice(index, 1)
}

function not_pickable(hull_type: HullType, ship_name: string, property: ShipProperty) {
  if (total_points.value >= max_points) return true
  if (pick_list.value.length >= max_ships) return true
  if (hull_type === 'Flagship') return pick.Flagship.length > 0

  for (const ship of ban[hull_type]) {
    if (ship.ship_name === ship_name) return true
  }

  if (hull_type === 'Logistics') {
    return logi_count.value + (property.logisticsWeight ?? 0) > max_number.Logistics
  }

  return pick[hull_type].length + flagship_type.value[hull_type] >= max_number[hull_type]
}

function not_bannable(hull_type: HullType, ship_name: string) {
  for (const ship of pick[hull_type]) {
    if (hull_type === 'Flagship') continue
    if (ship.ship_name === ship_name) return true
  }

  for (const ship of ban[hull_type]) {
    if (ship.ship_name === ship_name) return true
  }

  return false
}

function clear_pick() {
  for (const ships of Object.values(pick)) ships.length = 0
}

function clear_ban() {
  for (const ships of Object.values(ban)) ships.length = 0
}

function toggle_theme() {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('app-dark', isDark.value)
  document.cookie = `theme=${isDark.value}`
}

function change_lang(lang: 'en' | 'zh') {
  i18n.locale.value = lang
  document.cookie = `lang=${lang}`
}

function hullCountLabel(hullType: HullType) {
  if (hullType === 'Logistics') return `${logi_count.value} / ${max_number.Logistics}`
  return `${pick[hullType].length + flagship_type.value[hullType]} / ${max_number[hullType]}`
}

function localizedShipName(property: { names: Record<'en' | 'zh', string> }) {
  return property.names[i18n.locale.value as 'en' | 'zh'] ?? property.names.en
}
</script>

<template>
  <div class="page-shell">
    <header class="page-header">
      <div class="page-title-spacer"></div>
      <div class="page-title">{{ $t('messages.title') }}</div>
      <div class="page-actions">
        <Button rounded text class="toolbar-button" @click="toggle_theme">
          <span :class="['pi', isDark ? 'pi-sun' : 'pi-moon']"></span>
        </Button>
        <Button outlined class="lang-button" @click="change_lang('zh')">简体中文</Button>
        <Button outlined class="lang-button" @click="change_lang('en')">English</Button>
      </div>
    </header>

    <a class="rules-link" :href="rule_link" target="_blank" rel="noreferrer">
      {{ $t('messages.rules') }} : ATXXI(2025)
    </a>

    <div
      class="points-summary"
      :class="{
        'points-summary--over': total_points > max_points,
        'points-summary--limit': total_points === max_points,
        'points-summary--safe': total_points < max_points,
      }"
    >
      {{ total_points }} / {{ max_points }}
    </div>

    <main class="draft-layout">
      <section class="selection-panel">
        <Tabs :value="tab" class="draft-tabs" @update:value="tab = $event as HullType">
          <div class="selection-layout">
            <TabList class="hull-tab-list">
              <Tab v-for="hull_type in hullTypes" :key="hull_type" :value="hull_type" class="hull-tab">
                <div class="hull-tab-content">
                  <img :src="`./hull/${hull_type}.png`" class="hull-icon" />
                  <span class="hull-tab-name">{{ $t(`types.${hull_type}`) }}</span>
                  <span class="hull-tab-count">{{ hullCountLabel(hull_type) }}</span>
                </div>
              </Tab>
            </TabList>

            <TabPanels class="ship-panel-list">
              <TabPanel v-for="(ships, hull_type) in data" :key="hull_type" :value="hull_type" class="ship-panel">
                <div class="ship-panel-scroll">
                  <Ship
                    v-for="(property, ship_name) in ships"
                    :key="ship_name"
                    :hull_type="hull_type"
                    :ship_name="ship_name"
                    :display_name="localizedShipName(property)"
                    :property="property"
                    :btns="['add', 'ban']"
                    :not_pickable="not_pickable(hull_type, ship_name, property)"
                    :not_bannable="not_bannable(hull_type, ship_name)"
                    @add_ship="add_ship"
                    @ban_ship="ban_ship"
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
              v-if="pick_list.length"
              class="summary-title-count"
              :class="{
                'summary-title-count--limit': pick_list.length >= max_ships,
                'summary-title-count--safe': pick_list.length < max_ships,
              }"
            >
              ({{ pick_list.length }} / {{ max_ships }})
            </span>
          </div>
          <Button
            v-if="pick_list.length"
            class="clear-button"
            severity="contrast"
            variant="outlined"
            @click="clear_pick"
          >
            <img src="/icons/remove.svg" alt="" class="button-icon-image" />
            <span>{{ $t('messages.clear') }}</span>
          </Button>
        </div>

        <div class="summary-list">
          <Ship
            v-for="ship in pick_list"
            :key="`${ship.hull_type}-${ship.ship_name}`"
            :hull_type="ship.hull_type"
            :ship_name="ship.ship_name"
            :display_name="localizedShipName(data[ship.hull_type][ship.ship_name])"
            :property="ship.property"
            :btns="['remove']"
            @remove_ship="remove_ship"
          />
        </div>
      </aside>
    </main>

    <section class="ban-section">
      <div class="summary-header">
        <div class="summary-title summary-title--ban">
          {{ $t('messages.ban') }}
          <a class="ban-rules-link" :href="ban_link" target="_blank" rel="noreferrer">
            ({{ $t('messages.rules') }})
          </a>
        </div>
        <Button
          v-if="ban_list.length"
          class="clear-button"
          severity="contrast"
          variant="outlined"
          @click="clear_ban"
        >
          <img src="/icons/remove.svg" alt="" class="button-icon-image" />
          <span>{{ $t('messages.clear') }}</span>
        </Button>
      </div>

      <div class="ban-list">
        <Ship
          v-for="ship in ban_list"
          :key="`${ship.hull_type}-${ship.ship_name}`"
          :hull_type="ship.hull_type"
          :ship_name="ship.ship_name"
          :display_name="localizedShipName(data[ship.hull_type][ship.ship_name])"
          :property="ship.property"
          :btns="['unban']"
          @unban_ship="unban_ship"
        />
      </div>
    </section>
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

.toolbar-button,
.lang-button,
.clear-button {
  gap: 0.45rem;
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

.selection-panel {
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

.summary-panel,
.ban-section {
  padding: 1rem;
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
  .page-header {
    grid-template-columns: 1fr;
  }

  .page-title-spacer {
    display: none;
  }

  .page-actions {
    justify-content: center;
  }

  .selection-layout {
    grid-template-columns: 1fr;
  }

  .hull-tab-name {
    display: none;
  }
}
</style>
