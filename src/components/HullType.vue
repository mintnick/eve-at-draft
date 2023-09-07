<script setup>
import Ship from './Ship.vue';

defineProps(['hull_type', 'ships']);

</script>

<template>
  <h2>{{ hull_type }}</h2>
  <li v-for="(property, ship_name) in ships">
    <Ship 
      :hull_type=hull_type
      :ship_name = ship_name
      :points = property.points
    />
  </li>
</template>