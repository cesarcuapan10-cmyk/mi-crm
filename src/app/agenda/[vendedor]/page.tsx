import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { AgendaPublicaForm } from './agenda-form'

export default async function AgendaPublicaPage({ params }: { params: Promise<{ vendedor: string }> }) {
  const { vendedor } = await params
  const usuario = await prisma.usuario.findFirst({
    where: { id: vendedor, eliminadoEn: null },
    select: { id: true, nombre: true },
  })
  if (!usuario) notFound()

  return (
    <div className="min-h-screen bg-[var(--bg-secondary)]">
      <header className="bg-[var(--color-marca)] px-6 py-12 text-center text-neutral-900">
        <h1 className="text-2xl font-bold">Agenda una cita con {usuario.nombre}</h1>
        <p className="mt-2">Sesiones de 45 minutos · Horario 09:00 a 18:00</p>
      </header>
      <main className="mx-auto max-w-md px-4 py-8">
        <div className="card p-6">
          <AgendaPublicaForm vendedorId={usuario.id} />
        </div>
      </main>
    </div>
  )
}
