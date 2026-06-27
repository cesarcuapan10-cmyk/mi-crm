import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { startOfMonth } from 'date-fns'
import { Card } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import { formatMoneda } from '@/lib/format'

const medallas = ['🥇', '🥈', '🥉']

export default async function EquipoPage() {
  const session = await auth()
  if (!session?.user) return null
  if (session.user.rol !== 'ADMIN') redirect('/')

  const inicioMes = startOfMonth(new Date())
  const usuarios = await prisma.usuario.findMany({ where: { eliminadoEn: null }, orderBy: { creadoEn: 'asc' } })

  const stats = await Promise.all(
    usuarios.map(async (u) => {
      const [ganados, nuevos, pagos] = await Promise.all([
        prisma.cliente.count({ where: { usuarioId: u.id, estado: 'GANADO', actualizadoEn: { gte: inicioMes } } }),
        prisma.cliente.count({ where: { usuarioId: u.id, creadoEn: { gte: inicioMes } } }),
        prisma.pago.aggregate({ where: { cliente: { usuarioId: u.id }, estatus: 'PAGADO', fechaPago: { gte: inicioMes } }, _sum: { monto: true } }),
      ])
      return { u, ganados, nuevos, cobrado: pagos._sum.monto ?? 0 }
    })
  )

  const ranking = [...stats].sort((a, b) => b.cobrado - a.cobrado)

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Equipo</h1>
      <div className="grid gap-3 md:grid-cols-2">
        {ranking.map((s, i) => {
          const progreso = Math.min(100, Math.round((s.nuevos / (s.u.metaMes || 30)) * 100))
          return (
            <Card key={s.u.id}>
              <div className="flex items-center gap-3">
                <span className="text-xl">{medallas[i] ?? `#${i + 1}`}</span>
                <Avatar name={s.u.nombre} size={40} />
                <div>
                  <p className="font-medium">{s.u.nombre}</p>
                  <p className="text-xs text-secondary">{s.u.rol}</p>
                </div>
                <div className="ml-auto text-right">
                  <p className="font-semibold">{formatMoneda(s.cobrado)}</p>
                  <p className="text-xs text-secondary">{s.ganados} ganados</p>
                </div>
              </div>
              <div className="mt-3">
                <p className="mb-1 text-xs text-secondary">Meta: {s.nuevos}/{s.u.metaMes || 30} nuevos</p>
                <div className="h-2 overflow-hidden rounded-full bg-[var(--bg-secondary)]">
                  <div className="h-full bg-[var(--color-marca)]" style={{ width: `${progreso}%` }} />
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
