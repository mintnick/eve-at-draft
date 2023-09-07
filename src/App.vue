<script setup>
import data from './assets/ships.json'
import HullType from './components/HullType.vue';
</script>

<template>
  <h1>EVE AT Draft</h1>
  <HullType v-for="(ships, hull_type) in data" 
    :hull_type = hull_type
    :ships = ships
  />
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
