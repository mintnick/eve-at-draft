<script setup>
import data from './assets/ships.json'
import Ship from './components/Ship.vue';
import { ref, reactive } from 'vue'
console.log(data)
// rules
const max_points = 100,
      max_ships = 10,
      max_hull_type = 4,
      max_flagship = 1,
      max_logistics = 1,
      max_ban_hull_type = 3;

// data
let pool = reactive([]),
    pick = reactive([]),
    ban = reactive([]);
let total_points = ref(0);


// functions
function add_ship(hull_type, ship_name, property) {
  console.log(hull_type, ship_name)
  pick.push({
    "ship_name": ship_name,
    "hull_type": hull_type,
    "points": parseInt(property.points)
  })
  // pick.sort((a, b) => (a.points > b.points) ? -1 : (b.points > a.points) ? 1 : 0)
  pick.sort((a, b) => (b.points - a.points));
}

function remove_ship(hull_type, ship_name, property) {

}

function ban_ship(hull_type, ship_name, property) {

}

</script>

<template>
  <h1>EVE AT Draft</h1>
  <h1>{{ total_points }}</h1>
  <!-- <span>{{ pick }}</span>
  <br />
  <span>{{ ban }}</span> -->

  <!-- Picks -->
  <div v-for="ship in pick">
    <span>{{ ship.ship_name }} {{ ship.points }}</span>
  </div>
  <!-- Bans -->
  <!-- Pool-->
  <div v-for="(ships, hull_type) in data">
    <h3>{{ hull_type }}</h3>
    <div v-for="(property, ship_name) in ships">
      <Ship
      :hull_type = hull_type
      :ship_name = ship_name
      :property= property
      />
      <button @click="add_ship(hull_type, ship_name, property)">ADD</button>
      <button @click="remove_ship(hull_type, ship_name, property)">REMOVE</button>
      <button @click="ban_ship(hull_type, ship_name, property)">BAN</button>
    </div>
  </div>
</template>

<style scoped>

</style>
