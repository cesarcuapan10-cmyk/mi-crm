import Link from 'next/link'
import { Plus } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { ETAPAS, TEMPERATURAS } from '@/lib/constants'
import { formatMoneda, formatTelefono, formatFecha } from '@/lib/format'
import type { Prisma } from '@prisma/client'

const PER_PAGE = 25

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; etapa?: string; temperatura?: string; orden?: string; page?: string }>
}) {
  const session = await auth()
  if (!session?.user) return null
  const sp = await searchParams
  const page = Math.max(1, parseInt(sp.page ?? '1'))

  const where: Prisma.ClienteWhereInput = { eliminadoEn: null }
  if (sp.q) {
    where.OR = [
      { nombre: { contains: sp.q } },
      { telefono: { contains: sp.q } },
      { correo: { contains: sp.q } },
    ]
  }
  if (sp.etapa) where.etapa = sp.etapa as never
  if (sp.temperatura) where.temperatura = sp.temperatura as never

  const orderBy: Prisma.ClienteOrderByWithRelationInput =
    sp.orden === 'valor'
      ? { valorEstimado: 'desc' }
      : sp.orden === 'accion'
        ? { fechaProximaAccion: 'asc' }
        : { nombre: 'asc' }

  const [clientes, total] = await Promise.all([
    prisma.cliente.findMany({ where, orderBy, skip: (page - 1) * PER_PAGE, take: PER_PAGE }),
    prisma.cliente.count({ where }),
  ])

  const totalPages = Math.ceil(total / PER_PAGE)

  const chips: { label: string; param: string }[] = []
  if (sp.q) chips.push({ label: `Búsqueda: ${sp.q}`, param: 'q' })
  if (sp.etapa) chips.push({ label: ETAPAS[sp.etapa as keyof typeof ETAPAS]?.label ?? sp.etapa, param: 'etapa' })
  if (sp.temperatura) chips.push({ label: TEMPERATURAS[sp.temperatura as keyof typeof TEMPERATURAS]?.label ?? sp.temperatura, param: 'temperatura' })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Clientes ({total})</h1>
        <Link href="/clientes/nuevo">
          <Button>
            <Plus className="h-4 w-4" /> Nuevo cliente
          </Button>
        </Link>
      </div>

      <form className="flex flex-wrap gap-2" action="/clientes" method="get">
        <input name="q" defaultValue={sp.q} placeholder="Buscar nombre, teléfono, correo..." className="input-base max-w-xs" />
        <select name="etapa" defaultValue={sp.etapa ?? ''} className="input-base max-w-[180px]">
          <option value="">Todas las etapas</option>
          {Object.entries(ETAPAS).map(([k, v]) => (
            <option key={k} value={k}>
              {v.label}
            </option>
          ))}
        </select>
        <select name="temperatura" defaultValue={sp.temperatura ?? ''} className="input-base max-w-[150px]">
          <option value="">Temperatura</option>
          {Object.entries(TEMPERATURAS).map(([k, v]) => (
            <option key={k} value={k}>
              {v.label}
            </option>
          ))}
        </select>
        <select name="orden" defaultValue={sp.orden ?? ''} className="input-base max-w-[150px]">
          <option value="">Ordenar: Nombre</option>
          <option value="valor">Valor</option>
          <option value="accion">Próxima acción</option>
        </select>
        <Button type="submit" variant="secondary">
          Filtrar
        </Button>
      </form>

      {chips.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {chips.map((c) => (
            <Badge key={c.param} color="gray">
              {c.label}
            </Badge>
          ))}
          <Link href="/clientes" className="text-sm text-[var(--color-marca-dark)]">
            Limpiar
          </Link>
        </div>
      )}

      {clientes.length === 0 ? (
        <EmptyState title="Sin clientes" description="Crea tu primer cliente para comenzar." action={<Link href="/clientes/nuevo"><Button>Nuevo cliente</Button></Link>} />
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-secondary">
                <th className="p-3">Nombre</th>
                <th className="p-3">Teléfono</th>
                <th className="p-3">Etapa</th>
                <th className="p-3">Temp.</th>
                <th className="p-3">Próxima acción</th>
                <th className="p-3">Valor</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((c) => (
                <tr key={c.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-secondary)]">
                  <td className="p-3">
                    <Link href={`/clientes/${c.id}`} className="font-medium text-[var(--color-marca-dark)] hover:underline">
                      {c.nombre}
                    </Link>
                  </td>
                  <td className="p-3">{formatTelefono(c.telefono)}</td>
                  <td className="p-3">
                    <Badge color={ETAPAS[c.etapa].color}>
                      {ETAPAS[c.etapa].icon} {ETAPAS[c.etapa].label}
                    </Badge>
                  </td>
                  <td className="p-3">{TEMPERATURAS[c.temperatura].emoji}</td>
                  <td className="p-3">
                    {c.proximaAccion ?? '—'}
                    {c.fechaProximaAccion && <span className="block text-xs text-secondary">{formatFecha(c.fechaProximaAccion)}</span>}
                  </td>
                  <td className="p-3">{formatMoneda(c.valorEstimado)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }).map((_, i) => {
            const params = new URLSearchParams(sp as Record<string, string>)
            params.set('page', String(i + 1))
            return (
              <Link
                key={i}
                href={`/clientes?${params.toString()}`}
                className={`rounded-lg px-3 py-1 text-sm ${page === i + 1 ? 'bg-[var(--color-marca)] text-neutral-900' : 'hover:bg-[var(--bg-secondary)]'}`}
              >
                {i + 1}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
