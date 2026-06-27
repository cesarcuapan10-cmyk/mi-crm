'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import { crearCita } from '@/app/actions/citas'

export function CitaForm({ clientes }: { clientes: { id: string; nombre: string }[] }) {
  const router = useRouter()
  const { toast } = useToast()
  const [form, setForm] = useState({ clienteId: '', titulo: 'Cita de diagnóstico', fecha: '', duracion: '45' })
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const r = await crearCita({ ...form, duracion: Number(form.duracion) })
    setLoading(false)
    if (r.success) {
      toast('success', 'Cita agendada')
      setForm({ clienteId: '', titulo: 'Cita de diagnóstico', fecha: '', duracion: '45' })
      router.refresh()
    } else toast('error', r.error ?? 'Error')
  }

  return (
    <Card>
      <h3 className="mb-3 font-semibold">Agendar cita</h3>
      <form onSubmit={submit} className="grid gap-3 md:grid-cols-2">
        <Select label="Cliente" value={form.clienteId} onChange={(e) => setForm((f) => ({ ...f, clienteId: e.target.value }))} required>
          <option value="">Selecciona</option>
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </Select>
        <Input label="Título" value={form.titulo} onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))} />
        <Input label="Fecha y hora" type="datetime-local" value={form.fecha} onChange={(e) => setForm((f) => ({ ...f, fecha: e.target.value }))} required />
        <Input label="Duración (min)" type="number" value={form.duracion} onChange={(e) => setForm((f) => ({ ...f, duracion: e.target.value }))} />
        <div className="md:col-span-2">
          <Button type="submit" loading={loading}>
            Agendar
          </Button>
        </div>
      </form>
    </Card>
  )
}
