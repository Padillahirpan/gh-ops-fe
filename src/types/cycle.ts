import type { TandonId } from './tandon'

export type CyclePhase =
  | 'Semai'
  | 'Tumbuh'
  | 'Penggemukan'
  | 'Panen'
  | 'Sanitasi'
  | 'Belum Mulai'

export type CycleEventType =
  | 'sowing'
  | 'moveToGutter'
  | 'firstSpray'
  | 'midSpray'
  | 'lateSpray'
  | 'preHarvestCheck'
  | 'harvest'
  | 'sanitizeStart'
  | 'sanitizeEnd'
  | 'sprayStopWarning'

export interface CycleEvent {
  type: CycleEventType
  hss: number
  label: string
  icon: string
  tone: 'info' | 'warning' | 'danger' | 'success' | 'neutral'
}

export interface CycleEventSchedule {
  type: CycleEventType
  hss: number
  date: string
  label: string
  icon: string
  tone: 'info' | 'warning' | 'danger' | 'success' | 'neutral'
  status: 'past' | 'current' | 'upcoming'
}

export interface NextCycleEvent {
  event: CycleEventSchedule
  daysRemaining: number
}

export interface TandonCycleState {
  tandonId: TandonId
  currentHss: number
  phase: CyclePhase
  events: CycleEventSchedule[]
  nextEvent: NextCycleEvent | null
  chemicalSprayAllowed: boolean
}
