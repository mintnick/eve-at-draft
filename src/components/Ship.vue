<script setup>
const props = defineProps(['ship_name', 'hull_type', 'points', 'ship_id']);
</script>

<template>
  <div class="row no-wrap items-center text-weight-medium q-mx-sm">
    <img :src="`https://images.evetech.net/types/${ship_id}/icon`" />
    <span class="ship-name q-ml-sm">{{ ship_name }}</span>
    <div v-if="points" class="ship-points q-ml-sm">{{ points }}</div>
  </div>
</template>

<style scoped>
img {
  height: 34px;
}

.ship-name {
  font-size: 16px;
}
</style>