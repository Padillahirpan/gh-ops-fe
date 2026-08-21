import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Tandon, TandonId, TandonStatus } from '@/types/tandon'
import { TANDON_CONFIG, createDefaultTandons } from '@/constants/tandonConfig'
import { STORAGE_KEYS } from '@/constants/storageKeys'

interface TandonState {
  tandons: Record<TandonId, Tandon>
  setSowingDate: (tandonId: TandonId, date: string | null) => void
  setStatus: (tandonId: TandonId, status: TandonStatus) => void
  resetTandon: (tandonId: TandonId) => void
  replaceAll: (tandons: Record<TandonId, Tandon>) => void
}

export const useTandonStore = create<TandonState>()(
  persist(
    (set) => ({
      tandons: createDefaultTandons(),

      setSowingDate: (tandonId, date) =>
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
                status: tandon.status === 'Sanitizing' && date ? tandon.status : nextStatus,
              },
            },
          }
        }),

      setStatus: (tandonId, status) =>
        set((state) => {
          const tandon = state.tandons[tandonId]
          if (!tandon) return state
          return {
            tandons: {
              ...state.tandons,
              [tandonId]: { ...tandon, status },
            },
          }
        }),

      resetTandon: (tandonId) =>
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
        }),

      replaceAll: (tandons) => set({ tandons }),
    }),
    { name: STORAGE_KEYS.tandons },
  ),
)
