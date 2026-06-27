'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Star, Copy, Trash2, Plus } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { useToast } from '@/components/ui/toast'
import { crearPlantilla, duplicarPlantilla, eliminarPlantilla, toggleFavoritaPlantilla } from '@/app/actions/plantillas'
import { PLANTILLAS_BASE } from '@/lib/plantillas-base'

type Plantilla = { id: string; nombre: string; contenido: string; etapa: string | null; tipo: string | null; esFavorita: boolean }

const ejemplo = { nombre: 'Ana López', empresa: 'Consultoría AL', etapa: 'Propuesta', valor: '$15,000', vendedor: 'César', objecion: 'el precio' }

function render(txt: string) {
  return txt
    .replaceAll('{nombre}', ejemplo.nombre)
    .replaceAll('{empresa}', ejemplo.empresa)
    .replaceAll('{etapa}', ejemplo.etapa)
    .replaceAll('{valor}', ejemplo.valor)
    .replaceAll('{vendedor}', ejemplo.vendedor)
    .replaceAll('{objecion}', ejemplo.objecion)
}

export function PlantillasManager({ mias }: { mias: Plantilla[] }) {
  const router = useRouter()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [form, setForm] = useState({ nombre: '', contenido: '' })

  const crear = async () => {
    const r = await crearPlantilla({ ...form, canal: 'WHATSAPP' })
    if (r.success) {
      toast('success', 'Plantilla creada')
      setOpen(false)
      setForm({ nombre: '', contenido: '' })
      router.refresh()
    } else toast('error', r.error ?? 'Error')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Plantillas</h1>
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> Nueva plantilla
        </Button>
      </div>

      <section>
        <h2 className="mb-3 font-semibold">Mis plantillas ({mias.length})</h2>
        {mias.length === 0 ? (
          <p className="text-sm text-secondary">Aún no tienes plantillas propias.</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {mias.map((p) => (
              <Card key={p.id}>
                <div className="mb-1 flex items-center justify-between">
                  <h3 className="font-medium">{p.nombre}</h3>
                  <div className="flex gap-2">
                    <button onClick={async () => { await toggleFavoritaPlantilla(p.id, !p.esFavorita); router.refresh() }}>
                      <Star className={`h-4 w-4 ${p.esFavorita ? 'fill-[var(--color-marca)] text-[var(--color-marca)]' : 'text-secondary'}`} />
                    </button>
                    <button onClick={async () => { await duplicarPlantilla(p.id); router.refresh() }}>
                      <Copy className="h-4 w-4 text-secondary" />
                    </button>
                    <button onClick={async () => { await eliminarPlantilla(p.id); router.refresh() }}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-secondary">{p.contenido}</p>
                <button onClick={() => setPreview(render(p.contenido))} className="mt-2 text-xs text-[var(--color-marca-dark)]">
                  Vista previa
                </button>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 font-semibold">Plantillas precargadas ({PLANTILLAS_BASE.length})</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {PLANTILLAS_BASE.map((p) => (
            <Card key={p.nombre}>
              <div className="mb-1 flex items-center justify-between">
                <h3 className="font-medium">{p.nombre}</h3>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={async () => {
                    await crearPlantilla({ nombre: p.nombre, contenido: p.contenido, canal: 'WHATSAPP', etapa: p.etapa, tipo: p.tipo })
                    toast('success', 'Agregada a tus plantillas')
                    router.refresh()
                  }}
                >
                  Usar
                </Button>
              </div>
              <p className="text-sm text-secondary">{p.contenido}</p>
              <button onClick={() => setPreview(render(p.contenido))} className="mt-2 text-xs text-[var(--color-marca-dark)]">
                Vista previa
              </button>
            </Card>
          ))}
        </div>
      </section>

      <Modal open={open} onClose={() => setOpen(false)} title="Nueva plantilla">
        <div className="space-y-3">
          <Input label="Nombre" value={form.nombre} onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))} />
          <div>
            <label className="mb-1 block text-sm font-medium">Contenido</label>
            <textarea value={form.contenido} onChange={(e) => setForm((f) => ({ ...f, contenido: e.target.value }))} className="input-base" rows={4} />
            <p className="mt-1 text-xs text-secondary">Variables: {'{nombre} {empresa} {etapa} {valor} {vendedor} {objecion}'}</p>
          </div>
          <Button onClick={crear}>Guardar</Button>
        </div>
      </Modal>

      <Modal open={!!preview} onClose={() => setPreview(null)} title="Vista previa">
        <p className="whitespace-pre-wrap rounded-lg bg-[var(--bg-secondary)] p-3 text-sm">{preview}</p>
      </Modal>
    </div>
  )
}
