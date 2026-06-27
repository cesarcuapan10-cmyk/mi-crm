'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trophy, XCircle, Archive, MessageCircle, Mail } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { useToast } from '@/components/ui/toast'
import { actualizarCliente, cambiarEstado } from '@/app/actions/clientes'
import { crearNota } from '@/app/actions/notas'
import { subirArchivo, eliminarArchivo } from '@/app/actions/archivos'
import { ETAPAS, TEMPERATURAS, MOTIVOS_PERDIDA } from '@/lib/constants'

interface Props {
  cliente: {
    id: string
    nombre: string
    telefono: string | null
    correo: string | null
    etapa: keyof typeof ETAPAS
    temperatura: keyof typeof TEMPERATURAS
    objecion: string | null
    valorEstimado: number | null
    retoPrincipal: string | null
    proximaAccion: string | null
  }
  archivos: { id: string; nombre: string; etiqueta: string }[]
}

export function ClienteEditor({ cliente, archivos }: Props) {
  const router = useRouter()
  const { toast } = useToast()
  const [form, setForm] = useState({
    nombre: cliente.nombre,
    telefono: cliente.telefono ?? '',
    correo: cliente.correo ?? '',
    etapa: cliente.etapa,
    temperatura: cliente.temperatura,
    objecion: cliente.objecion ?? '',
    valorEstimado: cliente.valorEstimado?.toString() ?? '',
    retoPrincipal: cliente.retoPrincipal ?? '',
    proximaAccion: cliente.proximaAccion ?? '',
  })
  const [nota, setNota] = useState('')
  const [saving, setSaving] = useState(false)

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const guardar = async () => {
    setSaving(true)
    const r = await actualizarCliente(cliente.id, {
      ...form,
      valorEstimado: form.valorEstimado ? Number(form.valorEstimado) : null,
    })
    setSaving(false)
    toast(r.success ? 'success' : 'error', r.success ? 'Guardado' : r.error ?? 'Error')
    router.refresh()
  }

  const marcar = async (estado: string, motivo?: string) => {
    const r = await cambiarEstado(cliente.id, estado, motivo)
    toast(r.success ? 'success' : 'error', r.success ? `Marcado como ${estado}` : r.error ?? 'Error')
    router.refresh()
  }

  const agregarNota = async () => {
    if (!nota.trim()) return
    const r = await crearNota({ clienteId: cliente.id, contenido: nota, tipo: 'NOTA' })
    if (r.success) {
      setNota('')
      toast('success', 'Nota agregada')
      router.refresh()
    } else toast('error', r.error ?? 'Error')
  }

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const fd = new FormData()
    fd.append('clienteId', cliente.id)
    fd.append('file', file)
    fd.append('etiqueta', 'OTRO')
    const r = await subirArchivo(fd)
    toast(r.success ? 'success' : 'error', r.success ? 'Archivo subido' : r.error ?? 'Error')
    router.refresh()
  }

  const waUrl = `https://wa.me/${(cliente.telefono ?? '').replace(/\D/g, '')}?text=${encodeURIComponent(`Hola ${cliente.nombre}, soy César de Entidad Vendedora...`)}`
  const mailUrl = `mailto:${cliente.correo ?? ''}?subject=${encodeURIComponent('Seguimiento')}&body=${encodeURIComponent(`Hola ${cliente.nombre},`)}`

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <a href={waUrl} target="_blank" rel="noreferrer">
          <Button variant="secondary" size="sm">
            <MessageCircle className="h-4 w-4" /> WhatsApp
          </Button>
        </a>
        <a href={mailUrl}>
          <Button variant="secondary" size="sm">
            <Mail className="h-4 w-4" /> Correo
          </Button>
        </a>
        <Button size="sm" onClick={() => marcar('GANADO')}>
          <Trophy className="h-4 w-4" /> Marcar ganado 🎉
        </Button>
        <Button variant="danger" size="sm" onClick={() => marcar('PERDIDO', MOTIVOS_PERDIDA[0])}>
          <XCircle className="h-4 w-4" /> Marcar perdido
        </Button>
        <Button variant="ghost" size="sm" onClick={() => marcar('ARCHIVADO')}>
          <Archive className="h-4 w-4" /> Archivar
        </Button>
      </div>

      <Card>
        <h3 className="mb-3 font-semibold">Datos del cliente</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Nombre" value={form.nombre} onChange={(e) => set('nombre', e.target.value)} />
          <Input label="Teléfono" value={form.telefono} onChange={(e) => set('telefono', e.target.value)} />
          <Input label="Correo" value={form.correo} onChange={(e) => set('correo', e.target.value)} />
          <Select label="Etapa" value={form.etapa} onChange={(e) => set('etapa', e.target.value)}>
            {Object.entries(ETAPAS).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
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
          <Input label="Valor estimado" type="number" value={form.valorEstimado} onChange={(e) => set('valorEstimado', e.target.value)} />
          <Input label="Reto principal" value={form.retoPrincipal} onChange={(e) => set('retoPrincipal', e.target.value)} />
          <Input label="Objeción" value={form.objecion} onChange={(e) => set('objecion', e.target.value)} />
          <Input label="Próxima acción" value={form.proximaAccion} onChange={(e) => set('proximaAccion', e.target.value)} />
        </div>
        <Button className="mt-4" loading={saving} onClick={guardar}>
          Guardar cambios
        </Button>
      </Card>

      <Card>
        <h3 className="mb-3 font-semibold">Agregar nota</h3>
        <textarea value={nota} onChange={(e) => setNota(e.target.value)} className="input-base mb-2" rows={2} placeholder="Escribe una nota de seguimiento..." />
        <Button size="sm" onClick={agregarNota}>
          Agregar
        </Button>
      </Card>

      <Card>
        <h3 className="mb-3 font-semibold">Archivos</h3>
        <input type="file" onChange={onUpload} className="mb-3 text-sm" />
        <ul className="space-y-1 text-sm">
          {archivos.map((a) => (
            <li key={a.id} className="flex items-center justify-between rounded-lg bg-[var(--bg-secondary)] px-3 py-2">
              <a href={`/api/archivos/${a.id}`} target="_blank" rel="noreferrer" className="text-[var(--color-marca-dark)] hover:underline">
                {a.nombre}
              </a>
              <button
                onClick={async () => {
                  await eliminarArchivo(a.id, cliente.id)
                  router.refresh()
                }}
                className="text-xs text-red-500"
              >
                Eliminar
              </button>
            </li>
          ))}
          {archivos.length === 0 && <li className="text-secondary">Sin archivos.</li>}
        </ul>
      </Card>
    </div>
  )
}
