import { useMemo, useState } from 'react'
import { CalendarClock } from 'lucide-react'
import type { TandonId } from '@/types/tandon'
import { useTandonStore } from '@/store/useTandonStore'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { CycleDial } from './CycleDial'
import { MonthCalendar } from './MonthCalendar'
import { TandonSettingsPanel } from './TandonSettingsPanel'
import { computeTandonCycles, getUpcomingEvents } from './cycleUtils'
import { formatDateID } from '@/lib/dateUtils'

type CalendarTab = 'kalender' | 'pengaturan'

export function CalendarPage() {
  const tandons = useTandonStore((s) => s.tandons)
  const [tab, setTab] = useState<CalendarTab>('kalender')
  const [focusTandon, setFocusTandon] = useState<TandonId | null>(null)

  const cycleInfos = useMemo(
    () => computeTandonCycles(tandons),
    [tandons],
  )
  const upcoming = useMemo(() => getUpcomingEvents(tandons, 14), [tandons])

  function handleSelectTandon(tandonId: TandonId) {
    setFocusTandon(tandonId)
    setTab('pengaturan')
  }

  return (
    <div className="space-y-6">
      <div
        className="flex gap-1 rounded-md border border-[var(--border-default)] bg-[var(--bg-surface-hover)] p-1"
        role="tablist"
        aria-label="Tab kalender"
      >
        {(
          [
            { key: 'kalender', label: 'Kalender Siklus' },
            { key: 'pengaturan', label: 'Pengaturan Tandon' },
          ] as const
        ).map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={[
              'h-11 flex-1 rounded px-4 text-sm font-medium transition-colors',
              tab === t.key
                ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm ring-1 ring-[var(--border-strong)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]',
            ].join(' ')}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'kalender' ? (
        <>
          <div
            role="tabpanel"
            aria-label="Dial siklus tandon"
            className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
          >
            {cycleInfos.map((info) => (
              <CycleDial
                key={info.tandon.id}
                tandon={info.tandon}
                currentHss={info.currentHss}
                phase={info.phase}
              />
            ))}
          </div>

          <MonthCalendar tandons={tandons} onSelectTandon={handleSelectTandon} />

          <Card>
            <CardHeader
              title="Event 14 Hari ke Depan"
              subtitle="Event terdekat dari semua tandon"
            />
            <CardBody>
              {upcoming.length === 0 ? (
                <p className="py-6 text-center text-sm text-[var(--text-muted)]">
                  Tidak ada event mendatang. Atur tanggal semai di tab Pengaturan
                  Tandon.
                </p>
              ) : (
                <ul className="divide-y divide-[var(--border-default)]">
                  {upcoming.map((ev) => (
                    <li
                      key={`${ev.tandonId}-${ev.label}-${ev.date}`}
                      className="flex items-center justify-between gap-3 py-2.5"
                    >
                      <div className="flex min-w-0 items-center gap-2.5">
                        <span
                          className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: ev.tandonColor }}
                          aria-hidden
                        />
                        <span className="truncate text-sm text-[var(--text-primary)]">
                          {ev.label}
                        </span>
                      </div>
                      <div className="flex shrink-0 items-center gap-2 text-sm">
                        <span className="font-mono tabular-nums text-[var(--text-secondary)]">
                          {formatDateID(ev.date)}
                        </span>
                        <span
                          className="inline-flex h-6 items-center gap-1 rounded-sm px-2 text-xs font-medium"
                          style={{
                            backgroundColor: 'color-mix(in srgb, var(--status-info) 15%, transparent)',
                            color: 'var(--status-info)',
                          }}
                        >
                          <CalendarClock className="h-3 w-3" aria-hidden />
                          {ev.daysRemaining === 0
                            ? 'Hari ini'
                            : `${ev.daysRemaining} hari`}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>
        </>
      ) : (
        <div role="tabpanel" aria-label="Pengaturan tandon">
          <TandonSettingsPanel focusTandonId={focusTandon} />
        </div>
      )}
    </div>
  )
}
