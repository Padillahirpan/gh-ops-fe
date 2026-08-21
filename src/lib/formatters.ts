export function formatCurrencyRp(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return 'Rp -'
  const abs = Math.abs(value)
  const formatted = abs.toLocaleString('id-ID', {
    maximumFractionDigits: 0,
  })
  const sign = value < 0 ? '-' : ''
  return `${sign}Rp ${formatted}`
}

export function formatCurrencyRpCompact(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return 'Rp -'
  const abs = Math.abs(value)
  const sign = value < 0 ? '-' : ''
  if (abs >= 1_000_000_000) {
    return `${sign}Rp ${(abs / 1_000_000_000).toFixed(1).replace('.0', '')} M`
  }
  if (abs >= 1_000_000) {
    return `${sign}Rp ${(abs / 1_000_000).toFixed(1).replace('.0', '')} Jt`
  }
  if (abs >= 1_000) {
    return `${sign}Rp ${(abs / 1_000).toFixed(1).replace('.0', '')} Rb`
  }
  return formatCurrencyRp(value)
}

export function formatWeightKg(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '- kg'
  const abs = Math.abs(value)
  const sign = value < 0 ? '-' : ''
  return `${sign}${abs.toLocaleString('id-ID', {
    minimumFractionDigits: abs % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })} kg`
}

export function formatWeightG(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '- g'
  const sign = value < 0 ? '-' : ''
  return `${sign}${Math.round(value).toLocaleString('id-ID')} g`
}

export function formatPercent(
  value: number | null | undefined,
  fractionDigits: number = 1,
): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '-%'
  return `${value.toFixed(fractionDigits)}%`
}

export function formatNumber(
  value: number | null | undefined,
  fractionDigits: number = 0,
): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '-'
  return value.toLocaleString('id-ID', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })
}

export function formatDelta(
  current: number,
  previous: number | null,
): { value: number; percent: number; direction: 'up' | 'down' | 'flat' } {
  if (previous === null || previous === 0) {
    return { value: 0, percent: 0, direction: 'flat' }
  }
  const delta = current - previous
  const percent = (delta / Math.abs(previous)) * 100
  const direction =
    delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat'
  return { value: delta, percent, direction }
}
