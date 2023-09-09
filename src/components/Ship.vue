<script setup>
const props = defineProps(['ship_name', 'hull_type', 'property']);

// const emit = defineEmits(['add_ship', 'remove_ship', 'ban_ship'])

const getImageUrl = (hull_type, ship_name) => {
  if (hull_type == "Flagship") {
    hull_type = "Battleship"
  }
  return new URL(`../assets/icons/Ship/${hull_type}/${ship_name}.jpeg`, import.meta.url).href
};

// const add_ship = () => {
//   emit('add_ship');
// };

// const remove_ship = (hull_type, ship_name) => {
//   emit('remove_ship');
// };

// const ban_ship = (hull_type, ship_name) => {
//   emit('ban_ship');
// };

</script>

<template>
    <img :src="getImageUrl(hull_type, ship_name)" />
    <span>{{ ship_name }}</span>
    <span>{{ property.points }}</span>
</template>