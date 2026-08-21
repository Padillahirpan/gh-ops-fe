import type { Tandon, TandonId } from '@/types/tandon'
import { TANDON_CONFIG } from '@/constants/tandonConfig'
import { CYCLE_EVENTS, CYCLE_TOTAL_DAYS } from '@/constants/cycleSchedule'
import {
  generateCycleEvents,
  getCyclePhase,
  getHssFromSowingDate,
} from '@/lib/cycleCalculator'
import { formatISO } from '@/lib/dateUtils'

export interface TandonCycleInfo {
  tandon: Tandon
  currentHss: number | null
  phase: string
  events: ReturnType<typeof generateCycleEvents>
}

export function computeTandonCycles(
  tandons: Record<TandonId, Tandon>,
): TandonCycleInfo[] {
  return (Object.keys(tandons) as TandonId[]).map((id) => {
    const tandon = tandons[id]
    const today = new Date()
    const currentHss = getHssFromSowingDate(tandon.sowingDate, today)
    return {
      tandon,
      currentHss,
      phase: getCyclePhase(currentHss),
      events: generateCycleEvents(tandon.sowingDate, today),
    }
  })
}

export interface CalendarChipEvent {
  tandonId: TandonId
  tandonName: string
  tandonColor: string
  date: string
  hss: number
  label: string
  icon: string
  tone: string
}

export function collectMonthEvents(
  tandons: Record<TandonId, Tandon>,
): CalendarChipEvent[] {
  const chips: CalendarChipEvent[] = []
  for (const id of Object.keys(tandons) as TandonId[]) {
    const tandon = tandons[id]
    if (!tandon.sowingDate) continue
    const events = generateCycleEvents(tandon.sowingDate)
    for (const ev of events) {
      chips.push({
        tandonId: id,
        tandonName: tandon.name,
        tandonColor: TANDON_CONFIG[id].color,
        date: ev.date,
        hss: ev.hss,
        label: ev.label,
        icon: ev.icon,
        tone: ev.tone,
      })
    }
  }
  return chips
}

export interface UpcomingEvent {
  tandonId: TandonId
  tandonName: string
  tandonColor: string
  label: string
  date: string
  daysRemaining: number
}

export function getUpcomingEvents(
  tandons: Record<TandonId, Tandon>,
  days: number = 14,
): UpcomingEvent[] {
  const today = new Date()
  const limit = formatISO(new Date(today.getTime() + days * 86_400_000))
  const result: UpcomingEvent[] = []

  for (const id of Object.keys(tandons) as TandonId[]) {
    const tandon = tandons[id]
    if (!tandon.sowingDate) continue
    const events = generateCycleEvents(tandon.sowingDate, today)
    for (const ev of events) {
      if (ev.status === 'past') continue
      if (ev.date > limit) continue
      const diff = Math.round(
        (new Date(ev.date).getTime() - new Date(formatISO(today)).getTime()) /
          86_400_000,
      )
      result.push({
        tandonId: id,
        tandonName: tandon.name,
        tandonColor: TANDON_CONFIG[id].color,
        label: ev.label,
        date: ev.date,
        daysRemaining: Math.max(0, diff),
      })
    }
  }

  return result.sort(
    (a, b) => a.date.localeCompare(b.date) || a.tandonId.localeCompare(b.tandonId),
  )
}

export { CYCLE_EVENTS, CYCLE_TOTAL_DAYS }
