<script setup>
import Ship from './Ship.vue';

const props = defineProps(['hull_type', 'ships']);

const emit = defineEmits(['onChange'])

const change = (ship_name, hull_type, property) => {
  const obj = {
    "ship_name": ship_name,
    "hull_type": hull_type,
    "property": property
  }
  console.log(obj)
  emit('onChange', obj)
};

</script>

<template>
  <h2>{{ hull_type }}</h2>
  <button 
  v-for="(property, ship_name) in ships"
  class="" @click.prevent="change(ship_name, hull_type, property)">
    <Ship 
    :ship_name = ship_name
    :hull_type = hull_type
    :points = property.points
    />
  </button>
</template>

<style scoped>
</style>