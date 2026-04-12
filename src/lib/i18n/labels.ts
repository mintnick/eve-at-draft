import type { LocaleCode, ShipCatalog } from '@/lib/types'

export function getShipDisplayName(shipCatalog: ShipCatalog, shipKey: string, locale: LocaleCode): string {
  const ship = shipCatalog[shipKey]
  if (!ship) {
    return shipKey
  }

  return ship.names[locale] ?? ship.names.en
}
