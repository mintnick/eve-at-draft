<script setup>
import { ref, reactive, computed } from 'vue'
import data from './assets/ships.json'
import Ship from './components/Ship.vue';

// rules
const MAX_POINTS = 100,
      MAX_SHIPS = 10,
      MAX_HULL_TYPE = 4,
      MAX_FLAGSHIP = 1,
      MAX_LOGISTICS = 1,
      MAX_BAN_HULL_TYPE = 3;

// data
let pick = reactive([]),
    ban = reactive([]);
let total_points = ref(0);
let pick_count = reactive({
  "Flagship": 0,
  "Logistics": 0,
  "Battleship": 0,
  "Battlecruiser": 0,
  "Cruiser": 0,
  "Destroyer": 0,
  "Frigate": 0,
  "Industrial": 0,
  "Corvette": 0,
})
let ban_count = reactive({
  "Logistics": 0,
  "Battleship": 0,
  "Battlecruiser": 0,
  "Cruiser": 0,
  "Destroyer": 0,
  "Frigate": 0,
  "Industrial": 0,
  "Corvette": 0,
})
let msgs = new Set()

// check if pick/ban is valid
let invalid_pick = computed(() => {
  if (total_points.value > 100) msgs.add('>100 points!'); else msgs.delete('>100 points!');
  if (pick_count.Flagship > 1) msgs.add('1 Flagship!'); else msgs.delete('1 Flagship!');
  if (pick_count.Logistics > 1) msgs.add('1 Cruiser Logi or 2 Frigate Logi!'); else msgs.delete('1 Cruiser Logi or 2 Frigate Logi!');
  for (const [hull_type, count] of Object.entries(pick_count)) {
    if (hull_type in ['Flagship', 'Logistics']) continue;
    if (count > 4) msgs.add(`You have more than 4 ${hull_type} ships!`); else msgs.delete(`You have more than 4 ${hull_type} ships!`);
  }
  return msgs.size;
})

let invalid_ban = computed(() => {
  for (const [hull_type, count] of Object.entries(ban_count)) {
    if (count > 3) return true;
  }
  return false;
})

// functions
function add_ship(hull_type, ship_name, property) {
  // same ship + 1 point
  for (const ship of pick) {
    if (ship.ship_name == ship_name) {
      property.points += 1;
      break;
    }
  }
  for (const ship of pick) {
    if (ship.ship_name == ship_name) {
      ship.points += 1;
    }
  }

  // add to pick list
  pick.push({
    "ship_name": ship_name,
    "hull_type": hull_type,
    "points": property.points
  })
  pick.sort((a, b) => (b.points - a.points));

  // update globals
  total_points.value += property.points
  if (hull_type == "Logistics") pick_count[hull_type] += property.logistics;
  else pick_count[hull_type] += 1;
}

function remove_ship(hull_type, ship_name, property) {

}

function ban_ship(hull_type, ship_name, property) {

}

</script>

<template>
  <h1>EVE AT Draft</h1>
  <h1>{{ total_points }}</h1>

  <div v-if="invalid_pick">
    <p v-for="msg in msgs">{{ msg }}</p>
  </div>

  <div v-if="invalid_ban">
    <p>"Maximum 3 bans per each hull type!"</p>
  </div>

  <!-- Picks -->
  <h2>Pick</h2>
  <div v-for="ship in pick">
    <!-- <span>{{ ship.ship_name }} {{ ship.points }}</span> -->
    <Ship 
    :hull_type="ship.hull_type"
    :ship_name="ship.ship_name"
    :points="ship.points"
    />
    <button @click="remove_ship(hull_type, ship_name, property)">REMOVE</button>
  </div>
  
  <!-- Pool-->
  <h2>Pool</h2>
  <div v-for="(ships, hull_type) in data">
    <h3>{{ hull_type }}</h3>
    <div v-for="(property, ship_name) in ships">
      <Ship
      :hull_type = hull_type
      :ship_name = ship_name
      :points= property.points
      />
      <button @click="add_ship(hull_type, ship_name, property)">ADD</button>
      <button @click="ban_ship(hull_type, ship_name, property)">BAN</button>
    </div>
  </div>

  <!-- Bans -->
</template>

<style scoped>

</style>
