import { create } from 'zustand'
import { getApiErrorMessage } from '@/api/client'
import { seladaApi, tandonsToRecord } from '@/api/seladaOpsApi'
import { useTandonStore } from './useTandonStore'
import { useHarvestStore } from './useHarvestStore'
import { useSaleStore } from './useSaleStore'
import { useCostStore } from './useCostStore'

export type DataSyncStatus = 'idle' | 'hydrating' | 'ready' | 'error'

interface DataSyncState {
  status: DataSyncStatus
  error: string | null
  /** Menarik seluruh dataset (tandon, panen, penjualan, biaya) dari API ke store lokal. */
  hydrate: () => Promise<void>
}

export const useDataSyncStore = create<DataSyncState>()((set, get) => ({
  status: 'idle',
  error: null,

  hydrate: async () => {
    const current = get().status
    if (current === 'hydrating' || current === 'ready') return
    set({ status: 'hydrating', error: null })
    try {
      const [tandons, harvests, sales, costs] = await Promise.all([
        seladaApi.listTandons(),
        seladaApi.listHarvests(),
        seladaApi.listSales(),
        seladaApi.listCosts(),
      ])
      useTandonStore.getState().replaceAll(tandonsToRecord(tandons))
      useHarvestStore.getState().replaceAll(harvests)
      useSaleStore.getState().replaceAll(sales)
      useCostStore.getState().replaceAll(costs)
      set({ status: 'ready' })
    } catch (error) {
      set({ status: 'error', error: getApiErrorMessage(error) })
    }
  },
}))
