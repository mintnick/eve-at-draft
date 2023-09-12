<script setup>
import { ref, reactive, computed } from 'vue'
import data from './assets/ships.json'
import Ship from './components/Ship.vue';

// limit
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

// data
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
    for (const ship of v) {
      points += ship.points;
    }
  }
  return points;
});

const logi_count = computed(() => {
  let total_logi = 0;
  for (const logi of pick.Logistics) {
    total_logi += data.Logistics[logi.ship_name].logistics
  }
  return total_logi;
})

const pick_list = computed(() => {
  let list = [];
  for (const [hull_type, ships] of Object.entries(pick)) {
    for (const ship of ships) list.push(ship);
  }
  list.sort((a, b) => (b.points - a.points));
  return list;
})

const ban_list = computed(() => {
  let list = [];
  for (const [hull_type, ships] of Object.entries(ban)) {
    for (const ship of ships) list.push(ship);
  }
  list.sort((a, b) => (b.points - a.points));
  return list;
})

// functions
function add_ship(hull_type, ship_name, property) {
  // same ship +1 point
  let points = property.points;
  for (const ship of pick[hull_type]) {
    if (ship.ship_name == ship_name) {
      ship.points += 1;
      points += 1;
    }
  }

  // add to pick list
  pick[hull_type].push({
    "hull_type": hull_type,
    "ship_name": ship_name,
    "points": points
  })
}

function remove_ship(hull_type, ship_name, property) {
  let index = pick[hull_type].findIndex(x => x.ship_name == ship_name);
  pick[hull_type].splice(index, 1);

  // remove +1 points
  for (const ship of pick[hull_type]) {
    if (ship.ship_name == ship_name) ship.points -= 1;
  }
}

function ban_ship(hull_type, ship_name, property) {
  ban[hull_type].push({
    "hull_type": hull_type,
    "ship_name": ship_name,
    "points": property.points,
  })
}

function unban_ship(hull_type, ship_name, property) {
  let index = ban[hull_type].findIndex(x => x.ship_name == ship_name);
  ban[hull_type].splice(index, 1);
}

function not_addable(hull_type, ship_name) {
  if (hull_type == "Flagship" && pick["Flagship"].length < 1) return false;

  // banned?
  for (const ship of ban[hull_type]) {
    if (ship.ship_name == ship_name) return true;
  }

  // points
  if (total_points.value > 100) return true;

  // hull type
  if (hull_type == "Logistics") return logi_count.value >= max_number.Logistics;
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

</script>

<template>
  <h1>EVE AT Draft</h1>
  <h1>{{ total_points }}</h1>


  <!-- Picks -->
  <h2>Pick</h2>
  <div v-for="ship in pick_list">
      <Ship
      :hull_type="ship.hull_type"
      :ship_name="ship.ship_name"
      :points="ship.points"
      />
      <button @click="remove_ship(ship.hull_type, ship.ship_name, ship.property)">REMOVE</button>
  </div>

  <!-- Bans -->
  <h2>Ban</h2>
  <div v-for="ship in ban_list">
      <Ship
      :hull_type="ship.hull_type"
      :ship_name="ship.ship_name"
      :points="ship.points"
      />
      <button @click="unban_ship(ship.hull_type, ship.ship_name, ship.property)">REMOVE</button>
  </div>
  
  <!-- Pool-->
  <h2>Pool</h2>
  <div v-for="(ships, hull_type) in data">
    <h3>{{ hull_type }}</h3>
    <span v-if="hull_type=='Logistics'">{{ logi_count }} / {{ max_number.Logistics }}</span>
    <span v-else>{{ pick[hull_type].length }} / {{ max_number[hull_type] }}</span>
    <div v-for="(property, ship_name) in ships">
      <Ship
      :hull_type = hull_type
      :ship_name = ship_name
      :points= property.points
      />
      <button @click="add_ship(hull_type, ship_name, property)" :disabled="not_addable(hull_type, ship_name)">ADD</button>
      <button v-if="hull_type != `Flagship`" @click="ban_ship(hull_type, ship_name, property)" :disabled="not_bannable(hull_type, ship_name)">BAN</button>
    </div>
  </div>
</template>

<style scoped>

</style>
