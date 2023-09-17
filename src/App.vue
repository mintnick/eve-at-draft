<script setup>
import { ref, reactive, computed } from 'vue'
import data from './assets/ships.json'
import Ship from './components/Ship.vue';

const max_number = {
  "Flagship": 1,
  "Logistics": 1,
  "Battleship": 4,
  "Battlecruiser": 4,
  "Cruiser": 4,
  "Destroyer": 4,
  "Frigate": 4,
  "Industrial": 4,
  "Corvette": 4
}

const pick = reactive({
    "Flagship": [],
    "Logistics": [],
    "Battleship": [],
    "Battlecruiser": [],
    "Cruiser": [],
    "Destroyer": [],
    "Frigate": [],
    "Industrial": [],
    "Corvette": []
  }),
    ban = reactive({
    "Flagship": [],
    "Logistics": [],
    "Battleship": [],
    "Battlecruiser": [],
    "Cruiser": [],
    "Destroyer": [],
    "Frigate": [],
    "Industrial": [],
    "Corvette": []
  });

const total_points = computed(() => {
  let points = 0;
  for (const [k, v] of Object.entries(pick)) {
    if (v.length == 0) continue;
    for (const ship of v) points += ship.property.points;
  }
  return points;
});

const logi_count = computed(() => {
  let total_logi = 0;
  for (const logi of pick.Logistics) total_logi += data.Logistics[logi.ship_name].logistics;
  return total_logi;
})

const pick_list = computed(() => {
  let list = [];
  for (const [_, ships] of Object.entries(pick)) for (const ship of ships) list.push(ship);
  list.sort((a, b) => (b.points - a.points));
  return list;
})

const ban_list = computed(() => {
  let list = [];
  for (const [_, ships] of Object.entries(ban)) for (const ship of ships) list.push(ship);
  list.sort((a, b) => (b.points - a.points));
  return list;
})

// view variables
let tab = ref('Flagship');
let splitterModel = ref(NaN);

// functions
function add_ship(hull_type, ship_name, property) {
  // same ship +1 point
  let points = property.points;
  for (const ship of pick[hull_type]) {
    if (ship.ship_name == ship_name) {
      ship.property.points += 1;
      points += 1;
    }
  }

  pick[hull_type].push({
    "hull_type": hull_type,
    "ship_name": ship_name,
    "property": {
      "points": points,
      "ship_id": property.ship_id
    }
  })
  console.log(logi_count.value)
}

function remove_ship(hull_type, ship_name) {
  let index = pick[hull_type].findIndex(x => x.ship_name == ship_name);
  pick[hull_type].splice(index, 1);

  // remove +1 points
  for (const ship of pick[hull_type]) if (ship.ship_name == ship_name) ship.property.points -= 1;
}

function ban_ship(hull_type, ship_name, property) {
  ban[hull_type].push({
    "hull_type": hull_type,
    "ship_name": ship_name,
    "property": {
      "points": property.points,
      "ship_id": property.ship_id,
    },
  })
}

function unban_ship(hull_type, ship_name) {
  let index = ban[hull_type].findIndex(x => x.ship_name == ship_name);
  ban[hull_type].splice(index, 1);
}

function not_pickable(hull_type, ship_name) {
  if (hull_type == "Flagship") return pick["Flagship"].length > 0;
  if (hull_type == "Logistics") return logi_count.value >= max_number.Logistics;

  // banned?
  for (const ship of ban[hull_type]) {
    if (ship.ship_name == ship_name) return true;
  }

  // points
  if (total_points.value >= 100) return true;

  return pick[hull_type].length >= max_number[hull_type];
}

function not_bannable(hull_type, ship_name) {
  // picked?
  for (const ship of pick[hull_type]) {
    if (hull_type == "Flagship") continue;
    if (ship.ship_name == ship_name) return true;
  }

  // already banned
  for (const ship of ban[hull_type]) {
    if (ship.ship_name == ship_name) return true;
  }

  return ban[hull_type].length >= 3;
}

function clear_pick() {
  for(const [k, v] of Object.entries(pick)) v = [];
}

function clear_ban() {
  for(const [k, v] of Object.entries(ban)) v = [];
}

</script>

<template>
  <h2 class="text-bold">EVE AT Draft</h2>

  <!--Draft-->
  <div class="row">
    <div class="col-xs-12 col-sm-8 no-wrap q-mb-lg">
      <q-splitter
      v-model="splitterModel"
      style="height:470px;"
      >
      <template v-slot:before>
        <q-tabs
          v-model="tab"
          vertical
          class="text-grey-10 text-weight-medium"
          active-color="teal"
        >
          <q-tab v-for="(ships, hull_type) in data"
          :name="hull_type" no-caps
          :ripple="false"
          class="q-my-xs"
          >
          <div class="row items-center no-wrap justify-between q-mx-xs tab-wrapper">
            <img :src="`hull/${hull_type}.png`" class="tab-icon" />
            <span>{{ hull_type }}</span>
            <span v-if="hull_type=='Logistics'">{{ logi_count }} / {{ max_number.Logistics }}</span>
            <span v-else>{{ pick[hull_type].length }} / {{ max_number[hull_type] }}</span>
          </div>
          </q-tab>
        </q-tabs>
      </template>

      <template v-slot:after>
        <q-tab-panels
          v-model="tab"
          animated
          swipeable
          vertical
          transition-prev="jump-right"
          transition-next="jump-right"
        >
          <q-tab-panel v-for="(ships, hull_type) in data"
          :name="hull_type">
            <div v-for="(property, ship_name) in ships" class="row no-wrap items-center q-py-xs justify-start">
              <Ship
              :hull_type = hull_type
              :ship_name = ship_name
              :property="property"
              :btns="['add', 'ban']"
              @add_ship="add_ship"
              :not_pickable="not_pickable(hull_type, ship_name)"
              @ban_ship="ban_ship"
              :not_bannable="not_bannable(hull_type, ship_name)"
              />
            </div>
          </q-tab-panel>
        </q-tab-panels>
      </template>
      </q-splitter>
    </div>
    <!--Pick-->
    <div class="col-xs-12 col-sm-4">
      PICK: {{ total_points }}
      <div v-for="ship in pick_list">
        <Ship
        :hull_type="ship.hull_type"
        :ship_name="ship.ship_name"
        :property="ship.property"
        :btns="['remove']"
        @remove_ship="remove_ship"
        />
      </div>
    </div>
  </div>

  <!--Ban list-->
  <div v-for="(ships, hull_type) in ban">
    <span v-if="ships.length">{{ ships.length }} / 3 {{ hull_type }} banned</span>
  </div>
  <div class="row" justify-start>
    <div v-for="ship in ban_list">
      <Ship
      :hull_type="ship.hull_type"
      :ship_name="ship.ship_name"
      :property="ship.property"
      :btns="['unban']"
      @unban_ship="unban_ship"
      />
    </div>
  </div>
  </template>

<style scoped>
.tab-wrapper {
  width: 180px;
  font-size: 16px;
}
.tab-icon {
  background-color: black;
  height: 28px;
  border-radius: 25%;
}
</style>
