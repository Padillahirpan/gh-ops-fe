import { createDemoSeedData } from '@/data/mockData'
import { STORAGE_KEYS } from '@/constants/storageKeys'
import { hasItem } from '@/storage/localStorageAdapter'
import { useTandonStore } from '@/store/useTandonStore'
import { useHarvestStore } from '@/store/useHarvestStore'
import { useSaleStore } from '@/store/useSaleStore'

export function isDemoSeeded(): boolean {
  return hasItem(STORAGE_KEYS.demoSeededFlag)
}

function markSeeded(): void {
  try {
    window.localStorage.setItem(STORAGE_KEYS.demoSeededFlag, new Date().toISOString())
  } catch {
    console.warn('[seed] Failed to persist demo-seeded flag')
  }
}

export function seedDemoData(force: boolean = false): boolean {
  if (!force && isDemoSeeded()) return false

  const payload = createDemoSeedData()
  useTandonStore.getState().replaceAll(payload.tandons)
  useHarvestStore.getState().replaceAll(payload.harvests)
  useSaleStore.getState().replaceAll(payload.sales)
  markSeeded()
  return true
}

export function maybeAutoSeedDemoData(): void {
  if (import.meta.env.VITE_ENABLE_DEMO_SEED !== 'true') return
  const hasAnyData =
    hasItem(STORAGE_KEYS.tandons) ||
    hasItem(STORAGE_KEYS.harvests) ||
    hasItem(STORAGE_KEYS.sales)
  if (hasAnyData && !isDemoSeeded()) return
  if (isDemoSeeded()) return
  seedDemoData(false)
}
