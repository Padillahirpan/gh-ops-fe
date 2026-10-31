import { useState } from 'react'
import { Leaf, Loader2, LogIn } from 'lucide-react'
import { authClient } from '@/api/authClient'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorText, setErrorText] = useState<string | undefined>(undefined)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (submitting) return
    setErrorText(undefined)
    setSubmitting(true)
    try {
      const { error } = await authClient.signIn.email({
        email: email.trim(),
        password,
      })
      if (error) {
        setErrorText(
          error.code === 'INVALID_EMAIL_OR_PASSWORD'
            ? 'Email atau password salah'
            : (error.message ?? 'Gagal login'),
        )
      }
      // Sukses: useSession di App.tsx otomatis re-render ke halaman utama.
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg-app)] p-6">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <span
            className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-tandon-t1)]/15 text-[var(--color-tandon-t1)]"
            aria-hidden
          >
            <Leaf className="h-7 w-7" />
          </span>
          <div>
            <h1 className="font-serif text-2xl font-bold tracking-tight text-[var(--text-primary)]">
              Selada Ops
            </h1>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Masuk untuk melanjutkan ke dashboard greenhouse
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] p-6 shadow-sm"
          noValidate
        >
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={submitting}
          />
          <Input
            label="Password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            errorText={errorText}
            disabled={submitting}
          />
          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={submitting || email.length === 0 || password.length === 0}
            leftIcon={
              submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <LogIn className="h-4 w-4" aria-hidden />
              )
            }
          >
            {submitting ? 'Memproses…' : 'Masuk'}
          </Button>
          <p className="text-center text-xs text-[var(--text-muted)]">
            Akun dibuat oleh Admin. Hubungi Admin bila belum punya akses.
          </p>
        </form>
      </div>
    </div>
  )
}
