import { STORAGE_KEYS, STORAGE_VERSION } from '@/constants/storageKeys'

interface StorageMeta {
  version: number
  migratedAt: string | null
}

const MIGRATION_META_KEY = 'hydro-storage-meta-v1'

const MIGRATIONS: Record<number, (data: unknown) => unknown> = {}

export function readStorageMeta(): StorageMeta {
  try {
    const raw = window.localStorage.getItem(MIGRATION_META_KEY)
    if (!raw) return { version: STORAGE_VERSION, migratedAt: null }
    return JSON.parse(raw) as StorageMeta
  } catch {
    return { version: STORAGE_VERSION, migratedAt: null }
  }
}

export function writeStorageMeta(meta: StorageMeta): void {
  try {
    window.localStorage.setItem(MIGRATION_META_KEY, JSON.stringify(meta))
  } catch (error) {
    console.warn('[storage] Failed to persist storage meta', error)
  }
}

export function runMigrations(): boolean {
  const meta = readStorageMeta()
  if (meta.version >= STORAGE_VERSION) return false

  let version = meta.version
  while (version < STORAGE_VERSION) {
    const migrate = MIGRATIONS[version]
    if (migrate) {
      for (const key of Object.values(STORAGE_KEYS)) {
        try {
          const raw = window.localStorage.getItem(key)
          if (raw === null) continue
          const result = migrate(JSON.parse(raw))
          window.localStorage.setItem(key, JSON.stringify(result))
        } catch (error) {
          console.warn(`[storage] Migration failed for "${key}" at v${version}`, error)
        }
      }
    }
    version += 1
  }

  writeStorageMeta({ version: STORAGE_VERSION, migratedAt: new Date().toISOString() })
  return true
}
