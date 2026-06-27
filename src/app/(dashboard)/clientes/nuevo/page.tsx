'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import { crearCliente, buscarDuplicados } from '@/app/actions/clientes'
import { ORIGENES, TEMPERATURAS } from '@/lib/constants'

export default function NuevoClientePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [dups, setDups] = useState<{ id: string; nombre: string }[]>([])
  const [form, setForm] = useState({
    nombre: '',
    telefono: '',
    correo: '',
    origen: '',
    temperatura: 'TIBIO',
    empresaNombre: '',
    valorEstimado: '',
    retoPrincipal: '',
    objecion: '',
    notas: '',
  })

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const checkDup = async () => {
    if (!form.telefono && !form.correo) return
    const r = await buscarDuplicados(form.telefono || undefined, form.correo || undefined)
    setDups(r)
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const r = await crearCliente({ ...form, valorEstimado: form.valorEstimado ? Number(form.valorEstimado) : null })
    setLoading(false)
    if (r.success) {
      toast('success', 'Cliente creado')
      router.push('/clientes')
    } else {
      toast('error', r.error ?? 'Error')
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-semibold">Nuevo cliente</h1>
      <Card>
        <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
          <Input label="Nombre *" value={form.nombre} onChange={(e) => set('nombre', e.target.value)} required />
          <Input label="Teléfono" value={form.telefono} onChange={(e) => set('telefono', e.target.value)} onBlur={checkDup} />
          <Input label="Correo" type="email" value={form.correo} onChange={(e) => set('correo', e.target.value)} onBlur={checkDup} />
          <Select label="Origen" value={form.origen} onChange={(e) => set('origen', e.target.value)}>
            <option value="">Selecciona</option>
            {ORIGENES.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </Select>
          <Select label="Temperatura" value={form.temperatura} onChange={(e) => set('temperatura', e.target.value)}>
            {Object.entries(TEMPERATURAS).map(([k, v]) => (
              <option key={k} value={k}>
                {v.emoji} {v.label}
              </option>
            ))}
          </Select>
          <Input label="Empresa" value={form.empresaNombre} onChange={(e) => set('empresaNombre', e.target.value)} />
          <Input label="Valor estimado" type="number" value={form.valorEstimado} onChange={(e) => set('valorEstimado', e.target.value)} />
          <Input label="Reto principal" value={form.retoPrincipal} onChange={(e) => set('retoPrincipal', e.target.value)} />
          <div className="md:col-span-2">
            <Input label="Objeción" value={form.objecion} onChange={(e) => set('objecion', e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium">Notas</label>
            <textarea value={form.notas} onChange={(e) => set('notas', e.target.value)} className="input-base" rows={3} />
          </div>

          {dups.length > 0 && (
            <div className="md:col-span-2 rounded-lg bg-yellow-100 p-3 text-sm text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200">
              Posibles duplicados: {dups.map((d) => d.nombre).join(', ')}
            </div>
          )}

          <div className="md:col-span-2 flex gap-2">
            <Button type="submit" loading={loading}>
              Guardar
            </Button>
            <Button type="button" variant="ghost" onClick={() => router.back()}>
              Cancelar
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
