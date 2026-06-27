'use client'

import { useState } from 'react'
import { crearCitaPublica } from '@/app/actions/citas'

const horas = ['09:00', '09:45', '10:30', '11:15', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00']

export function AgendaPublicaForm({ vendedorId }: { vendedorId: string }) {
  const [form, setForm] = useState({ nombre: '', telefono: '', correo: '', dia: '', hora: '' })
  const [enviado, setEnviado] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.dia || !form.hora) {
      setError('Selecciona día y hora')
      return
    }
    setLoading(true)
    setError('')
    const fecha = `${form.dia}T${form.hora}:00`
    const r = await crearCitaPublica({ vendedorId, nombre: form.nombre, telefono: form.telefono, correo: form.correo, fecha })
    setLoading(false)
    if (r.success) setEnviado(true)
    else setError(r.error ?? 'Error')
  }

  if (enviado) {
    return (
      <div className="rounded-lg bg-green-100 p-4 text-center text-green-800">
        <p className="font-semibold">¡Cita agendada! 🎉</p>
        <p className="mt-1 text-sm">Te contactaremos para confirmar.</p>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <input className="input-base" placeholder="Tu nombre" value={form.nombre} onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))} required />
      <input className="input-base" placeholder="WhatsApp" value={form.telefono} onChange={(e) => setForm((f) => ({ ...f, telefono: e.target.value }))} required />
      <input className="input-base" type="email" placeholder="Correo (opcional)" value={form.correo} onChange={(e) => setForm((f) => ({ ...f, correo: e.target.value }))} />
      <input className="input-base" type="date" value={form.dia} onChange={(e) => setForm((f) => ({ ...f, dia: e.target.value }))} required />
      <div>
        <p className="mb-1 text-sm font-medium">Horarios disponibles</p>
        <div className="grid grid-cols-4 gap-2">
          {horas.map((h) => (
            <button
              type="button"
              key={h}
              onClick={() => setForm((f) => ({ ...f, hora: h }))}
              className={`rounded-lg border px-2 py-1 text-sm ${form.hora === h ? 'border-[var(--color-marca)] bg-[var(--color-marca)] text-neutral-900' : 'border-[var(--border)]'}`}
            >
              {h}
            </button>
          ))}
        </div>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button type="submit" disabled={loading} className="btn-marca w-full">
        {loading ? 'Agendando...' : 'Confirmar cita'}
      </button>
    </form>
  )
}
