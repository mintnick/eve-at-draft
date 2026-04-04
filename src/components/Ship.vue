<script setup lang="ts">
import { computed } from 'vue'
import Button from 'primevue/button'

const props = defineProps<{
  ship_name: string
  display_name: string
  hull_type: string
  property: {
    points: number
    shipId: number
    original_points?: number
  }
  btns?: string[]
  not_pickable?: boolean
  not_bannable?: boolean
  pick_reason?: string
  ban_reason?: string
}>()

const emit = defineEmits<{
  add_ship: [hull_type: string, ship_name: string, property: typeof props.property]
  ban_ship: [hull_type: string, ship_name: string, property: typeof props.property]
  remove_ship: [hull_type: string, ship_name: string]
  unban_ship: [hull_type: string, ship_name: string]
}>()

const has_btn = (btn_name: string) => {
  return props.btns?.includes(btn_name)
}

const extra_points = computed(() => {
  return Boolean(props.property.original_points && props.property.points > props.property.original_points)
})
</script>

<template>
  <div class="ship-wrapper">
    <div class="ship-meta">
      <div class="ship-points-wrap">
        <img
          class="ship-icon"
          :src="`https://images.evetech.net/types/${property.shipId}/icon`"
          :alt="`${ship_name} icon`"
        />
        <div
          v-if="property.points"
          class="ship-points"
          :class="[extra_points ? 'ship-points--extra' : 'ship-points--base']"
        >
          {{ property.points }}
        </div>
      </div>

      <div class="ship-name">
        <img v-if="hull_type === 'Flagship' && has_btn('remove')" src="/hull/Flagship.png" class="hull-icon hull-icon--small" />
        <span>{{ display_name }}</span>
      </div>
    </div>

    <div class="ship-actions">
      <Button
        v-if="has_btn('add')"
        rounded
        text
        :class="['ship-action ship-action--add', { 'ship-action--blocked': not_pickable }]"
        :title="pick_reason"
        :aria-label="pick_reason || undefined"
        @click="emit('add_ship', hull_type, ship_name, property)"
      >
        <img src="/icons/add.svg" alt="" class="ship-action-icon" />
      </Button>

      <Button
        v-if="hull_type !== 'Flagship' && has_btn('ban')"
        rounded
        text
        :class="['ship-action ship-action--ban', { 'ship-action--blocked': not_bannable }]"
        :title="ban_reason"
        :aria-label="ban_reason || undefined"
        @click="emit('ban_ship', hull_type, ship_name, property)"
      >
        <img src="/icons/ban.svg" alt="" class="ship-action-icon" />
      </Button>

      <Button
        v-if="has_btn('remove')"
        rounded
        text
        class="ship-action ship-action--remove"
        @click="emit('remove_ship', hull_type, ship_name)"
      >
        <img src="/icons/remove.svg" alt="" class="ship-action-icon" />
      </Button>

      <Button
        v-if="has_btn('unban')"
        rounded
        text
        class="ship-action ship-action--remove"
        @click="emit('unban_ship', hull_type, ship_name)"
      >
        <img src="/icons/remove.svg" alt="" class="ship-action-icon" />
      </Button>
    </div>
  </div>
</template>

<style scoped>
.ship-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.5rem 0.65rem;
  border-radius: 0.9rem;
  border: 1px solid transparent;
  background: rgba(255, 255, 255, 0.12);
  transition:
    background-color 160ms ease,
    border-color 160ms ease,
    transform 160ms ease;
}

.ship-wrapper:hover {
  background-color: rgba(148, 163, 184, 0.18);
  border-color: var(--app-border);
  transform: translateY(-1px);
}

.ship-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
}

.ship-points-wrap {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.ship-icon {
  width: 34px;
  height: 34px;
}

.ship-points {
  width: 32px;
  border: 1px solid currentColor;
  border-radius: 0.55rem;
  text-align: center;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.16);
}

.ship-points--extra {
  color: var(--app-danger);
}

.ship-points--base {
  color: var(--app-success);
}

.ship-name {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  min-width: 0;
  text-align: left;
  font-weight: 600;
}

.ship-name span {
  overflow: hidden;
  text-overflow: ellipsis;
}

.hull-icon--small {
  width: 20px;
  height: 20px;
  flex: 0 0 auto;
}

.ship-actions {
  display: flex;
  gap: 0.25rem;
  flex: 0 0 auto;
}

.ship-action {
  width: 2rem;
  height: 2rem;
}

.ship-action--blocked {
  opacity: 0.45;
}

.ship-action-icon {
  width: 0.95rem;
  height: 0.95rem;
}

.ship-action--add {
  color: var(--app-success);
}

.ship-action--ban {
  color: var(--app-danger);
}

.ship-action--remove {
  color: var(--app-accent);
}

@media (max-width: 600px) {
  .ship-name {
    font-size: 0.85rem;
  }
}
</style>
