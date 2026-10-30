import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { HarvestEntry, HarvestRejectionBreakdown } from '@/types/harvest'
import type { TandonId } from '@/types/tandon'
import { STORAGE_KEYS } from '@/constants/storageKeys'
import { USE_API } from '@/api/client'
import { seladaApi } from '@/api/seladaOpsApi'
import {
  calculateAvgWeightG,
  calculateSuccessRate,
} from '@/lib/harvestCalculations'
import { useTandonStore } from './useTandonStore'
import { useSaleStore } from './useSaleStore'
import { appPersistStorage } from './persistStorage'

export interface HarvestDraft {
  tandonId: TandonId
  date: string
  totalWeightKg: number
  totalPlants: number
  rejected: number
  reasons: HarvestRejectionBreakdown
  notes: string | null
}

interface HarvestState {
  harvests: HarvestEntry[]
  addHarvest: (draft: HarvestDraft) => Promise<HarvestEntry>
  updateHarvest: (id: string, patch: Partial<HarvestDraft>) => Promise<void>
  deleteHarvest: (id: string) => Promise<void>
  getHarvestsByTandon: (tandonId: TandonId) => HarvestEntry[]
  replaceAll: (harvests: HarvestEntry[]) => void
}

function generateId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `h-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function buildEntry(draft: HarvestDraft, existing?: HarvestEntry): HarvestEntry {
  return {
    id: existing?.id ?? generateId(),
    tandonId: draft.tandonId,
    date: draft.date,
    totalWeightKg: draft.totalWeightKg,
    totalPlants: draft.totalPlants,
    rejected: draft.rejected,
    reasons: draft.reasons,
    notes: draft.notes,
    avgWeightG: calculateAvgWeightG(draft.totalWeightKg, draft.totalPlants),
    successRate: calculateSuccessRate(draft.totalPlants, draft.rejected),
    createdAt: existing?.createdAt ?? new Date().toISOString(),
  }
}

function mergeDraft(existing: HarvestEntry, patch: Partial<HarvestDraft>): HarvestDraft {
  return {
    tandonId: patch.tandonId ?? existing.tandonId,
    date: patch.date ?? existing.date,
    totalWeightKg: patch.totalWeightKg ?? existing.totalWeightKg,
    totalPlants: patch.totalPlants ?? existing.totalPlants,
    rejected: patch.rejected ?? existing.rejected,
    reasons: patch.reasons ?? existing.reasons,
    notes: patch.notes !== undefined ? patch.notes : existing.notes,
  }
}

export const useHarvestStore = create<HarvestState>()(
  persist(
    (set, get) => ({
      harvests: [],

      addHarvest: async (draft) => {
        if (USE_API) {
          const entry = await seladaApi.createHarvest(draft)
          set((state) => ({ harvests: [...state.harvests, entry] }))
          // Side effect "tandon → Sanitizing" terjadi di server; sinkronkan state tandon
          await useTandonStore.getState().refreshFromApi()
          return entry
        }
        const entry = buildEntry(draft)
        set((state) => ({ harvests: [...state.harvests, entry] }))
        await useTandonStore.getState().setStatus(draft.tandonId, 'Sanitizing')
        return entry
      },

      updateHarvest: async (id, patch) => {
        const existing = get().harvests.find((h) => h.id === id)
        if (!existing) return
        const merged = mergeDraft(existing, patch)

        if (USE_API) {
          const updated = await seladaApi.updateHarvest(id, merged)
          set((state) => ({
            harvests: state.harvests.map((h) => (h.id === id ? updated : h)),
          }))
          return
        }
        set((state) => ({
          harvests: state.harvests.map((h) =>
            h.id === id ? buildEntry(merged, existing) : h,
          ),
        }))
      },

      deleteHarvest: async (id) => {
        if (USE_API) {
          await seladaApi.deleteHarvest(id)
          set((state) => ({ harvests: state.harvests.filter((h) => h.id !== id) }))
          // Server cascade: penjualan terkait batch ini ikut terhapus
          useSaleStore.setState((state) => ({
            sales: state.sales.filter((s) => s.harvestId !== id),
          }))
          return
        }
        set((state) => ({ harvests: state.harvests.filter((h) => h.id !== id) }))
      },

      getHarvestsByTandon: (tandonId) =>
        get().harvests
          .filter((h) => h.tandonId === tandonId)
          .sort((a, b) => b.date.localeCompare(a.date)),

      replaceAll: (harvests) => set({ harvests }),
    }),
    { name: STORAGE_KEYS.harvests, storage: appPersistStorage },
  ),
)
