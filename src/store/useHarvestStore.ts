import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { HarvestEntry, HarvestRejectionBreakdown } from '@/types/harvest'
import type { TandonId } from '@/types/tandon'
import { STORAGE_KEYS } from '@/constants/storageKeys'
import {
  calculateAvgWeightG,
  calculateSuccessRate,
} from '@/lib/harvestCalculations'
import { useTandonStore } from './useTandonStore'

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
  addHarvest: (draft: HarvestDraft) => HarvestEntry
  updateHarvest: (id: string, patch: Partial<HarvestDraft>) => void
  deleteHarvest: (id: string) => void
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

export const useHarvestStore = create<HarvestState>()(
  persist(
    (set, get) => ({
      harvests: [],

      addHarvest: (draft) => {
        const entry = buildEntry(draft)
        set((state) => ({ harvests: [...state.harvests, entry] }))
        useTandonStore.getState().setStatus(draft.tandonId, 'Sanitizing')
        return entry
      },

      updateHarvest: (id, patch) =>
        set((state) => ({
          harvests: state.harvests.map((h) => {
            if (h.id !== id) return h
            const merged: HarvestDraft = {
              tandonId: patch.tandonId ?? h.tandonId,
              date: patch.date ?? h.date,
              totalWeightKg: patch.totalWeightKg ?? h.totalWeightKg,
              totalPlants: patch.totalPlants ?? h.totalPlants,
              rejected: patch.rejected ?? h.rejected,
              reasons: patch.reasons ?? h.reasons,
              notes: patch.notes !== undefined ? patch.notes : h.notes,
            }
            return buildEntry(merged, h)
          }),
        })),

      deleteHarvest: (id) =>
        set((state) => ({
          harvests: state.harvests.filter((h) => h.id !== id),
        })),

      getHarvestsByTandon: (tandonId) =>
        get().harvests
          .filter((h) => h.tandonId === tandonId)
          .sort((a, b) => b.date.localeCompare(a.date)),

      replaceAll: (harvests) => set({ harvests }),
    }),
    { name: STORAGE_KEYS.harvests },
  ),
)
