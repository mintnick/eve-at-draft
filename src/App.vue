<script setup>
import data from './assets/ships.json'
import HullType from './components/HullType.vue';
import { ref, reactive } from 'vue'

// rules
const max_points = 100,
      max_ships = 10,
      max_hull_type = 4,
      max_flagship = 1,
      max_logistics = 1,
      max_ban_hull_type = 3;

// data
let pool = reactive({}),
    pick = reactive({}),
    ban = reactive({});
let total_points = ref(0);

function change(obj) {
  console.log(obj)
  total_points.value += parseInt(obj.property.points);
  pick[obj.ship_name] = obj.property
}

</script>

<template>
  <h1>EVE AT Draft</h1>
  <h1>{{ total_points }}</h1>
  <span>{{ pick }}</span>
  <HullType v-for="(ships, hull_type) in data" 
    :hull_type = hull_type
    :ships = ships
    @onChange = "change"
  />
</template>

<style scoped>

</style>
