import type { CycleEvent, CyclePhase } from '@/types/cycle'

export const CYCLE_TOTAL_DAYS = 47

export const CYCLE_EVENTS: CycleEvent[] = [
  {
    type: 'sowing',
    hss: 0,
    label: 'Semai (HSS 0)',
    icon: '🌱',
    tone: 'info',
  },
  {
    type: 'moveToGutter',
    hss: 14,
    label: 'Pindah Talang (HSS 14)',
    icon: '📦',
    tone: 'info',
  },
  {
    type: 'firstSpray',
    hss: 16,
    label: 'Semprot 1 (HSS 16)',
    icon: '🧴',
    tone: 'info',
  },
  {
    type: 'midSpray',
    hss: 21,
    label: 'Semprot 2 (HSS 21)',
    icon: '🧴',
    tone: 'info',
  },
  {
    type: 'lateSpray',
    hss: 26,
    label: 'Semprot 3 (HSS 26)',
    icon: '🧴',
    tone: 'info',
  },
  {
    type: 'sprayStopWarning',
    hss: 31,
    label: '⚠️ STOP Semprot (HSS 31)',
    icon: '🛑',
    tone: 'danger',
  },
  {
    type: 'preHarvestCheck',
    hss: 32,
    label: 'Cek Pra-Panen (HSS 32)',
    icon: '🔍',
    tone: 'warning',
  },
  {
    type: 'harvest',
    hss: 45,
    label: 'Panen (HSS 45)',
    icon: '🥬',
    tone: 'success',
  },
  {
    type: 'sanitizeStart',
    hss: 46,
    label: 'Mulai Sanitasi (HSS 46)',
    icon: '🧼',
    tone: 'neutral',
  },
  {
    type: 'sanitizeEnd',
    hss: 47,
    label: 'Selesai Sanitasi (HSS 47)',
    icon: '✅',
    tone: 'success',
  },
]

export const CHEMICAL_SPRAY_STOP_HSS = 32

export const CYCLE_PHASE_RANGES: Array<{
  phase: CyclePhase
  startHss: number
  endHss: number
}> = [
  { phase: 'Semai', startHss: 0, endHss: 13 },
  { phase: 'Tumbuh', startHss: 14, endHss: 26 },
  { phase: 'Penggemukan', startHss: 27, endHss: 44 },
  { phase: 'Panen', startHss: 45, endHss: 45 },
  { phase: 'Sanitasi', startHss: 46, endHss: 47 },
]

export function getCyclePhaseRange(phase: CyclePhase) {
  return CYCLE_PHASE_RANGES.find((p) => p.phase === phase)
}
