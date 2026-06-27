'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import { crearUsuario, desactivarUsuario, resetPassword } from '@/app/actions/usuarios'

type Usuario = { id: string; nombre: string; email: string; rol: string }
type Auditoria = { id: string; accion: string; entidad: string; creadoEn: Date; usuario: { nombre: string } | null }

export function AdminPanel({ usuarios, auditoria }: { usuarios: Usuario[]; auditoria: Auditoria[] }) {
  const router = useRouter()
  const { toast } = useToast()
  const [form, setForm] = useState({ nombre: '', email: '', password: '', rol: 'VENDEDOR', metaMes: '30' })

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const crear = async () => {
    const r = await crearUsuario({ ...form, metaMes: Number(form.metaMes) })
    if (r.success) {
      toast('success', 'Usuario creado')
      setForm({ nombre: '', email: '', password: '', rol: 'VENDEDOR', metaMes: '30' })
      router.refresh()
    } else toast('error', r.error ?? 'Error')
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Administración</h1>

      <Card>
        <h3 className="mb-3 font-semibold">Agregar usuario</h3>
        <div className="grid gap-3 md:grid-cols-2">
          <Input label="Nombre" value={form.nombre} onChange={(e) => set('nombre', e.target.value)} />
          <Input label="Correo" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} />
          <Input label="Contraseña" type="password" value={form.password} onChange={(e) => set('password', e.target.value)} />
          <Select label="Rol" value={form.rol} onChange={(e) => set('rol', e.target.value)}>
            <option value="VENDEDOR">Vendedor</option>
            <option value="ADMIN">Admin</option>
            <option value="SOLO_LECTURA">Solo lectura</option>
          </Select>
          <Input label="Meta mensual" type="number" value={form.metaMes} onChange={(e) => set('metaMes', e.target.value)} />
        </div>
        <Button className="mt-3" onClick={crear}>
          Crear usuario
        </Button>
      </Card>

      <Card>
        <h3 className="mb-3 font-semibold">Usuarios</h3>
        <ul className="space-y-2 text-sm">
          {usuarios.map((u) => (
            <li key={u.id} className="flex items-center justify-between rounded-lg bg-[var(--bg-secondary)] px-3 py-2">
              <span>
                {u.nombre} · {u.email} · <span className="text-secondary">{u.rol}</span>
              </span>
              <div className="flex gap-3">
                <button
                  className="text-xs text-blue-600"
                  onClick={async () => {
                    const nueva = prompt('Nueva contraseña (mín. 6):')
                    if (!nueva) return
                    const r = await resetPassword(u.id, nueva)
                    toast(r.success ? 'success' : 'error', r.success ? 'Contraseña actualizada' : r.error ?? 'Error')
                  }}
                >
                  Reset contraseña
                </button>
                <button
                  className="text-xs text-red-500"
                  onClick={async () => {
                    if (!confirm('¿Desactivar usuario?')) return
                    await desactivarUsuario(u.id)
                    router.refresh()
                  }}
                >
                  Desactivar
                </button>
              </div>
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <h3 className="mb-3 font-semibold">Registro de auditoría</h3>
        <ul className="space-y-1 text-sm">
          {auditoria.map((a) => (
            <li key={a.id} className="text-secondary">
              {a.usuario?.nombre ?? 'Sistema'} · {a.accion} {a.entidad} · {new Date(a.creadoEn).toLocaleString('es-MX')}
            </li>
          ))}
          {auditoria.length === 0 && <li className="text-secondary">Sin registros.</li>}
        </ul>
      </Card>
    </div>
  )
}
