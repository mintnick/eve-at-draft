<script setup>
const props = defineProps(['ship_name', 'hull_type', 'property', 'btns', 'not_pickable', 'not_bannable']);
const emit = defineEmits(['add_ship', 'ban_ship', 'remove_ship', 'unban_ship']);

const has_btn = (btn_name) => {
  return props['btns'] && props['btns'].includes(btn_name)
}

</script>

<template>
  <div class="ship-wrapper row no-wrap justify-between items-center text-weight-medium q-ma-xs">
    <div class="row no-wrap items-center">
      <img :src="`https://images.evetech.net/types/${property.ship_id}/icon`" />
      <div v-if="property.points" class="ship-points q-ml-md text-orange-7 text-weight-bolder text-body1">
        {{ property.points }}</div>
    </div>

    <span class="text-h6">
      {{ ship_name }}</span>

    <div class="q-gutter-sm">
      <q-btn unelevated round icon="add" size="sm" color="green-8"
      v-if="has_btn('add')"
      :disabled="not_pickable"
      @click="emit('add_ship', hull_type, ship_name, property)"></q-btn>
      
      <q-btn unelevated round icon="not_interested" size="sm" color="red-8"
      v-if="hull_type != `Flagship` && has_btn('ban')"
      :disabled="not_bannable"
      @click="emit('ban_ship', hull_type, ship_name, property)"></q-btn>
      
      <q-btn unelevated round icon="clear" size="sm" color="lime-8"
      v-if="has_btn('remove')"
      @click="emit('remove_ship', hull_type, ship_name)"></q-btn>
      
      <q-btn unelevated round icon="clear" size="sm" color="lime-8"
      v-if="has_btn('unban')"
      @click="emit('unban_ship', hull_type, ship_name)"></q-btn>
    </div>
  </div>
</template>

<style scoped>
.ship-wrapper img {
  height: 34px;
  width: 34px;
}

.ship-wrapper:hover{
  background-color: #e9ebf5;
}
</style>