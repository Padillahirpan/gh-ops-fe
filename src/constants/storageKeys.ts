export const STORAGE_KEYS = {
  tandons: 'hydro-tandons-v1',
  harvests: 'hydro-harvests-v1',
  sales: 'hydro-sales-v1',
  uiPreferences: 'hydro-ui-preferences-v1',
  demoSeededFlag: 'hydro-demo-seeded-v1',
} as const

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS]

export const STORAGE_VERSION = 1
