import type {
  CostCategory,
  CostTarget,
  CostType,
} from '@/types/cost'

export const COST_TYPES: Array<{
  key: CostType
  label: string
  shortLabel: string
  tone: 'info' | 'warning'
}> = [
  { key: 'operasional', label: 'Operasional', shortLabel: 'Ops', tone: 'info' },
  { key: 'modal', label: 'Modal & Aset', shortLabel: 'Modal', tone: 'warning' },
]

export const COST_CATEGORIES: Array<{
  key: CostCategory
  label: string
  shortLabel: string
  icon: string
}> = [
  { key: 'benihRockwool', label: 'Benih & Rockwool', shortLabel: 'Benih', icon: '🌱' },
  { key: 'nutrisi', label: 'Nutrisi', shortLabel: 'Nutrisi', icon: '🧪' },
  { key: 'pestisida', label: 'Pestisida', shortLabel: 'Pestisida', icon: '🧴' },
  { key: 'listrikAir', label: 'Listrik & Air', shortLabel: 'Listrik', icon: '💡' },
  { key: 'tenagaKerja', label: 'Tenaga Kerja', shortLabel: 'Tenaga Kerja', icon: '👷' },
  { key: 'kemasanTransportasi', label: 'Kemasan & Transportasi', shortLabel: 'Kemasan', icon: '📦' },
  { key: 'peralatanMesin', label: 'Peralatan & Mesin', shortLabel: 'Peralatan', icon: '⚙️' },
  { key: 'perbaikan', label: 'Perbaikan', shortLabel: 'Perbaikan', icon: '🔧' },
  { key: 'lainLain', label: 'Lain-lain (tak terduga)', shortLabel: 'Lain-lain', icon: '❓' },
]

export const COST_TARGETS: Array<{
  key: CostTarget
  label: string
  shortLabel: string
}> = [
  { key: 'T1', label: 'Tandon 1 (T1)', shortLabel: 'T1' },
  { key: 'T2', label: 'Tandon 2 (T2)', shortLabel: 'T2' },
  { key: 'T3', label: 'Tandon 3 (T3)', shortLabel: 'T3' },
  { key: 'UMUM', label: 'Umum — dibagi rata ke 3 tandon', shortLabel: 'Umum' },
]

export const MODAL_SPREAD_PRESETS = [1, 2, 3, 4, 6]

export const MODAL_SPREAD_MAX = 24

export function costCategoryMeta(category: CostCategory) {
  return COST_CATEGORIES.find((c) => c.key === category)
}

export function costTypeMeta(type: CostType) {
  return COST_TYPES.find((t) => t.key === type)
}

export function costTargetMeta(target: CostTarget) {
  return COST_TARGETS.find((t) => t.key === target)
}
