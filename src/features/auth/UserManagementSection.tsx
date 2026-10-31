// Manajemen user (khusus Admin) — list, tambah, ubah role, hapus akun.
// Pendaftaran mandiri dimatikan di server; akun hanya dibuat dari sini.
import { useCallback, useEffect, useState } from 'react'
import { Trash2, UserPlus, Users } from 'lucide-react'
import { authClient } from '@/api/authClient'
import { toast } from '@/store/useToastStore'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'

interface AdminUserRow {
  id: string
  name: string
  email: string
  role: string
}

// Query list user stabil di level module (tidak perlu re-render).
const LIST_QUERY = {
  query: { limit: 100, sortBy: 'createdAt', sortDirection: 'desc' as const },
}

export function UserManagementSection({ currentUserId }: { currentUserId: string }) {
  const [users, setUsers] = useState<AdminUserRow[]>([])
  const [loaded, setLoaded] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<AdminUserRow | null>(null)

  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newRole, setNewRole] = useState<'user' | 'admin'>('user')
  const [creating, setCreating] = useState(false)

  type ListResult = Awaited<ReturnType<typeof authClient.admin.listUsers>>

  const applyResult = useCallback((result: ListResult) => {
    const { data, error } = result
    if (error) {
      toast.error('Gagal memuat daftar user', error.message ?? 'Coba muat ulang halaman')
      setLoaded(true)
      return
    }
    setUsers(
      (data?.users ?? []).map(
        (u: { id: string; name: string; email: string; role?: string | null }) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: (u.role ?? 'user') as string,
        }),
      ),
    )
    setLoaded(true)
  }, [])

  const refresh = useCallback(async () => {
    applyResult(await authClient.admin.listUsers(LIST_QUERY))
  }, [applyResult])

  useEffect(() => {
    // .then: setState dieksekusi asinkron, tidak sinkron di body effect.
    authClient.admin.listUsers(LIST_QUERY).then(applyResult)
  }, [applyResult])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (creating) return
    setCreating(true)
    const { error } = await authClient.admin.createUser({
      name: newName.trim(),
      email: newEmail.trim().toLowerCase(),
      password: newPassword,
      role: newRole,
    })
    setCreating(false)
    if (error) {
      toast.error('Gagal membuat user', error.message ?? 'Periksa kembali data')
      return
    }
    toast.success('User dibuat', `${newEmail.trim()} (${newRole})`)
    setNewName('')
    setNewEmail('')
    setNewPassword('')
    setNewRole('user')
    void refresh()
  }

  async function handleRoleChange(user: AdminUserRow, role: 'user' | 'admin') {
    const { error } = await authClient.admin.setRole({ userId: user.id, role })
    if (error) {
      toast.error('Gagal mengubah role', error.message ?? undefined)
      return
    }
    toast.success('Role diperbarui', `${user.email} → ${role}`)
    void refresh()
  }

  async function handleDelete() {
    if (!deleteTarget) return
    const target = deleteTarget
    setDeleteTarget(null)
    const { error } = await authClient.admin.removeUser({ userId: target.id })
    if (error) {
      toast.error('Gagal menghapus user', error.message ?? undefined)
      return
    }
    toast.success('User dihapus', target.email)
    void refresh()
  }

  return (
    <Card>
      <CardHeader
        title="Manajemen User"
        subtitle="Kelola akun Admin dan User — hanya Admin yang dapat mengubah data operasional"
      />
      <CardBody className="space-y-6">
        <form
          onSubmit={handleCreate}
          className="grid gap-3 rounded-md border border-[var(--border-default)] p-4 sm:grid-cols-2 lg:grid-cols-5"
        >
          <Input
            label="Nama"
            required
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            disabled={creating}
          />
          <Input
            label="Email"
            type="email"
            required
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            disabled={creating}
          />
          <Input
            label="Password"
            type="password"
            required
            helperText="Minimal 8 karakter"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={creating}
          />
          <Select
            label="Role"
            value={newRole}
            onChange={(e) => setNewRole(e.target.value === 'admin' ? 'admin' : 'user')}
            disabled={creating}
            options={[
              { value: 'user', label: 'User (lihat-saja)' },
              { value: 'admin', label: 'Admin (penuh)' },
            ]}
          />
          <div className="flex items-end">
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={creating || newName.length === 0 || newEmail.length === 0 || newPassword.length === 0}
              leftIcon={<UserPlus className="h-4 w-4" aria-hidden />}
            >
              Tambah User
            </Button>
          </div>
        </form>

        <div className="overflow-x-auto rounded-md border border-[var(--border-default)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border-default)] bg-[var(--bg-surface-hover)] text-left text-[var(--text-muted)]">
                <th scope="col" className="px-4 py-3 font-medium">Nama</th>
                <th scope="col" className="px-4 py-3 font-medium">Email</th>
                <th scope="col" className="px-4 py-3 font-medium">Role</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-[var(--border-default)] last:border-b-0">
                  <td className="px-4 py-3 font-medium text-[var(--text-primary)]">
                    {u.name}
                    {u.id === currentUserId && (
                      <span className="ml-2 text-xs text-[var(--text-muted)]">(Anda)</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{u.email}</td>
                  <td className="px-4 py-3">
                    <div
                      role="group"
                      aria-label={`Role user ${u.email}`}
                      className="inline-flex rounded-md border border-[var(--border-default)] bg-[var(--bg-surface-hover)] p-0.5"
                    >
                      {(['user', 'admin'] as const).map((r) => (
                        <button
                          key={r}
                          type="button"
                          aria-pressed={u.role === r}
                          disabled={u.id === currentUserId}
                          onClick={() => void handleRoleChange(u, r)}
                          className={[
                            'h-8 rounded px-3 text-xs font-medium transition-colors',
                            u.role === r
                              ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm ring-1 ring-[var(--border-strong)]'
                              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]',
                            u.id === currentUserId ? 'cursor-not-allowed opacity-50' : '',
                          ].join(' ')}
                        >
                          {r === 'user' ? 'User' : 'Admin'}
                        </button>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label={`Hapus user ${u.email}`}
                      disabled={u.id === currentUserId}
                      onClick={() => setDeleteTarget(u)}
                    >
                      <Trash2 className="h-4 w-4 text-[var(--status-danger)]" aria-hidden />
                    </Button>
                  </td>
                </tr>
              ))}
              {!users.length && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-[var(--text-muted)]">
                    {loaded ? (
                      <span className="inline-flex items-center gap-2">
                        <Users className="h-4 w-4" aria-hidden /> Belum ada user lain
                      </span>
                    ) : (
                      'Memuat daftar user…'
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardBody>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Hapus User"
        body={`${deleteTarget?.email ?? ''} tidak akan bisa login lagi. Lanjutkan?`}
        confirmLabel="Hapus User"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </Card>
  )
}
