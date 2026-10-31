export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001/api'

export const USE_API = import.meta.env.VITE_USE_API === 'true'

export interface ApiErrorDetail {
  path: string
  message: string
}

/** Error terstruktur dari envelope `{ error: { code, message, details? } }` milik backend. */
export class ApiError extends Error {
  readonly status: number
  readonly code: string
  readonly details: ApiErrorDetail[] | undefined

  constructor(status: number, code: string, message: string, details?: ApiErrorDetail[]) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }
}

interface ErrorEnvelope {
  error: {
    code: string
    message: string
    details?: ApiErrorDetail[]
  }
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response
  try {
    // credentials include: cookie session auth ikut terkirim (same-origin via proxy).
    const options: RequestInit =
      init?.body !== undefined
        ? { credentials: 'include', ...init, headers: { 'Content-Type': 'application/json' } }
        : { credentials: 'include', ...init }
    response = await fetch(`${API_BASE_URL}${path}`, options)
  } catch {
    throw new ApiError(
      0,
      'NETWORK_ERROR',
      `Tidak dapat terhubung ke server API (${API_BASE_URL}). Pastikan backend berjalan.`,
    )
  }

  if (response.status === 204) {
    return undefined as T
  }

  const body: unknown = await response.json().catch(() => null)
  if (!response.ok) {
    const envelope = body as ErrorEnvelope | null
    throw new ApiError(
      response.status,
      envelope?.error.code ?? 'UNKNOWN',
      envelope?.error.message ?? `Permintaan gagal (HTTP ${response.status})`,
      envelope?.error.details,
    )
  }
  return body as T
}

/** Pesan ramah-user untuk toast: pesan envelope + detail validasi pertama (jika ada). */
export function getApiErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    const firstDetail = error.details?.[0]
    return firstDetail ? `${error.message}: ${firstDetail.message}` : error.message
  }
  if (error instanceof Error) return error.message
  return 'Terjadi kesalahan tak terduga'
}
