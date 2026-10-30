import { create } from 'zustand'
import type { CostingOverview } from '@/types/cost'
import type { TandonId } from '@/types/tandon'
import { seladaApi } from '@/api/seladaOpsApi'
import { getApiErrorMessage } from '@/api/client'
import { USE_API } from '@/api/client'

export type CostingFilterTandon = 'all' | TandonId

interface CostingState {
  overview: CostingOverview | null
  filterTandon: CostingFilterTandon
  loading: boolean
  error: string | null
  /** Tarik rekap per batch + total. Tolak dengan pesan bila mode API nonaktif. */
  fetchOverview: (tandonId?: CostingFilterTandon) => Promise<void>
  /** Ambil ulang dengan filter terakhir (dipanggil setelah mutasi biaya). */
  refresh: () => Promise<void>
}

const API_MODE_REQUIRED_MESSAGE =
  'Rekap per batch membutuhkan backend (mode API). Jalankan selada-ops-api lalu set VITE_USE_API=true.'

export const useCostingStore = create<CostingState>()((set, get) => ({
  overview: null,
  filterTandon: 'all',
  loading: false,
  error: null,

  fetchOverview: async (tandonId) => {
    if (!USE_API) {
      set({ error: API_MODE_REQUIRED_MESSAGE, overview: null })
      return
    }
    const filter = tandonId ?? get().filterTandon
    set({ loading: true, error: null, filterTandon: filter })
    try {
      const overview = await seladaApi.getCostingOverview(filter)
      set({ overview, loading: false })
    } catch (error) {
      set({ error: getApiErrorMessage(error), loading: false })
    }
  },

  refresh: async () => {
    if (!USE_API) return
    await get().fetchOverview()
  },
}))
