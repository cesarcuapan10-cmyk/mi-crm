'use client'

import { useEffect, useState } from 'react'
import { Bell } from 'lucide-react'
import {
  getRecordatoriosPendientes,
  completarRecordatorio,
  posponerRecordatorio,
} from '@/app/actions/recordatorios'

type Recordatorio = Awaited<ReturnType<typeof getRecordatoriosPendientes>>[number]

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<Recordatorio[]>([])

  const load = async () => setItems(await getRecordatoriosPendientes())

  useEffect(() => {
    load()
  }, [])

  const handle = async (id: string, action: 'completar' | 'posponer') => {
    if (action === 'completar') await completarRecordatorio(id)
    else await posponerRecordatorio(id)
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  return (
    <div className="relative">
      <button onClick={() => setOpen((o) => !o)} className="relative rounded-lg p-2 hover:bg-[var(--bg-secondary)]">
        <Bell className="h-5 w-5" />
        {items.length > 0 && (
          <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
            {items.length}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] p-2 shadow-lg">
          <p className="px-2 py-1 text-sm font-semibold">Recordatorios</p>
          {items.length === 0 ? (
            <p className="px-2 py-3 text-sm text-secondary">Sin recordatorios pendientes.</p>
          ) : (
            items.map((r) => (
              <div key={r.id} className="rounded-lg p-2 hover:bg-[var(--bg-secondary)]">
                <p className="text-sm">{r.texto}</p>
                {r.cliente && <p className="text-xs text-secondary">{r.cliente.nombre}</p>}
                <div className="mt-1 flex gap-2">
                  <button onClick={() => handle(r.id, 'completar')} className="text-xs text-green-600">
                    Hecho
                  </button>
                  <button onClick={() => handle(r.id, 'posponer')} className="text-xs text-blue-600">
                    Posponer 1 día
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
