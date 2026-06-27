import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { isToday } from 'date-fns'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ETAPAS, TEMPERATURAS } from '@/lib/constants'
import { formatMoneda, formatFecha, diasSinContacto } from '@/lib/format'

const ordenTemp: Record<string, number> = { CALIENTE: 0, TIBIO: 1, FRIO: 2 }

export default async function SeguimientoPage() {
  const session = await auth()
  if (!session?.user) return null

  const activos = await prisma.cliente.findMany({
    where: { eliminadoEn: null, estado: 'ACTIVO' },
    include: { citas: { where: { eliminadoEn: null }, orderBy: { fecha: 'asc' } } },
  })

  const citasHoy = activos.flatMap((c) => c.citas.filter((ci) => isToday(ci.fecha)).map((ci) => ({ cliente: c.nombre, id: c.id, cita: ci })))

  const ahora = new Date()
  const vencidas = activos.filter((c) => c.fechaProximaAccion && c.fechaProximaAccion < ahora)
  const enRiesgo = activos.filter((c) => {
    const d = diasSinContacto(c.ultimoContacto)
    return d != null && d > 7
  })

  const hoyTeToca = [...activos].sort((a, b) => {
    const t = (ordenTemp[a.temperatura] ?? 9) - (ordenTemp[b.temperatura] ?? 9)
    if (t !== 0) return t
    return (b.valorEstimado ?? 0) - (a.valorEstimado ?? 0)
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Hoy te toca</h1>
        {enRiesgo.length > 0 && (
          <Badge color="red">{enRiesgo.length} clientes en riesgo de enfriarse</Badge>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <h3 className="mb-3 font-semibold">Citas de hoy ({citasHoy.length})</h3>
          {citasHoy.length === 0 ? (
            <p className="text-sm text-secondary">Sin citas hoy.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {citasHoy.map((c, i) => (
                <li key={i} className="flex justify-between">
                  <Link href={`/clientes/${c.id}`} className="text-[var(--color-marca-dark)] hover:underline">
                    {c.cliente}
                  </Link>
                  <span>{formatFecha(c.cita.fecha, 'HH:mm')}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <h3 className="mb-3 font-semibold text-red-600">Acciones vencidas ({vencidas.length})</h3>
          {vencidas.length === 0 ? (
            <p className="text-sm text-secondary">Nada vencido.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {vencidas.map((c) => (
                <li key={c.id} className="flex justify-between">
                  <Link href={`/clientes/${c.id}`} className="text-[var(--color-marca-dark)] hover:underline">
                    {c.nombre}
                  </Link>
                  <span className="text-red-500">{c.proximaAccion ?? 'Acción'} · {formatFecha(c.fechaProximaAccion)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card>
        <h3 className="mb-3 font-semibold">A quién contactar (por prioridad)</h3>
        <ul className="space-y-2 text-sm">
          {hoyTeToca.slice(0, 20).map((c) => (
            <li key={c.id} className="flex items-center justify-between">
              <Link href={`/clientes/${c.id}`} className="font-medium text-[var(--color-marca-dark)] hover:underline">
                {c.nombre}
              </Link>
              <div className="flex items-center gap-2">
                <span>{TEMPERATURAS[c.temperatura].emoji}</span>
                <Badge color={ETAPAS[c.etapa].color}>{ETAPAS[c.etapa].label}</Badge>
                <span className="text-secondary">{formatMoneda(c.valorEstimado)}</span>
              </div>
            </li>
          ))}
          {hoyTeToca.length === 0 && <li className="text-secondary">Sin clientes activos.</li>}
        </ul>
      </Card>
    </div>
  )
}
