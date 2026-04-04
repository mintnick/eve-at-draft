<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import Button from 'primevue/button'

import tournament from '../../data/generated/2025.json'
import shipCatalogData from '../../data/generated/ship-catalog.json'
import DraftScreen from '@/features/draft/components/DraftScreen.vue'
import type { ShipCatalog, TournamentDataset } from '@/lib/types'

const currentTournament = tournament as TournamentDataset
const shipCatalog = shipCatalogData as ShipCatalog

const { locale } = useI18n()

const isDark = ref(document.documentElement.classList.contains('app-dark'))

function toggleTheme() {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('app-dark', isDark.value)
  document.cookie = `theme=${isDark.value}`
}

function changeLang(nextLocale: 'en' | 'zh') {
  locale.value = nextLocale
  document.cookie = `lang=${nextLocale}`
}
</script>

<template>
  <div class="page-shell">
    <header class="page-header">
      <div class="page-title-spacer"></div>
      <div class="page-title">{{ $t('messages.title') }}</div>
      <div class="page-actions">
        <Button rounded text class="toolbar-button" @click="toggleTheme">
          <span :class="['pi', isDark ? 'pi-sun' : 'pi-moon']"></span>
        </Button>
        <Button outlined class="lang-button" @click="changeLang('zh')">简体中文</Button>
        <Button outlined class="lang-button" @click="changeLang('en')">English</Button>
      </div>
    </header>

    <DraftScreen :dataset="currentTournament" :ship-catalog="shipCatalog" />
  </div>
</template>

<style scoped>
.page-shell {
  display: grid;
  gap: 1rem;
  padding-top: 1.5rem;
}

.page-header {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 1rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 800;
  text-align: center;
}

.page-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
}

.toolbar-button,
.lang-button {
  gap: 0.45rem;
}

@media (max-width: 720px) {
  .page-header {
    grid-template-columns: 1fr;
  }

  .page-title-spacer {
    display: none;
  }

  .page-actions {
    justify-content: center;
  }
}
</style>
