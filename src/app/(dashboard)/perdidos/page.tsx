import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { formatMoneda, formatFecha } from '@/lib/format'

export default async function Page() {
  const session = await auth()
  if (!session?.user) return null
  const clientes = await prisma.cliente.findMany({
    where: { eliminadoEn: null, estado: 'PERDIDO' },
    orderBy: { actualizadoEn: 'desc' },
  })
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Clientes perdidos ({clientes.length})</h1>
      {clientes.length === 0 ? (
        <EmptyState title="Nada aquí todavía" />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {clientes.map((c) => (
            <Card key={c.id}>
              <Link href={`/clientes/${c.id}`} className="font-medium text-[var(--color-marca-dark)] hover:underline">
                {c.nombre}
              </Link>
              <p className="text-sm text-secondary">{formatMoneda(c.valorEstimado)} · {formatFecha(c.actualizadoEn)}</p>
              {c.objecion && <p className="mt-1 text-sm text-red-500">Motivo: {c.objecion}</p>}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
