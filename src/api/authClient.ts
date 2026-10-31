// Client Better Auth (React). baseURL absolut same-origin — di dev /api/auth
// diteruskan proxy Vite ke localhost:3001 sehingga cookie session berlaku;
// di produksi FE+BE berada di satu origin (reverse proxy).
import { createAuthClient } from 'better-auth/react'
import { adminClient } from 'better-auth/client/plugins'

export const authClient = createAuthClient({
  baseURL: `${window.location.origin}/api/auth`,
  plugins: [adminClient()],
  fetchOptions: { credentials: 'include' as RequestCredentials },
})

export type SessionUser = typeof authClient.$Infer.Session.user
export type UserRole = 'admin' | 'user'
