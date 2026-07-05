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
  padding: 7px 9px 7px 7px;
  border: 0;
  background: #11161c;
  box-shadow: var(--app-inner-shadow);
  transition: background 0.14s ease, box-shadow 0.14s ease;
  clip-path: polygon(9px 0, 100% 0, 100% calc(100% - 9px), calc(100% - 9px) 100%, 0 100%, 0 9px);
}

.ship-wrapper:hover {
  background: #161d25;
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
  gap: 9px;
}

.ship-icon {
  width: 34px;
  height: 34px;
}

.ship-points {
  min-width: 28px;
  text-align: center;
  font-family: var(--app-font-mono);
  font-size: 17px;
  font-weight: 500;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.ship-points--extra {
  color: var(--app-warning);
}

.ship-points--base {
  color: #3ef0bf;
}

.ship-name {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  min-width: 0;
  text-align: left;
  color: #dfe7ec;
  font-family: var(--app-font-family);
  font-size: 16px;
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
  gap: 6px;
  flex: 0 0 auto;
}

.ship-action {
  width: 34px;
  height: 34px;
  border: 0;
  clip-path: polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px);
}

.ship-action--blocked {
  filter: grayscale(0.5);
  opacity: 0.55;
}

.ship-action-icon {
  display: block;
  width: 24px;
  height: 24px;
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
  clip-path: polygon(5px 0, 100% 0, 100% calc(100% - 5px), calc(100% - 5px) 100%, 0 100%, 0 5px);
}

.ship-action:hover {
  filter: brightness(1.12);
}

@media (max-width: 600px) {
  .ship-wrapper {
    gap: 0.4rem;
    padding: 6px 7px;
  }

  .ship-meta {
    gap: 0.55rem;
  }

  .ship-name {
    font-size: 0.95rem;
  }

  .ship-icon {
    width: 28px;
    height: 28px;
  }

  .ship-action {
    width: 30px;
    height: 30px;
  }

  .ship-action-icon {
    width: 21px;
    height: 21px;
  }
}
</style>
