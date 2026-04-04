import type { DraftBuckets, DraftState, HullType } from '@/lib/types'

export function createEmptyDraftBuckets(hullTypes: HullType[]): DraftBuckets {
  return hullTypes.reduce((buckets, hullType) => {
    buckets[hullType] = []
    return buckets
  }, {} as DraftBuckets)
}

export function createEmptyDraftState(hullTypes: HullType[]): DraftState {
  return {
    picks: createEmptyDraftBuckets(hullTypes),
    bans: createEmptyDraftBuckets(hullTypes),
  }
}
