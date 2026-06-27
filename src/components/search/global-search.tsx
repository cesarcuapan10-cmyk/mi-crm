'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Users, Building2 } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { buscarGlobal } from '@/app/actions/buscar'

type Resultados = Awaited<ReturnType<typeof buscarGlobal>>

export function GlobalSearch() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [res, setRes] = useState<Resultados>({ clientes: [], empresas: [], pagos: [] })
  const router = useRouter()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(true)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (!open) return
    const t = setTimeout(async () => {
      const r = await buscarGlobal(query)
      setRes(r)
    }, 250)
    return () => clearTimeout(t)
  }, [query, open])

  const go = (href: string) => {
    setOpen(false)
    setQuery('')
    router.push(href)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-1.5 text-sm text-secondary hover:bg-[var(--bg-secondary)]"
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">Buscar...</span>
        <kbd className="hidden rounded bg-[var(--bg-secondary)] px-1.5 text-xs sm:inline">⌘K</kbd>
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Buscar">
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cliente, teléfono, correo, empresa..."
          className="input-base mb-4"
        />
        <div className="space-y-4">
          {res.clientes.length > 0 && (
            <div>
              <p className="mb-1 text-xs font-semibold text-secondary">Clientes</p>
              {res.clientes.map((c) => (
                <button
                  key={c.id}
                  onClick={() => go(`/clientes/${c.id}`)}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm hover:bg-[var(--bg-secondary)]"
                >
                  <Users className="h-4 w-4 text-secondary" />
                  <span>{c.nombre}</span>
                  <span className="ml-auto text-xs text-secondary">{c.telefono}</span>
                </button>
              ))}
            </div>
          )}
          {res.empresas.length > 0 && (
            <div>
              <p className="mb-1 text-xs font-semibold text-secondary">Empresas</p>
              {res.empresas.map((e) => (
                <div key={e.id} className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm">
                  <Building2 className="h-4 w-4 text-secondary" />
                  {e.nombre}
                </div>
              ))}
            </div>
          )}
          {query.length >= 2 && res.clientes.length === 0 && res.empresas.length === 0 && (
            <p className="text-sm text-secondary">Sin resultados.</p>
          )}
        </div>
      </Modal>
    </>
  )
}
