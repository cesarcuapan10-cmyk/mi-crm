'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { registrarLead } from '@/app/actions/landing'

export function LandingForm() {
  const params = useSearchParams()
  const [form, setForm] = useState({ nombre: '', telefono: '', correo: '' })
  const [enviado, setEnviado] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const r = await registrarLead({ ...form, utmSource: params.get('utm_source') ?? undefined })
    setLoading(false)
    if (r.success) setEnviado(true)
    else setError(r.error ?? 'Error')
  }

  if (enviado) {
    return (
      <div className="rounded-lg bg-green-100 p-4 text-center text-green-800">
        <p className="font-semibold">¡Gracias por tu interés! 🎉</p>
        <p className="mt-1 text-sm">César te contactará muy pronto para agendar tu sesión.</p>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <input className="input-base" placeholder="Tu nombre" value={form.nombre} onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))} required />
      <input className="input-base" placeholder="WhatsApp" value={form.telefono} onChange={(e) => setForm((f) => ({ ...f, telefono: e.target.value }))} required />
      <input className="input-base" type="email" placeholder="Correo (opcional)" value={form.correo} onChange={(e) => setForm((f) => ({ ...f, correo: e.target.value }))} />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button type="submit" disabled={loading} className="btn-marca w-full">
        {loading ? 'Enviando...' : 'Quiero mi sesión gratuita'}
      </button>
    </form>
  )
}
