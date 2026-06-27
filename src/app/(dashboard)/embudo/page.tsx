import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { Kanban } from '@/components/embudo/kanban'

export default async function EmbudoPage() {
  const session = await auth()
  if (!session?.user) return null

  const clientes = await prisma.cliente.findMany({
    where: { eliminadoEn: null, estado: 'ACTIVO' },
    orderBy: { actualizadoEn: 'desc' },
    select: {
      id: true,
      nombre: true,
      etapa: true,
      temperatura: true,
      valorEstimado: true,
      ultimoContacto: true,
      fechaProximaAccion: true,
    },
  })

  const data = clientes.map((c) => ({
    ...c,
    ultimoContacto: c.ultimoContacto?.toISOString() ?? null,
    fechaProximaAccion: c.fechaProximaAccion?.toISOString() ?? null,
  }))

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Embudo</h1>
      <Kanban clientes={data} />
    </div>
  )
}
