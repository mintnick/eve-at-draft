<script setup>
const props = defineProps(['ship_name', 'hull_type', 'points']);

const emit = defineEmits(['onChange'])

const getImageUrl = (hull_type, ship_name) => {
  return new URL(`../assets/icons/Ship/${hull_type}/${ship_name}.jpeg`, import.meta.url).href
};

</script>

<template>
    <img :src="getImageUrl(hull_type, ship_name)" />
    <span>{{ ship_name }}</span>
    <span>{{ points }}</span>
</template>