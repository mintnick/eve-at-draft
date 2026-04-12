import { describe, expect, it } from 'vitest'

import {
  createShipCatalog,
  createYearlyRules,
  mergeShipCatalogEntries,
  mergeSourceWithOverrides,
} from '../tools/data-pipeline/build'
import type { LocaleCode } from '../src/lib/types'
import type { RawTournamentOverrides, RawTournamentSource } from '../tools/data-pipeline/types'

function names(en: string, zhCN: string): Record<LocaleCode, string> {
  return {
    en,
    'zh-CN': zhCN,
    'zh-TW': zhCN,
    ru: en,
    de: en,
    ja: en,
    ko: en,
    fr: en,
    es: en,
  }
}

const baseSource: RawTournamentSource = {
  year: 2099,
  provider: 'test-provider',
  capturedAt: '2099-01-01T00:00:00.000Z',
  hulls: {
    Battleship: {
      Bhaalgorn: {
        shipId: 17920,
        points: 30,
        names: names('Bhaalgorn', '巴戈龙级'),
      },
    },
    Logistics: {
      Bantam: {
        shipId: 582,
        points: 4,
        logisticsWeight: 0.5,
        names: names('Bantam', '矮脚鸡级'),
      },
    },
    Cruiser: {
      Caracal: {
        shipId: 621,
        points: 12,
        names: names('Caracal', '狞獾级'),
      },
    },
  },
}

describe('data pipeline build helpers', () => {
  it('merges per-ship overrides without dropping untouched locale names', () => {
    const overrides: RawTournamentOverrides = {
      ships: {
        Bhaalgorn: {
          points: 31,
          names: {
            'zh-CN': '巴戈龙旗舰级',
            'zh-TW': '巴戈龙旗舰级',
          },
        },
        Bantam: {
          logisticsWeight: 1,
        },
      },
    }

    const merged = mergeSourceWithOverrides(baseSource, overrides)

    expect(merged.hulls.Battleship?.Bhaalgorn).toEqual({
      shipId: 17920,
      points: 31,
      names: {
        ...names('Bhaalgorn', '巴戈龙级'),
        'zh-CN': '巴戈龙旗舰级',
        'zh-TW': '巴戈龙旗舰级',
      },
    })
    expect(merged.hulls.Logistics?.Bantam).toEqual({
      shipId: 582,
      points: 4,
      logisticsWeight: 1,
      names: names('Bantam', '矮脚鸡级'),
    })
    expect(merged.hulls.Cruiser?.Caracal).toEqual(baseSource.hulls.Cruiser?.Caracal)
  })

  it('creates a ship catalog with one entry per ship key', () => {
    const catalog = createShipCatalog(baseSource)

    expect(catalog).toEqual({
      Bhaalgorn: {
        shipId: 17920,
        names: names('Bhaalgorn', '巴戈龙级'),
      },
      Bantam: {
        shipId: 582,
        names: names('Bantam', '矮脚鸡级'),
      },
      Caracal: {
        shipId: 621,
        names: names('Caracal', '狞獾级'),
      },
    })
  })

  it('keeps the first seen catalog entry when the same ship exists across multiple yearly sources', () => {
    const laterSource: RawTournamentSource = {
      ...baseSource,
      year: 2100,
      hulls: {
        Battleship: {
          Bhaalgorn: {
            shipId: 17920,
            points: 32,
            names: names('Bhaalgorn Alt', '巴戈龙级改'),
          },
        },
        Frigate: {
          Condor: {
            shipId: 583,
            points: 2,
            names: names('Condor', '秃鹫级'),
          },
        },
      },
    }

    const catalog = mergeShipCatalogEntries([baseSource, laterSource])

    expect(catalog.Bhaalgorn).toEqual({
      shipId: 17920,
      names: names('Bhaalgorn', '巴戈龙级'),
    })
    expect(catalog.Condor).toEqual({
      shipId: 583,
      names: names('Condor', '秃鹫级'),
    })
  })

  it('creates yearly tournament rules without carrying raw-only name data', () => {
    const merged = mergeSourceWithOverrides(baseSource, {
      ships: {
        Bhaalgorn: {
          points: 33,
        },
      },
    })

    const rules = createYearlyRules(merged)

    expect(rules.Battleship.Bhaalgorn).toEqual({
      shipId: 17920,
      points: 33,
    })
    expect(rules.Logistics.Bantam).toEqual({
      shipId: 582,
      points: 4,
      logisticsWeight: 0.5,
    })
    expect(rules.Cruiser.Caracal).toEqual({
      shipId: 621,
      points: 12,
      logisticsWeight: undefined,
    })
  })
})
