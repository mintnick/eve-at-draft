<script setup>
const props = defineProps(['ship_name', 'hull_type', 'points']);

const getImageUrl = (hull_type, ship_name) => {
  if (hull_type == "Flagship") {
    hull_type = "Battleship"
  }
  return new URL(`../assets/icons/Ship/${hull_type}/${ship_name}.jpeg`, import.meta.url).href
};

</script>

<template>
    <img :src="getImageUrl(hull_type, ship_name)" />
    <span>{{ ship_name }}</span>
    <span>{{ points }}</span>
</template>