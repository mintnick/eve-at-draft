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
let pick = reactive({
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
let total_points = ref(0);

// functions
function add_ship(hull_type, ship_name, property) {
  // same ship +1 point
  let duplicate = false, points = property.points;
  for (const ship of pick[hull_type]) {
    console.log(ship, ship_name)
    if (ship.ship_name == ship_name) {
      duplicate = true;
      ship.points += 1;
      points += 1;
    }
  }

  // add to pick list
  pick[hull_type].push({
    "ship_name": ship_name,
    "points": points
  })
  pick[hull_type].sort((a, b) => (b.points - a.points));

  // update globals
  total_points.value += property.points
}

function remove_ship(hull_type, ship_name, property) {
}

function ban_ship(hull_type, ship_name, property) {

}

function unban_ship(hull_type, ship_name, property) {

}

</script>

<template>
  <h1>EVE AT Draft</h1>
  <h1>{{ total_points }}</h1>


  <!-- Picks -->
  <h2>Pick</h2>
  <div v-for="(ships, hull_type) in pick">
    <div v-if="ships.length" v-for="ship in ships">
      <Ship
      :hull_type="hull_type"
      :ship_name="ship.ship_name"
      :points="ship.points"
      />
      <button @click="remove_ship(hull_type, ship.ship_name, ship.property)">REMOVE</button>
    </div>
  </div>

  <!-- Bans -->
  
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
</template>

<style scoped>

</style>
