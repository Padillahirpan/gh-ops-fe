import { useRef, useState } from 'react'
import {
  Download,
  Upload,
  Trash2,
  RefreshCw,
  Sun,
  Moon,
  Info,
} from 'lucide-react'
import type { Theme } from '@/types/ui'
import { useUIStore } from '@/store/useUIStore'
import { useTandonStore } from '@/store/useTandonStore'
import { useHarvestStore } from '@/store/useHarvestStore'
import { useSaleStore } from '@/store/useSaleStore'
import { toast } from '@/store/useToastStore'
import { seedDemoData } from '@/data/useSeedDemoData'
import { STORAGE_KEYS } from '@/constants/storageKeys'
import type { Tandon, TandonId } from '@/types/tandon'
import type { HarvestEntry } from '@/types/harvest'
import type { SaleEntry } from '@/types/sale'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'

interface BackupPayload {
  version: number
  exportedAt: string
  tandons: Record<TandonId, Tandon>
  harvests: HarvestEntry[]
  sales: SaleEntry[]
}

function isBackupPayload(value: unknown): value is BackupPayload {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Partial<BackupPayload>
  return (
    typeof v.tandons === 'object' &&
    v.tandons !== null &&
    Array.isArray(v.harvests) &&
    Array.isArray(v.sales)
  )
}

export function SettingsPage() {
  const theme = useUIStore((s) => s.theme)
  const setTheme = useUIStore((s) => s.setTheme)
  const fontSize = useUIStore((s) => s.fontSize)
  const setFontSize = useUIStore((s) => s.setFontSize)

  const [confirmReset, setConfirmReset] = useState(false)
  const [confirmResetStep2, setConfirmResetStep2] = useState(false)
  const [confirmImport, setConfirmImport] = useState(false)
  const [pendingImport, setPendingImport] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleExport() {
    const payload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      tandons: useTandonStore.getState().tandons,
      harvests: useHarvestStore.getState().harvests,
      sales: useSaleStore.getState().sales,
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `selada-ops-backup-${payload.exportedAt.slice(0, 10)}.json`
    link.click()
    URL.revokeObjectURL(url)
    toast.success('Data diekspor', 'File JSON backup berhasil diunduh')
  }

  function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPendingImport(file)
    setConfirmImport(true)
    e.target.value = ''
  }

  function executeImport() {
    if (!pendingImport) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed: unknown = JSON.parse(String(reader.result))
        if (!isBackupPayload(parsed)) {
          throw new Error('Struktur file tidak valid (butuh tandons, harvests, sales)')
        }
        useTandonStore.getState().replaceAll(parsed.tandons)
        useHarvestStore.getState().replaceAll(parsed.harvests)
        useSaleStore.getState().replaceAll(parsed.sales)
        toast.success('Data diimpor', 'Semua data berhasil diganti dari file')
      } catch (error) {
        toast.error('Import gagal', error instanceof Error ? error.message : 'File tidak valid')
      }
    }
    reader.readAsText(pendingImport)
    setPendingImport(null)
    setConfirmImport(false)
  }

  function handleReset() {
    if (!confirmResetStep2) {
      setConfirmResetStep2(true)
      return
    }
    for (const key of Object.values(STORAGE_KEYS)) {
      window.localStorage.removeItem(key)
    }
    window.location.reload()
  }

  function handleLoadDemo() {
    seedDemoData(true)
    toast.success('Data demo dimuat ulang', 'Halaman akan menampilkan data contoh')
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title="Tema" subtitle="Tampilan terang atau gelap" />
        <CardBody className="flex flex-wrap items-center gap-4">
          <div
            className="flex items-center rounded-md border border-[var(--border-default)] bg-[var(--bg-surface-hover)] p-1"
            role="group"
            aria-label="Pilih tema"
          >
            {(['light', 'dark'] as Theme[]).map((t) => (
              <button
                key={t}
                type="button"
                aria-pressed={theme === t}
                onClick={() => setTheme(t)}
                className={[
                  'flex h-11 items-center gap-2 rounded px-4 text-sm font-medium transition-colors',
                  theme === t
                    ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm ring-1 ring-[var(--border-strong)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]',
                ].join(' ')}
              >
                {t === 'light' ? (
                  <Sun className="h-4 w-4" aria-hidden />
                ) : (
                  <Moon className="h-4 w-4" aria-hidden />
                )}
                {t === 'light' ? 'Terang' : 'Gelap'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 rounded-md border border-[var(--border-default)] px-4 py-2.5">
            <span className="text-sm text-[var(--text-secondary)]">Preview:</span>
            <span className="text-sm font-semibold text-[var(--text-primary)]">
              HSS 23/47
            </span>
            <span className="rounded-sm bg-[var(--status-success)]/15 px-2 py-0.5 text-xs font-medium text-[var(--status-success)]">
              ✓ Target tercapai
            </span>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Ukuran Font" subtitle="Sesuaikan keterbacaan teks" />
        <CardBody className="space-y-3">
          <div
            className="flex items-center rounded-md border border-[var(--border-default)] bg-[var(--bg-surface-hover)] p-1"
            role="group"
            aria-label="Pilih ukuran font"
          >
            {(['small', 'medium', 'large'] as const).map((preset) => (
              <button
                key={preset}
                type="button"
                aria-pressed={fontSize === preset}
                onClick={() => setFontSize(preset)}
                className={[
                  'flex h-11 flex-1 items-center justify-center gap-2 rounded px-4 text-sm font-medium transition-colors',
                  fontSize === preset
                    ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm ring-1 ring-[var(--border-strong)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]',
                ].join(' ')}
              >
                <span
                  className="font-serif font-bold"
                  style={{ fontSize: preset === 'small' ? '0.85em' : preset === 'large' ? '1.25em' : '1em' }}
                >
                  A
                </span>
                {preset === 'small' ? 'Kecil' : preset === 'large' ? 'Besar' : 'Sedang'}
              </button>
            ))}
          </div>
          <p className="text-sm text-[var(--text-secondary)]">
            Contoh teks: Total panen hari ini{' '}
            <span className="font-mono font-semibold tabular-nums text-[var(--text-primary)]">
              218,4 kg
            </span>{' '}
            dengan rata-rata{' '}
            <span className="font-mono font-semibold tabular-nums text-[var(--status-success)]">
              205 g
            </span>{' '}
            per tanaman.
          </p>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Data" subtitle="Backup, restore, dan reset" />
        <CardBody className="flex flex-wrap gap-3">
          <Button
            variant="secondary"
            leftIcon={<Download className="h-4 w-4" aria-hidden />}
            onClick={handleExport}
          >
            Export Data (JSON)
          </Button>

          <Button
            variant="secondary"
            leftIcon={<Upload className="h-4 w-4" aria-hidden />}
            onClick={() => fileInputRef.current?.click()}
          >
            Import Data (JSON)
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={handleImportFile}
            aria-label="Pilih file JSON untuk import"
          />

          <Button
            variant="secondary"
            leftIcon={<RefreshCw className="h-4 w-4" aria-hidden />}
            onClick={handleLoadDemo}
          >
            Muat Ulang Data Demo
          </Button>

          <Button
            variant="danger"
            leftIcon={<Trash2 className="h-4 w-4" aria-hidden />}
            onClick={() => setConfirmReset(true)}
          >
            Reset Semua Data
          </Button>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Tentang" />
        <CardBody>
          <div className="flex items-start gap-3">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-[var(--status-info)]" aria-hidden />
            <div className="space-y-1 text-sm text-[var(--text-secondary)]">
              <p>
                <span className="font-semibold text-[var(--text-primary)]">Selada Ops</span>{' '}
                v1.0.0 — Frontend (localStorage mode)
              </p>
              <p>
                Sistem manajemen greenhouse hidroponik: 3 tandon · 2 GH · 3.000
                lubang tanam. Data tersimpan lokal di browser Anda.
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                Stack: Vite + React 19 + TypeScript + Tailwind v4 + Zustand + Recharts
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      <ConfirmDialog
        open={confirmImport}
        title="Import Data"
        body="Import akan MENGGANTI semua data saat ini dengan isi file. Pastikan Anda sudah export backup. Lanjutkan?"
        confirmLabel="Import & Ganti"
        onConfirm={executeImport}
        onCancel={() => {
          setConfirmImport(false)
          setPendingImport(null)
        }}
      />

      <ConfirmDialog
        open={confirmReset}
        title={confirmResetStep2 ? 'Konfirmasi Final' : 'Reset Semua Data'}
        body={
          confirmResetStep2
            ? 'PERINGATAN: Semua data panen, penjualan, dan pengaturan tandon akan DIHAPUS PERMANEN dan direset ke kondisi awal. Tindakan ini tidak bisa dibatalkan. Yakin lanjut?'
            : 'Ini akan menghapus semua data lokal (tandon, panen, penjualan, preferensi) dan me-reload aplikasi. Lanjutkan?'
        }
        confirmLabel={confirmResetStep2 ? 'Ya, Hapus Semua' : 'Lanjut'}
        onConfirm={handleReset}
        onCancel={() => {
          setConfirmReset(false)
          setConfirmResetStep2(false)
        }}
      />
    </div>
  )
}
