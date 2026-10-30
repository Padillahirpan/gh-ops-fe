import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Tandon, TandonId, TandonStatus } from '@/types/tandon'
import { TANDON_CONFIG, createDefaultTandons } from '@/constants/tandonConfig'
import { STORAGE_KEYS } from '@/constants/storageKeys'
import { USE_API } from '@/api/client'
import { seladaApi, tandonsToRecord } from '@/api/seladaOpsApi'
import { appPersistStorage } from './persistStorage'

interface TandonState {
  tandons: Record<TandonId, Tandon>
  setSowingDate: (tandonId: TandonId, date: string | null) => Promise<void>
  setStatus: (tandonId: TandonId, status: TandonStatus) => Promise<void>
  resetTandon: (tandonId: TandonId) => Promise<void>
  replaceAll: (tandons: Record<TandonId, Tandon>) => void
  /** Tarik ulang state tandon dari server (dipakai setelah side effect server, mis. POST harvest). */
  refreshFromApi: () => Promise<void>
}

export const useTandonStore = create<TandonState>()(
  persist(
    (set) => ({
      tandons: createDefaultTandons(),

      setSowingDate: async (tandonId, date) => {
        if (USE_API) {
          const updated = await seladaApi.patchTandon(tandonId, { sowingDate: date })
          set((state) => ({ tandons: { ...state.tandons, [updated.id]: updated } }))
          return
        }
        set((state) => {
          const tandon = state.tandons[tandonId]
          if (!tandon) return state
          const nextStatus: TandonStatus = date === null ? 'Empty' : 'Growing'
          return {
            tandons: {
              ...state.tandons,
              [tandonId]: {
                ...tandon,
                sowingDate: date,
                status:
                  tandon.status === 'Sanitizing' && date ? tandon.status : nextStatus,
              },
            },
          }
        })
      },

      setStatus: async (tandonId, status) => {
        if (USE_API) {
          const updated = await seladaApi.patchTandon(tandonId, { status })
          set((state) => ({ tandons: { ...state.tandons, [updated.id]: updated } }))
          return
        }
        set((state) => {
          const tandon = state.tandons[tandonId]
          if (!tandon) return state
          return {
            tandons: {
              ...state.tandons,
              [tandonId]: { ...tandon, status },
            },
          }
        })
      },

      resetTandon: async (tandonId) => {
        if (USE_API) {
          const updated = await seladaApi.resetTandon(tandonId)
          set((state) => ({ tandons: { ...state.tandons, [updated.id]: updated } }))
          return
        }
        set((state) => {
          const tandon = state.tandons[tandonId]
          if (!tandon) return state
          const cfg = TANDON_CONFIG[tandonId]
          return {
            tandons: {
              ...state.tandons,
              [tandonId]: {
                ...tandon,
                sowingDate: null,
                status: cfg.initialStatus,
              },
            },
          }
        })
      },

      replaceAll: (tandons) => set({ tandons }),

      refreshFromApi: async () => {
        if (!USE_API) return
        const list = await seladaApi.listTandons()
        set({ tandons: tandonsToRecord(list) })
      },
    }),
    { name: STORAGE_KEYS.tandons, storage: appPersistStorage },
  ),
)
