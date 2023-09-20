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

function not_pickable(hull_type, ship_name, property) {
  if (hull_type == "Flagship") return pick["Flagship"].length > 0;
  if (hull_type == "Logistics") {
    return logi_count.value >= max_number.Logistics || logi_count.value + property.logistics > max_number.Logistics;
  } 
    

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

  // 3 bans for each hull type
  // return ban[hull_type].length >= 3;
}

function clear_pick() {
  for(const [k, v] of Object.entries(pick)) {
    v.length = 0;
  }
}

function clear_ban() {
  for(const [k, v] of Object.entries(ban)) {
    v.length = 0;
  }
}

</script>

<template>
  <h2 class="text-bold">EVE AT Draft</h2>

  <!--Draft-->
  <div class="row">
    <div class="col-xs-12 col-sm-8 row no-wrap q-mb-lg">

      <div class="col-xs-3 col-sm-4">
        <q-tabs
          v-model="tab"
          vertical
          class="text-grey-10 text-weight-medium full-width"
          active-color="deep-orange-9"
        >
          <q-tab v-for="(ships, hull_type) in data"
          :name="hull_type" no-caps
          :ripple="false"
          class="q-my-xs"
          content-class="full-width"
          >
          <div class="row items-center no-wrap justify-between q-mx-xs tab-wrapper">
            <img :src="`hull/${hull_type}.png`" class="tab-icon" />
            <span class="gt-xs">{{ hull_type }}</span>
            <span v-if="hull_type=='Logistics'">{{ logi_count }} / {{ max_number.Logistics }}</span>
            <span v-else>{{ pick[hull_type].length }} / {{ max_number[hull_type] }}</span>
          </div>
          </q-tab>
        </q-tabs>
      </div>

      <div class="col-xs-9 col-sm-8">
        <q-tab-panels
          v-model="tab"
          animated
          swipeable
          vertical
          transition-prev="jump-right"
          transition-next="jump-right"
        >
          <q-tab-panel v-for="(ships, hull_type) in data"
          :name="hull_type"
          style="height: 460px;">
            <Ship v-for="(property, ship_name) in ships" 
            :hull_type = hull_type
            :ship_name = ship_name
            :property="property"
            :btns="['add', 'ban']"
            @add_ship="add_ship"
            :not_pickable="not_pickable(hull_type, ship_name, property)"
            @ban_ship="ban_ship"
            :not_bannable="not_bannable(hull_type, ship_name)"
        />
          </q-tab-panel>
        </q-tab-panels>
      </div>

    </div>

    <!--Pick-->
    <div class="col-xs-12 col-sm-4">
      <div class="row reverse items-center">
        <q-btn 
        @click="clear_pick"
        class="q-mx-sm"
        >Clear</q-btn>
        <div class="text-subtitle1 text-weight-bolder"
        :class="{ 'text-red-9': total_points > 100, 'text-green-9': total_points == 100 }">
          {{ total_points }} / 100
        </div>
      </div>
      <Ship v-for="ship in pick_list"
      :hull_type="ship.hull_type"
      :ship_name="ship.ship_name"
      :property="ship.property"
      :btns="['remove']"
      @remove_ship="remove_ship"
      />
    </div>
  </div>

  <!--Ban list-->
  <div v-if="ban_list.length">
  <!-- <div v-for="(ships, hull_type) in ban">
    <span v-if="ships.length">{{ ships.length }} / 3 {{ hull_type }} banned</span>
  </div> -->
    <q-btn 
    @click="clear_ban"
    class="q-mx-sm"
    >Clear</q-btn>
    <div class="row" justify-start>
      <Ship v-for="ship in ban_list"
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
  font-size: 16px;
  width: 100%;
}
.tab-icon {
  background-color: black;
  height: 28px;
  border-radius: 25%;
}
</style>
