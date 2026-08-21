import { useMemo, useState } from 'react'
import { addMonths, format, getDay, startOfMonth } from 'date-fns'
import { id } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { TandonId } from '@/types/tandon'
import { TANDON_CONFIG } from '@/constants/tandonConfig'
import { getMonthDaysArray, formatISO, isSameDayISO } from '@/lib/dateUtils'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { collectMonthEvents } from './cycleUtils'
import type { CalendarChipEvent } from './cycleUtils'

const WEEKDAYS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']

export interface MonthCalendarProps {
  tandons: Record<TandonId, import('@/types/tandon').Tandon>
  onSelectTandon?: (tandonId: TandonId) => void
}

export function MonthCalendar({ tandons, onSelectTandon }: MonthCalendarProps) {
  const today = useMemo(() => new Date(), [])
  const [viewDate, setViewDate] = useState(() => startOfMonth(today))
  const [selectedDay, setSelectedDay] = useState<string | null>(null)

  const allEvents = useMemo(() => collectMonthEvents(tandons), [tandons])

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarChipEvent[]>()
    for (const chip of allEvents) {
      const list = map.get(chip.date) ?? []
      list.push(chip)
      map.set(chip.date, list)
    }
    return map
  }, [allEvents])

  const days = useMemo(() => {
    const monthDays = getMonthDaysArray(
      viewDate.getFullYear(),
      viewDate.getMonth(),
    )
    // Monday-first grid: shift Sunday (getDay=0) to index 6
    const leading = (getDay(startOfMonth(viewDate)) + 6) % 7
    const cells: Array<Date | null> = Array.from({ length: leading }, () => null)
    return [...cells, ...monthDays]
  }, [viewDate])

  const selectedEvents = selectedDay ? (eventsByDate.get(selectedDay) ?? []) : []

  return (
    <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)]">
      <div className="flex items-center justify-between border-b border-[var(--border-default)] px-4 py-3">
        <h2 className="font-serif text-lg font-bold text-[var(--text-primary)]">
          {format(viewDate, 'MMMM yyyy', { locale: id })}
        </h2>
        <div className="flex gap-1">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setViewDate((d) => addMonths(d, -1))}
            aria-label="Bulan sebelumnya"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setViewDate(startOfMonth(today))}
          >
            Hari ini
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setViewDate((d) => addMonths(d, 1))}
            aria-label="Bulan berikutnya"
          >
            <ChevronRight className="h-4 w-4" aria-hidden />
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto p-2 sm:p-4">
        <div className="min-w-[640px]">
          <div className="grid grid-cols-7 gap-1" role="row">
            {WEEKDAYS.map((day) => (
              <div
                key={day}
                className="py-2 text-center text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((day, idx) => {
              if (day === null) return <div key={`empty-${idx}`} aria-hidden />
              const iso = formatISO(day)
              const dayEvents = eventsByDate.get(iso) ?? []
              const isToday = isSameDayISO(day, today)
              const isWeekend = [0, 6].includes(day.getDay())

              return (
                <button
                  key={iso}
                  type="button"
                  onClick={() => dayEvents.length > 0 && setSelectedDay(iso)}
                  className={[
                    'flex min-h-[88px] flex-col gap-1 rounded-md border p-1.5 text-left transition-colors',
                    dayEvents.length > 0
                      ? 'cursor-pointer hover:bg-[var(--bg-surface-hover)]'
                      : 'cursor-default',
                    isToday
                      ? 'border-2 border-[var(--color-tandon-t1)]'
                      : 'border-[var(--border-default)]',
                    isWeekend ? 'bg-[var(--bg-surface-hover)]/40' : 'bg-[var(--bg-surface)]',
                  ].join(' ')}
                  aria-label={`${format(day, 'dd MMMM yyyy', { locale: id })}${dayEvents.length > 0 ? `, ${dayEvents.length} event` : ''}`}
                >
                  <span
                    className={[
                      'font-mono text-sm tabular-nums',
                      isToday
                        ? 'font-bold text-[var(--color-tandon-t1)]'
                        : 'text-[var(--text-secondary)]',
                    ].join(' ')}
                  >
                    {format(day, 'd')}
                  </span>

                  {dayEvents.slice(0, 3).map((ev) => {
                    const isStopSpray = ev.tone === 'danger'
                    return (
                      <span
                        key={`${ev.tandonId}-${ev.hss}`}
                        className={[
                          'flex h-6 items-center gap-1 overflow-hidden rounded-xs px-1 text-xs',
                          isStopSpray ? 'border-2' : 'border',
                          isStopSpray ? 'event-chip-shake' : '',
                        ].join(' ')}
                        style={{
                          backgroundColor: `color-mix(in srgb, ${ev.tandonColor} 15%, transparent)`,
                          borderColor: isStopSpray
                            ? 'var(--status-danger)'
                            : ev.tandonColor,
                          color: isStopSpray ? 'var(--status-danger)' : 'var(--text-primary)',
                        }}
                        title={ev.label}
                      >
                        <span aria-hidden>{isStopSpray ? '🛑' : ev.icon}</span>
                        <span className={ev.tone === 'success' ? 'font-semibold' : ''}>
                          {ev.tandonId} · HSS {ev.hss}
                        </span>
                      </span>
                    )
                  })}

                  {dayEvents.length > 3 && (
                    <span className="text-xs text-[var(--text-muted)]">
                      +{dayEvents.length - 3} lagi
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <Modal
        open={selectedDay !== null}
        onClose={() => setSelectedDay(null)}
        title={
          selectedDay
            ? format(new Date(selectedDay), 'EEEE, dd MMMM yyyy', { locale: id })
            : ''
        }
        size="sm"
      >
        {selectedEvents.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)]">
            Tidak ada event untuk tanggal ini.
          </p>
        ) : (
          <ul className="space-y-2">
            {selectedEvents.map((ev) => (
              <li
                key={`${ev.tandonId}-${ev.hss}`}
                className="flex items-center justify-between gap-3 rounded-md border p-3"
                style={{ borderColor: ev.tandonColor }}
              >
                <div>
                  <p className="flex items-center gap-1.5 text-sm font-medium text-[var(--text-primary)]">
                    <span aria-hidden>{ev.tone === 'danger' ? '🛑' : ev.icon}</span>
                    {ev.label}
                  </p>
                  <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                    {ev.tandonName} · {TANDON_CONFIG[ev.tandonId].greenhouse}
                  </p>
                </div>
                {onSelectTandon && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      onSelectTandon(ev.tandonId)
                      setSelectedDay(null)
                    }}
                  >
                    Lihat detail
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </Modal>
    </div>
  )
}
