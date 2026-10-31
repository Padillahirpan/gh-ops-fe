// Hook sesi & hak edit untuk seluruh FE.
// - Mode API: sesi dari Better Auth; hanya role 'admin' boleh mengubah data.
// - Mode localStorage (demo tanpa server): selalu boleh edit.
import { authClient, type SessionUser } from '@/api/authClient'
import { USE_API } from '@/api/client'

interface AuthSessionState {
  user: SessionUser | null
  isPending: boolean
  isAdmin: boolean
  /** True bila user boleh menulis data (admin, atau mode non-API). */
  canEdit: boolean
}

export function useAuthSession(): AuthSessionState {
  // Hook dipanggil tanpa syarat (aturan hooks); efek network hanya relevan di mode API.
  const { data, isPending } = authClient.useSession()

  if (!USE_API) {
    return { user: null, isPending: false, isAdmin: true, canEdit: true }
  }

  const user = (data?.user ?? null) as SessionUser | null
  const isAdmin = user?.role === 'admin'
  return { user, isPending, isAdmin, canEdit: isAdmin }
}
