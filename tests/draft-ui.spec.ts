import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'

import AppShell from '@/app/AppShell.vue'
import DraftScreen from '@/features/draft/components/DraftScreen.vue'
import { createAppI18n } from '@/lib/i18n'
import shipCatalogData from '../data/generated/ship-catalog.json'
import tournamentData from '../data/generated/2025.json'
import type { ShipCatalog, TournamentDataset } from '@/lib/types'

const dataset = tournamentData as TournamentDataset
const shipCatalog = shipCatalogData as ShipCatalog

function mountWithApp(component: unknown, options: Record<string, unknown> = {}) {
  return mount(component as never, {
    attachTo: document.body,
    global: {
      stubs: {
        teleport: true,
      },
      plugins: [
        createAppI18n(),
        [
          PrimeVue,
          {
            theme: {
              preset: Aura,
              options: {
                darkModeSelector: '.app-dark',
              },
            },
          },
        ],
      ],
    },
    ...options,
  })
}

describe('draft UI', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    document.cookie = 'lang=en'
    document.cookie = 'theme=false'
    document.documentElement.classList.remove('app-dark')
  })

  it('supports a legal drafting flow in the draft screen', async () => {
    const wrapper = mountWithApp(DraftScreen, {
      props: {
        dataset,
        shipCatalog,
      },
    })

    const shipRows = wrapper.findAllComponents({ name: 'Ship' })
    const bhaalgorn = shipRows.find((row) => row.props('ship_name') === 'Bhaalgorn' && row.props('hull_type') === 'Flagship')

    expect(bhaalgorn).toBeDefined()

    await bhaalgorn!.vm.$emit('add_ship', 'Flagship', 'Bhaalgorn', { points: 50, shipId: 17920, original_points: 50 })
    await nextTick()

    expect(wrapper.text()).toContain('50')
    expect(wrapper.text()).toContain('Bhaalgorn')
    expect(wrapper.text()).toContain('(1 / 10)')
  })

  it('shows illegal action feedback when a second flagship is added', async () => {
    const wrapper = mountWithApp(DraftScreen, {
      props: {
        dataset,
        shipCatalog,
      },
    })

    const shipRows = wrapper.findAllComponents({ name: 'Ship' })
    const bhaalgorn = shipRows.find((row) => row.props('ship_name') === 'Bhaalgorn' && row.props('hull_type') === 'Flagship')
    const rattlesnake = shipRows.find((row) => row.props('ship_name') === 'Rattlesnake' && row.props('hull_type') === 'Flagship')

    await bhaalgorn!.vm.$emit('add_ship', 'Flagship', 'Bhaalgorn', { points: 50, shipId: 17920, original_points: 50 })
    await nextTick()
    await rattlesnake!.vm.$emit('add_ship', 'Flagship', 'Rattlesnake', { points: 50, shipId: 17918, original_points: 50 })
    await nextTick()

    expect(wrapper.text()).toContain('Only one flagship can be picked.')
  })

  it('exports the draft to clipboard from the app shell', async () => {
    const clipboardWriteText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: clipboardWriteText,
      },
    })

    const wrapper = mountWithApp(AppShell)
    const draftScreen = wrapper.findComponent(DraftScreen)
    const shipRows = draftScreen.findAllComponents({ name: 'Ship' })
    const bhaalgorn = shipRows.find((row) => row.props('ship_name') === 'Bhaalgorn' && row.props('hull_type') === 'Flagship')

    await bhaalgorn!.vm.$emit('add_ship', 'Flagship', 'Bhaalgorn', { points: 50, shipId: 17920, original_points: 50 })
    await nextTick()

    const exportButton = wrapper
      .findAll('button')
      .find((button) => button.text().includes('Export'))

    expect(exportButton).toBeDefined()

    await exportButton!.trigger('click')

    expect(clipboardWriteText).toHaveBeenCalledWith(
      ['EVE-AT-DRAFT v1', 'YEAR: 2025', 'PICKS:', '- Flagship: Bhaalgorn', 'BANS:'].join('\n'),
    )
    expect(wrapper.text()).toContain('Draft copied to clipboard.')
  })

  it('imports a valid draft payload through the app shell dialog', async () => {
    const wrapper = mountWithApp(AppShell)
    const importButton = wrapper
      .findAll('button')
      .find((button) => button.text().includes('Import'))

    expect(importButton).toBeDefined()

    await importButton!.trigger('click')
    await nextTick()

    const textarea = wrapper.find('textarea')
    expect(textarea.exists()).toBe(true)
    await textarea.setValue(['EVE-AT-DRAFT v1', 'YEAR: 2025', 'PICKS:', '- Flagship: Bhaalgorn', 'BANS:'].join('\n'))

    const applyButton = wrapper
      .findAll('button')
      .find((button) => button.text().includes('Apply Import'))

    expect(applyButton).toBeDefined()

    await applyButton!.trigger('click')
    await nextTick()

    expect(wrapper.text()).toContain('Draft imported successfully.')
    expect(wrapper.text()).toContain('Bhaalgorn')
  })
})
