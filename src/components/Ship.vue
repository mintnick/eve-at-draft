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

const baseUrl = import.meta.env.BASE_URL

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
        <img v-if="hull_type === 'Flagship' && has_btn('remove')" :src="`${baseUrl}hull/Flagship.png`" class="hull-icon hull-icon--small" />
        <span>{{ display_name }}</span>
      </div>
    </div>

    <div class="ship-actions">
      <Button
        v-if="has_btn('add')"
        text
        :class="['ship-action ship-action--add', { 'ship-action--blocked': not_pickable }]"
        :title="pick_reason"
        :aria-label="pick_reason || undefined"
        @click="emit('add_ship', hull_type, ship_name, property)"
      >
        <span class="ship-action-icon ship-action-icon--add" aria-hidden="true"></span>
      </Button>

      <Button
        v-if="has_btn('ban')"
        text
        :class="['ship-action ship-action--ban', { 'ship-action--blocked': not_bannable }]"
        :title="ban_reason"
        :aria-label="ban_reason || undefined"
        @click="emit('ban_ship', hull_type, ship_name, property)"
      >
        <span class="ship-action-icon ship-action-icon--ban" aria-hidden="true"></span>
      </Button>

      <Button
        v-if="has_btn('remove')"
        text
        class="ship-action ship-action--remove"
        @click="emit('remove_ship', hull_type, ship_name)"
      >
        <span class="ship-action-icon ship-action-icon--remove" aria-hidden="true"></span>
      </Button>

      <Button
        v-if="has_btn('unban')"
        text
        class="ship-action ship-action--remove"
        @click="emit('unban_ship', hull_type, ship_name)"
      >
        <span class="ship-action-icon ship-action-icon--remove" aria-hidden="true"></span>
      </Button>
    </div>
  </div>
</template>

<style scoped>
.ship-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.6rem;
  padding: 0.35rem 0.5rem;
  border: 1px solid var(--app-border);
  background: var(--app-panel);
  transition: background-color 80ms ease, border-color 80ms ease;
}

.ship-wrapper:hover {
  background-color: var(--app-panel-hover);
  border-color: var(--app-border-strong);
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
  text-align: center;
  font-family: var(--app-font-mono);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  background: var(--app-panel-strong);
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
  width: 2.4rem;
  height: 2.4rem;
  border: 1px solid var(--app-border-strong);
}

.ship-action--blocked {
  filter: grayscale(0.5);
  opacity: 0.55;
}

.ship-action-icon {
  display: block;
  width: 1.85rem;
  height: 1.85rem;
  background: currentColor;
  -webkit-mask-position: center;
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-size: contain;
  mask-position: center;
  mask-repeat: no-repeat;
  mask-size: contain;
}

.ship-action-icon--add {
  -webkit-mask-image: url('/icons/add.svg');
  -webkit-mask-size: 185%;
  mask-image: url('/icons/add.svg');
  mask-size: 185%;
}

.ship-action-icon--ban {
  -webkit-mask-image: url('/icons/ban.svg');
  -webkit-mask-size: 132%;
  mask-image: url('/icons/ban.svg');
  mask-size: 132%;
}

.ship-action-icon--remove {
  -webkit-mask-image: url('/icons/remove.svg');
  -webkit-mask-size: 185%;
  mask-image: url('/icons/remove.svg');
  mask-size: 185%;
}

.ship-action--add {
  background: var(--app-action-add-bg);
  color: var(--app-action-add-fg);
}

.ship-action--ban {
  background: var(--app-action-ban-bg);
  color: var(--app-action-ban-fg);
}

.ship-action--remove {
  background: var(--app-action-remove-bg);
  color: var(--app-action-remove-fg);
}

.ship-action:hover {
  filter: brightness(1.12);
}

@media (max-width: 600px) {
  .ship-wrapper {
    gap: 0.4rem;
    padding: 0.3rem 0.4rem;
  }

  .ship-meta {
    gap: 0.55rem;
  }

  .ship-name {
    font-size: 0.85rem;
  }

  .ship-icon {
    width: 28px;
    height: 28px;
  }

  .ship-action {
    width: 2rem;
    height: 2rem;
  }

  .ship-action-icon {
    width: 1.55rem;
    height: 1.55rem;
  }
}
</style>
