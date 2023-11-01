<script setup>
import { computed } from 'vue'
const props = defineProps(['ship_name', 'hull_type', 'property', 'btns', 'not_pickable', 'not_bannable']);
const emit = defineEmits(['add_ship', 'ban_ship', 'remove_ship', 'unban_ship']);

const has_btn = (btn_name) => {
  return props['btns'] && props['btns'].includes(btn_name);
}

const extra_points = computed(() => {
  return props['property']['original_points'] && props['property']['points'] > props['property']['original_points'];
});
</script>

<template>
  <div class="ship-wrapper row no-wrap justify-between items-center text-weight-medium q-my-xs q-mx-sm">
    <div class="row no-wrap items-center">
      <img class="gt-xs" :src="`https://images.evetech.net/types/${property.ship_id}/icon`" :alt="`${ship_name} icon`"/>
      <div v-if="property.points" class="ship-points text-subtitle1 text-weight-bold text-center q-ml-xs"
      :class="[extra_points ? 'text-red-9' : 'text-green-9']">
        {{ property.points }}</div>
    </div>

    <div class="row ship-name q-mx-xs items-center">
      <img v-if="hull_type == 'Flagship' && has_btn('remove')" src="/hull/Flagship.png" class="hull-icon q-mr-xs" />
      <span>{{ ship_name }}</span>
    </div>

    <div class="q-gutter-sm">
      <q-btn unelevated round icon="img:./icons/add.svg" size="sm" color="green-8"
      v-if="has_btn('add')"
      :disabled="not_pickable"
      @click="emit('add_ship', hull_type, ship_name, property)"></q-btn>
      
      <q-btn unelevated round icon="img:./icons/ban.svg" size="sm" color="red-8"
      v-if="hull_type != `Flagship` && has_btn('ban')"
      :disabled="not_bannable"
      @click="emit('ban_ship', hull_type, ship_name, property)"></q-btn>
      
      <q-btn unelevated round icon="img:./icons/remove.svg" size="sm" color="lime-8"
      v-if="has_btn('remove')"
      @click="emit('remove_ship', hull_type, ship_name)"></q-btn>
      
      <q-btn unelevated round icon="img:./icons/remove.svg" size="sm" color="lime-8"
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

.ship-wrapper {
  border-radius: 5%;
}
.ship-wrapper:hover{
  background-color: #a4a4a4;
  
}

.ship-wrapper .ship-points {
  width: 32px;
  border-style: solid;
  border-radius: 15%;
}

@media only screen and (max-width: 600px) {
  .ship-name {
    font-size: 2.8vw;
  }
}

button:disabled,
button[disabled] {
  opacity: 0.4 !important;
}
</style>