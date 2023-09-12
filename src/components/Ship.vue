<script setup>
const props = defineProps(['ship_name', 'hull_type', 'points', 'ship_id']);
</script>

<template>
    <img :src="`https://images.evetech.net/types/${ship_id}/icon`" />
    <span>{{ ship_name }}</span>
    <span>{{ points }}</span>
</template>

<style scoped>
img {
  width: 32px;
  height: 32px;
}
</style>