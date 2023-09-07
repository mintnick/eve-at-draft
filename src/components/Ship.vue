<script setup>
defineProps(['hull_type', 'ship_name', 'points']);

const getImageUrl = (hull_type, ship_name) => {
  return new URL(`../assets/icons/Ship/${hull_type}/${ship_name}.jpeg`, import.meta.url).href
};

</script>

<template>
  <img :src="getImageUrl(hull_type, ship_name)" />
  <span>{{ ship_name + ' ' + points }}</span>
</template>