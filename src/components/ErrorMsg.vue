<script setup>
const props = defineProps(['points', 'pick_limit', 'ban_limit']);

</script>

<template>
  <h1 v-if="pick_limit">PICK Error!</h1>
  <h1 v-if="ban_limit">BAN Error!</h1>
</template>