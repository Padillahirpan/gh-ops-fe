export class StorageReadError extends Error {
  constructor(key: string, cause: unknown) {
    super(`Failed to read "${key}" from localStorage: ${String(cause)}`)
    this.name = 'StorageReadError'
  }
}

export class StorageWriteError extends Error {
  constructor(key: string, cause: unknown) {
    super(`Failed to write "${key}" to localStorage: ${String(cause)}`)
    this.name = 'StorageWriteError'
  }
}

function isLocalStorageAvailable(): boolean {
  try {
    const testKey = '__hydro_storage_test__'
    window.localStorage.setItem(testKey, '1')
    window.localStorage.removeItem(testKey)
    return true
  } catch {
    return false
  }
}

const memoryFallback = new Map<string, string>()
const localStorageAvailable =
  typeof window !== 'undefined' && isLocalStorageAvailable()

export function getItemRaw(key: string): string | null {
  if (localStorageAvailable) {
    try {
      return window.localStorage.getItem(key)
    } catch (error) {
      throw new StorageReadError(key, error)
    }
  }
  return memoryFallback.get(key) ?? null
}

export function setItemRaw(key: string, value: string): void {
  if (localStorageAvailable) {
    try {
      window.localStorage.setItem(key, value)
      return
    } catch (error) {
      throw new StorageWriteError(key, error)
    }
  }
  memoryFallback.set(key, value)
}

export function removeItemRaw(key: string): void {
  if (localStorageAvailable) {
    try {
      window.localStorage.removeItem(key)
      return
    } catch (error) {
      throw new StorageWriteError(key, error)
    }
  }
  memoryFallback.delete(key)
}

export function getItem<T>(key: string, fallback: T): T {
  try {
    const raw = getItemRaw(key)
    if (raw === null) return fallback
    return JSON.parse(raw) as T
  } catch (error) {
    if (error instanceof StorageReadError) throw error
    console.warn(`[storage] Corrupted JSON at "${key}", returning fallback`, error)
    return fallback
  }
}

export function setItem<T>(key: string, value: T): void {
  setItemRaw(key, JSON.stringify(value))
}

export function removeItem(key: string): void {
  removeItemRaw(key)
}

export function hasItem(key: string): boolean {
  try {
    return getItemRaw(key) !== null
  } catch {
    return false
  }
}
