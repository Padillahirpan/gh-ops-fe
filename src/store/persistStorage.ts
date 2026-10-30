import { createJSONStorage } from 'zustand/middleware'
import { USE_API } from '@/api/client'

/** Storage no-op untuk mode API: server sumber kebenaran, localStorage dilewati. */
const memoryStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
}

export const appPersistStorage = createJSONStorage(() =>
  USE_API ? memoryStorage : window.localStorage,
)
