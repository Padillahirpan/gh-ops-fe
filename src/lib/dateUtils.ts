import {
  addDays,
  differenceInCalendarDays,
  eachDayOfInterval,
  endOfMonth,
  format,
  formatISO as formatISODateFns,
  isSameDay,
  isSameMonth,
  startOfMonth,
} from 'date-fns'
import { id } from 'date-fns/locale'

export function formatDateID(date: string | Date | null | undefined): string {
  if (!date) return '-'
  const d = typeof date === 'string' ? new Date(date) : date
  if (Number.isNaN(d.getTime())) return '-'
  return format(d, 'dd MMM yyyy', { locale: id })
}

export function formatDateFullID(date: string | Date | null | undefined): string {
  if (!date) return '-'
  const d = typeof date === 'string' ? new Date(date) : date
  if (Number.isNaN(d.getTime())) return '-'
  return format(d, 'EEEE, dd MMMM yyyy', { locale: id })
}

export function formatISO(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  if (Number.isNaN(d.getTime())) {
    throw new Error('Invalid date for formatISO')
  }
  return formatISODateFns(d, { representation: 'date' })
}

export function todayISO(): string {
  return formatISO(new Date())
}

export function getMonthDaysArray(year: number, month: number): Date[] {
  const start = startOfMonth(new Date(year, month, 1))
  const end = endOfMonth(start)
  return eachDayOfInterval({ start, end })
}

export function diffInDays(
  dateA: string | Date,
  dateB: string | Date = new Date(),
): number {
  const a = typeof dateA === 'string' ? new Date(dateA) : dateA
  const b = typeof dateB === 'string' ? new Date(dateB) : dateB
  return differenceInCalendarDays(a, b)
}

export function isSameDayISO(a: string | Date, b: string | Date): boolean {
  const da = typeof a === 'string' ? new Date(a) : a
  const db = typeof b === 'string' ? new Date(b) : b
  return isSameDay(da, db)
}

export function isSameMonthISO(
  a: string | Date,
  year: number,
  month: number,
): boolean {
  const d = typeof a === 'string' ? new Date(a) : a
  return isSameMonth(d, new Date(year, month, 1))
}

export function addDaysISO(date: string | Date, days: number): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return formatISO(addDays(d, days))
}
