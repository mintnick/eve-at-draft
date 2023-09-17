<script setup>
const props = defineProps(['ship_name', 'hull_type', 'property', 'btns', 'not_pickable', 'not_bannable']);
const emit = defineEmits(['add_ship', 'ban_ship', 'remove_ship', 'unban_ship']);

const has_btn = (btn_name) => {
  return props['btns'] && props['btns'].includes(btn_name)
}

</script>

<template>
  <div class="row no-wrap items-center text-weight-medium q-mx-sm">
    <img :src="`https://images.evetech.net/types/${property.ship_id}/icon`" />
    <span class="ship-name q-ml-sm">{{ ship_name }}</span>
    <div v-if="property.points" class="ship-points q-ml-sm">{{ property.points }}</div>

    <button v-if="has_btn('add')"
    :disabled="not_pickable"
    @click="emit('add_ship', hull_type, ship_name, property)">ADD</button>

    <button v-if="hull_type != `Flagship` && has_btn('ban')"
    :disabled="not_bannable"
    @click="emit('ban_ship', hull_type, ship_name, property)">BAN</button>

    <button v-if="has_btn('remove')"
    @click="emit('remove_ship', hull_type, ship_name)">REMOVE</button>

    <button v-if="has_btn('unban')"
    @click="emit('unban_ship', hull_type, ship_name)">UNBAN</button>
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