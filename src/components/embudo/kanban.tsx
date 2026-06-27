'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { DndContext, DragEndEvent, useDraggable, useDroppable, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { cambiarEtapa } from '@/app/actions/clientes'
import { useToast } from '@/components/ui/toast'
import { ETAPAS, TEMPERATURAS } from '@/lib/constants'
import { formatMoneda, diasSinContacto } from '@/lib/format'

type Cliente = {
  id: string
  nombre: string
  etapa: string
  temperatura: keyof typeof TEMPERATURAS
  valorEstimado: number | null
  ultimoContacto: string | null
  fechaProximaAccion: string | null
}

const COLUMNAS = ['NUEVO', 'CONTACTADO', 'CITA_AGENDADA', 'PROPUESTA_ENVIADA', 'GANADO'] as const

function Tarjeta({ c }: { c: Cliente }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: c.id })
  const style = transform ? { transform: `translate(${transform.x}px, ${transform.y}px)` } : undefined
  const dias = diasSinContacto(c.ultimoContacto)
  const vencida = c.fechaProximaAccion && new Date(c.fechaProximaAccion) < new Date()
  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="card cursor-grab p-3 active:cursor-grabbing">
      <Link href={`/clientes/${c.id}`} className="font-medium text-[var(--color-marca-dark)] hover:underline" onClick={(e) => e.stopPropagation()}>
        {c.nombre}
      </Link>
      <div className="mt-1 flex items-center justify-between text-xs">
        <span>{formatMoneda(c.valorEstimado)}</span>
        <span>{TEMPERATURAS[c.temperatura].emoji}</span>
      </div>
      {dias != null && dias > 7 && <p className="mt-1 text-xs text-amber-600">🕒 {dias} días</p>}
      {vencida && <p className="mt-1 text-xs text-red-500">Acción vencida</p>}
    </div>
  )
}

function Columna({ etapa, clientes }: { etapa: string; clientes: Cliente[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: etapa })
  const suma = clientes.reduce((s, c) => s + (c.valorEstimado ?? 0), 0)
  const info = ETAPAS[etapa as keyof typeof ETAPAS]
  return (
    <div ref={setNodeRef} className={`flex w-64 shrink-0 flex-col gap-2 rounded-xl p-2 ${isOver ? 'bg-[var(--color-marca-light)]/30' : 'bg-[var(--bg-secondary)]'}`}>
      <div className="px-1">
        <p className="text-sm font-semibold">
          {info.icon} {info.label} ({clientes.length})
        </p>
        <p className="text-xs text-secondary">{formatMoneda(suma)}</p>
      </div>
      {clientes.map((c) => (
        <Tarjeta key={c.id} c={c} />
      ))}
    </div>
  )
}

export function Kanban({ clientes }: { clientes: Cliente[] }) {
  const router = useRouter()
  const { toast } = useToast()
  const [items, setItems] = useState(clientes)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const onDragEnd = async (e: DragEndEvent) => {
    const id = e.active.id as string
    const nuevaEtapa = e.over?.id as string | undefined
    if (!nuevaEtapa) return
    const cliente = items.find((c) => c.id === id)
    if (!cliente || cliente.etapa === nuevaEtapa) return
    setItems((prev) => prev.map((c) => (c.id === id ? { ...c, etapa: nuevaEtapa } : c)))
    const r = await cambiarEtapa(id, nuevaEtapa)
    if (!r.success) {
      toast('error', r.error ?? 'Error')
      router.refresh()
    }
  }

  return (
    <DndContext sensors={sensors} onDragEnd={onDragEnd}>
      <div className="flex gap-3 overflow-x-auto pb-4">
        {COLUMNAS.map((col) => (
          <Columna key={col} etapa={col} clientes={items.filter((c) => c.etapa === col)} />
        ))}
      </div>
    </DndContext>
  )
}
