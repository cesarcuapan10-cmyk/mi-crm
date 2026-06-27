import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { startOfMonth } from 'date-fns'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PagoFormButton } from '@/components/pagos/pago-form'
import { ESTATUS_PAGO, METODOS_PAGO } from '@/lib/constants'
import { formatMoneda, formatFecha } from '@/lib/format'
import type { Prisma } from '@prisma/client'

export default async function PagosPage({ searchParams }: { searchParams: Promise<{ estatus?: string; metodo?: string }> }) {
  const session = await auth()
  if (!session?.user) return null
  const sp = await searchParams

  const where: Prisma.PagoWhereInput = { eliminadoEn: null }
  if (sp.estatus) where.estatus = sp.estatus as never
  if (sp.metodo) where.metodo = sp.metodo as never

  const inicioMes = startOfMonth(new Date())
  const [pagos, clientes, cobradoMes, pendiente, vencido] = await Promise.all([
    prisma.pago.findMany({ where, include: { cliente: { select: { id: true, nombre: true } } }, orderBy: { creadoEn: 'desc' } }),
    prisma.cliente.findMany({ where: { eliminadoEn: null }, select: { id: true, nombre: true }, orderBy: { nombre: 'asc' } }),
    prisma.pago.aggregate({ where: { eliminadoEn: null, estatus: 'PAGADO', fechaPago: { gte: inicioMes } }, _sum: { monto: true } }),
    prisma.pago.aggregate({ where: { eliminadoEn: null, estatus: 'PENDIENTE' }, _sum: { monto: true } }),
    prisma.pago.aggregate({ where: { eliminadoEn: null, estatus: 'VENCIDO' }, _sum: { monto: true } }),
  ])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Pagos</h1>
        <PagoFormButton clientes={clientes} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <p className="text-sm text-secondary">Cobrado este mes</p>
          <p className="text-xl font-semibold text-green-600">{formatMoneda(cobradoMes._sum.monto ?? 0)}</p>
        </Card>
        <Card>
          <p className="text-sm text-secondary">Pendiente</p>
          <p className="text-xl font-semibold text-amber-600">{formatMoneda(pendiente._sum.monto ?? 0)}</p>
        </Card>
        <Card>
          <p className="text-sm text-secondary">Vencido</p>
          <p className="text-xl font-semibold text-red-600">{formatMoneda(vencido._sum.monto ?? 0)}</p>
        </Card>
      </div>

      <form className="flex gap-2" action="/pagos" method="get">
        <select name="estatus" defaultValue={sp.estatus ?? ''} className="input-base max-w-[160px]">
          <option value="">Todos los estatus</option>
          {Object.keys(ESTATUS_PAGO).map((k) => (
            <option key={k} value={k}>
              {ESTATUS_PAGO[k as keyof typeof ESTATUS_PAGO].label}
            </option>
          ))}
        </select>
        <select name="metodo" defaultValue={sp.metodo ?? ''} className="input-base max-w-[160px]">
          <option value="">Todos los métodos</option>
          {Object.entries(METODOS_PAGO).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        <button type="submit" className="btn-marca">Filtrar</button>
      </form>

      <div className="card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-left text-secondary">
              <th className="p-3">Folio</th>
              <th className="p-3">Cliente</th>
              <th className="p-3">Monto</th>
              <th className="p-3">Método</th>
              <th className="p-3">Estatus</th>
              <th className="p-3">Vence</th>
            </tr>
          </thead>
          <tbody>
            {pagos.map((p) => (
              <tr key={p.id} className={`border-b border-[var(--border)] last:border-0 ${p.estatus === 'VENCIDO' ? 'bg-red-50 dark:bg-red-900/10' : ''}`}>
                <td className="p-3">#{p.folio}</td>
                <td className="p-3">
                  <Link href={`/clientes/${p.cliente.id}`} className="text-[var(--color-marca-dark)] hover:underline">
                    {p.cliente.nombre}
                  </Link>
                </td>
                <td className="p-3">{formatMoneda(p.monto)}</td>
                <td className="p-3">{METODOS_PAGO[p.metodo]}</td>
                <td className="p-3">
                  <Badge color={ESTATUS_PAGO[p.estatus].color}>{ESTATUS_PAGO[p.estatus].label}</Badge>
                </td>
                <td className="p-3">{p.fechaVencimiento ? formatFecha(p.fechaVencimiento) : '—'}</td>
              </tr>
            ))}
            {pagos.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-secondary">
                  Sin pagos.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
