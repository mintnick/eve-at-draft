<script setup lang="ts">
import { computed } from 'vue'
import Button from 'primevue/button'

const props = defineProps<{
  shipName: string
  displayName: string
  hullType: string
  property: {
    points: number
    shipId: number
    originalPoints?: number
  }
  btns?: string[]
  notPickable?: boolean
  notBannable?: boolean
  pickReason?: string
  banReason?: string
}>()

const baseUrl = import.meta.env.BASE_URL

const emit = defineEmits<{
  addShip: [hullType: string, shipName: string, property: typeof props.property]
  banShip: [hullType: string, shipName: string, property: typeof props.property]
  removeShip: [hullType: string, shipName: string]
  unbanShip: [hullType: string, shipName: string]
}>()

const hasBtn = (btnName: string) => {
  return props.btns?.includes(btnName)
}

const extraPoints = computed(() => {
  return Boolean(props.property.originalPoints && props.property.points > props.property.originalPoints)
})
</script>

<template>
  <div class="ship-wrapper">
    <div class="ship-meta">
      <div class="ship-points-wrap">
        <img
          class="ship-icon"
          :src="`https://images.evetech.net/types/${property.shipId}/icon`"
          :alt="`${shipName} icon`"
        />
        <div
          v-if="property.points"
          class="ship-points"
          :class="[extraPoints ? 'ship-points--extra' : 'ship-points--base']"
        >
          {{ property.points }}
        </div>
      </div>

      <div class="ship-name">
        <img v-if="hullType === 'Flagship' && hasBtn('remove')" :src="`${baseUrl}hull/Flagship.png`" class="hull-icon hull-icon--small" />
        <span>{{ displayName }}</span>
      </div>
    </div>

    <div class="ship-actions">
      <Button
        v-if="hasBtn('add')"
        text
        :class="['ship-action ship-action--add', { 'ship-action--blocked': notPickable }]"
        :title="pickReason"
        :aria-label="pickReason || undefined"
        @click="emit('addShip', hullType, shipName, property)"
      >
        <span class="ship-action-icon ship-action-icon--add" aria-hidden="true"></span>
      </Button>

      <Button
        v-if="hasBtn('ban')"
        text
        :class="['ship-action ship-action--ban', { 'ship-action--blocked': notBannable }]"
        :title="banReason"
        :aria-label="banReason || undefined"
        @click="emit('banShip', hullType, shipName, property)"
      >
        <span class="ship-action-icon ship-action-icon--ban" aria-hidden="true"></span>
      </Button>

      <Button
        v-if="hasBtn('remove')"
        text
        class="ship-action ship-action--remove"
        @click="emit('removeShip', hullType, shipName)"
      >
        <span class="ship-action-icon ship-action-icon--remove" aria-hidden="true"></span>
      </Button>

      <Button
        v-if="hasBtn('unban')"
        text
        class="ship-action ship-action--remove"
        @click="emit('unbanShip', hullType, shipName)"
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
