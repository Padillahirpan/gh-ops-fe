import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CostEntry, CostEntryView } from '@/types/cost'
import { STORAGE_KEYS } from '@/constants/storageKeys'
import { USE_API } from '@/api/client'
import { seladaApi } from '@/api/seladaOpsApi'
import type { CostPayload } from '@/api/seladaOpsApi'
import { appPersistStorage } from './persistStorage'
import { useCostingStore } from './useCostingStore'

export type CostDraft = CostPayload

interface CostState {
  costs: CostEntryView[]
  addCost: (draft: CostDraft) => Promise<CostEntryView>
  updateCost: (id: string, patch: CostDraft) => Promise<void>
  deleteCost: (id: string) => Promise<void>
  replaceAll: (costs: CostEntryView[]) => void
}

function generateId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `c-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

/** Mode lokal tidak punya data siklus → pengelompokan selalu null. */
function buildLocalEntry(draft: CostDraft, existing?: CostEntry): CostEntryView {
  const quantity = draft.quantity ?? existing?.quantity ?? null
  const unitPrice = draft.unitPrice ?? existing?.unitPrice ?? null
  const amount =
    quantity != null && unitPrice != null
      ? Math.round(quantity * unitPrice)
      : (draft.amount ?? existing?.amount ?? 0)
  return {
    id: existing?.id ?? generateId(),
    date: draft.date ?? existing?.date ?? '',
    type: draft.type ?? existing?.type ?? 'operasional',
    category: draft.category ?? existing?.category ?? 'lainLain',
    description: draft.description ?? existing?.description ?? '',
    amount,
    target: draft.target ?? existing?.target ?? 'T1',
    supplier: draft.supplier !== undefined ? draft.supplier : (existing?.supplier ?? null),
    notes: draft.notes !== undefined ? draft.notes : (existing?.notes ?? null),
    quantity,
    unitPrice,
    spreadCycles:
      draft.type === 'modal'
        ? (draft.spreadCycles ?? existing?.spreadCycles ?? 1)
        : 1,
    cycleId: draft.cycleId !== undefined ? draft.cycleId : (existing?.cycleId ?? null),
    assignedCycleId: draft.cycleId !== undefined ? draft.cycleId : (existing?.cycleId ?? null),
    createdAt: existing?.createdAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

/** Angka rekap harus mengikuti mutasi biaya — refresh bila overview pernah dimuat. */
function refreshCostingIfLoaded() {
  const costing = useCostingStore.getState()
  if (costing.overview) void costing.refresh()
}

export const useCostStore = create<CostState>()(
  persist(
    (set, get) => ({
      costs: [],

      addCost: async (draft) => {
        if (USE_API) {
          const entry = await seladaApi.createCost(draft)
          set((state) => ({ costs: [entry, ...state.costs] }))
          refreshCostingIfLoaded()
          return entry
        }
        const entry = buildLocalEntry(draft)
        set((state) => ({ costs: [entry, ...state.costs] }))
        return entry
      },

      updateCost: async (id, patch) => {
        const existing = get().costs.find((c) => c.id === id)
        if (!existing) return

        if (USE_API) {
          const updated = await seladaApi.updateCost(id, patch)
          set((state) => ({
            costs: state.costs.map((c) => (c.id === id ? updated : c)),
          }))
          refreshCostingIfLoaded()
          return
        }
        set((state) => ({
          costs: state.costs.map((c) => (c.id === id ? buildLocalEntry(patch, c) : c)),
        }))
      },

      deleteCost: async (id) => {
        if (USE_API) {
          await seladaApi.deleteCost(id)
        }
        set((state) => ({ costs: state.costs.filter((c) => c.id !== id) }))
        refreshCostingIfLoaded()
      },

      replaceAll: (costs) => set({ costs }),
    }),
    { name: STORAGE_KEYS.costs, storage: appPersistStorage },
  ),
)
