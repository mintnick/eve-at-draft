<script setup>
import data from './assets/ships.json'
import Ship from './components/Ship.vue';
import { ref, reactive } from 'vue'
console.log(data)
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
  total_points.value += property.points

  pick.sort((a, b) => (b.points - a.points));

  // update limit list
}

function remove_ship(hull_type, ship_name, property) {

}

function ban_ship(hull_type, ship_name, property) {

}

</script>

<template>
  <h1>EVE AT Draft</h1>
  <h1>{{ total_points }}</h1>

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
      <!-- <button @click="remove_ship(hull_type, ship_name, property)">REMOVE</button> -->
      <button @click="ban_ship(hull_type, ship_name, property)">BAN</button>
    </div>
  </div>

  <!-- Bans -->
</template>

<style scoped>

</style>
