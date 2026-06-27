import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { startOfMonth, endOfMonth, isToday, format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CitaForm } from '@/components/agenda/cita-form'
import { formatFecha } from '@/lib/format'

export default async function AgendaPage() {
  const session = await auth()
  if (!session?.user) return null

  const ini = startOfMonth(new Date())
  const fin = endOfMonth(new Date())

  const [citas, clientes] = await Promise.all([
    prisma.cita.findMany({
      where: { eliminadoEn: null, fecha: { gte: ini, lte: fin } },
      include: { cliente: { select: { nombre: true } } },
      orderBy: { fecha: 'asc' },
    }),
    prisma.cliente.findMany({ where: { eliminadoEn: null }, select: { id: true, nombre: true }, orderBy: { nombre: 'asc' } }),
  ])

  const hoy = citas.filter((c) => isToday(c.fecha))

  // calendario simple del mes
  const dias = Array.from({ length: fin.getDate() }, (_, i) => i + 1)
  const citasPorDia: Record<number, number> = {}
  citas.forEach((c) => {
    const d = c.fecha.getDate()
    citasPorDia[d] = (citasPorDia[d] ?? 0) + 1
  })

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Agenda · {format(new Date(), 'MMMM yyyy', { locale: es })}</h1>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h3 className="mb-3 font-semibold">Calendario</h3>
          <div className="grid grid-cols-7 gap-1">
            {dias.map((d) => (
              <div key={d} className="flex h-16 flex-col rounded-lg border border-[var(--border)] p-1 text-xs">
                <span className="text-secondary">{d}</span>
                {citasPorDia[d] && <span className="mt-auto rounded bg-[var(--color-marca)] px-1 text-neutral-900">{citasPorDia[d]} cita(s)</span>}
              </div>
            ))}
          </div>
        </Card>

        <CitaForm clientes={clientes} />
      </div>

      <Card>
        <h3 className="mb-3 font-semibold">Citas de hoy</h3>
        {hoy.length === 0 ? (
          <p className="text-sm text-secondary">Sin citas hoy.</p>
        ) : (
          <ul className="space-y-2">
            {hoy.map((c) => (
              <li key={c.id} className="flex items-center justify-between text-sm">
                <span>
                  {format(c.fecha, 'HH:mm')} · {c.titulo} — {c.cliente.nombre}
                </span>
                <Badge color={c.confirmada ? 'green' : 'yellow'}>{c.confirmada ? 'Confirmada' : 'Pendiente'}</Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <h3 className="mb-3 font-semibold">Todas las citas del mes</h3>
        <ul className="space-y-2 text-sm">
          {citas.map((c) => (
            <li key={c.id} className="flex items-center justify-between">
              <span>{formatFecha(c.fecha, "dd/MM HH:mm")} · {c.titulo} — {c.cliente.nombre}</span>
              <Badge color={c.confirmada ? 'green' : 'yellow'}>{c.confirmada ? 'Confirmada' : 'Pendiente'}</Badge>
            </li>
          ))}
          {citas.length === 0 && <li className="text-secondary">Sin citas este mes.</li>}
        </ul>
      </Card>
    </div>
  )
}
