import { CYCLE_EVENTS, CYCLE_TOTAL_DAYS } from '@/constants/cycleSchedule'
import type { Tandon } from '@/types/tandon'

export interface CycleDialProps {
  tandon: Tandon
  currentHss: number | null
  phase: string
}

const SIZE = 220
const CENTER = SIZE / 2
const RING_RADIUS = 92
const STROKE_WIDTH = 10

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  }
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle)
  const end = polarToCartesian(cx, cy, r, startAngle)
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1'
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`
}

export function CycleDial({ tandon, currentHss, phase }: CycleDialProps) {
  const progressDeg =
    currentHss === null ? 0 : Math.min(360, (currentHss / CYCLE_TOTAL_DAYS) * 360)

  return (
    <div
      className="flex flex-col items-center rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-4"
      role="group"
      aria-label={`${tandon.name}: ${currentHss === null ? 'belum ada siklus' : `HSS ${currentHss} dari ${CYCLE_TOTAL_DAYS}, fase ${phase}`}`}
    >
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="inline-block h-3 w-3 rounded-full"
            style={{ backgroundColor: tandon.color }}
            aria-hidden
          />
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">
            {tandon.name}
          </h3>
        </div>
        <span className="text-xs text-[var(--text-muted)]">{tandon.greenhouse}</span>
      </div>

      <div className="relative mt-3" style={{ width: SIZE, height: SIZE }}>
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} aria-hidden>
          <circle
            cx={CENTER}
            cy={CENTER}
            r={RING_RADIUS}
            fill="none"
            stroke="var(--border-default)"
            strokeWidth={STROKE_WIDTH}
          />

          {progressDeg > 0 && (
            <path
              d={describeArc(CENTER, CENTER, RING_RADIUS, 0, progressDeg)}
              fill="none"
              stroke={tandon.color}
              strokeWidth={STROKE_WIDTH}
              strokeLinecap="round"
            />
          )}

          {CYCLE_EVENTS.map((event) => {
            const angle = (event.hss / CYCLE_TOTAL_DAYS) * 360
            const pos = polarToCartesian(CENTER, CENTER, RING_RADIUS, angle)
            const isPast = currentHss !== null && event.hss < currentHss
            const isCurrent = currentHss !== null && event.hss === currentHss
            const markerRadius = isCurrent ? 7 : 5

            return (
              <g key={event.type}>
                {isCurrent && (
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={markerRadius + 3}
                    fill="none"
                    stroke={tandon.color}
                    strokeWidth={2}
                    className="cycle-marker-pulse"
                  />
                )}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={markerRadius}
                  fill={isPast || isCurrent ? tandon.color : 'var(--bg-surface)'}
                  stroke={tandon.color}
                  strokeWidth={2}
                />
              </g>
            )
          })}
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <p className="font-mono text-2xl font-bold tabular-nums leading-none text-[var(--text-primary)]">
            {currentHss === null ? '—' : `HSS ${currentHss}`}
          </p>
          <p className="mt-1 font-mono text-xs text-[var(--text-muted)]">
            / {CYCLE_TOTAL_DAYS} hari
          </p>
          <p className="mt-2 text-sm font-medium text-[var(--text-secondary)]">
            {currentHss === null ? 'Belum Semai' : `Fase ${phase}`}
          </p>
        </div>
      </div>

      <ul className="mt-3 w-full space-y-1" aria-label="Ringkasan event siklus">
        {CYCLE_EVENTS.filter((e) => [0, 14, 31, 45].includes(e.hss)).map((event) => {
          const isPast = currentHss !== null && event.hss < currentHss
          const isCurrent = currentHss !== null && event.hss === currentHss
          return (
            <li
              key={event.type}
              className="flex items-center justify-between rounded-sm px-2 py-1 text-xs"
              style={{
                backgroundColor:
                  isCurrent && event.tone === 'danger'
                    ? 'color-mix(in srgb, var(--status-danger) 12%, transparent)'
                    : undefined,
              }}
            >
              <span
                className={
                  isPast
                    ? 'text-[var(--text-muted)] line-through'
                    : isCurrent
                      ? 'font-semibold text-[var(--text-primary)]'
                      : 'text-[var(--text-secondary)]'
                }
              >
                <span aria-hidden>{event.icon}</span> {event.label}
              </span>
              {(isPast || isCurrent) && (
                <span className="font-mono tabular-nums text-[var(--text-muted)]">
                  {isCurrent ? 'hari ini' : '✓'}
                </span>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
