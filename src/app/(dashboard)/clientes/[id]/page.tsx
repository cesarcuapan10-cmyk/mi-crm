import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ClienteEditor } from '@/components/cliente/cliente-detalle'
import { AssistantPanel } from '@/components/ia/assistant-panel'
import { ETAPAS, TEMPERATURAS } from '@/lib/constants'
import { formatMoneda, formatFecha, formatRelativo, diasSinContacto } from '@/lib/format'

export default async function ClienteDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return null
  const { id } = await params

  const cliente = await prisma.cliente.findFirst({
    where: { id, eliminadoEn: null },
    include: {
      empresa: true,
      archivos: { select: { id: true, nombre: true, etiqueta: true } },
      pagos: { where: { eliminadoEn: null }, orderBy: { creadoEn: 'desc' } },
      notasRel: { where: { eliminadoEn: null }, orderBy: { creadoEn: 'desc' }, take: 30 },
      citas: { where: { eliminadoEn: null }, orderBy: { fecha: 'desc' } },
    },
  })
  if (!cliente) notFound()

  const dias = diasSinContacto(cliente.ultimoContacto)
  const totalPagado = cliente.pagos.filter((p) => p.estatus === 'PAGADO').reduce((s, p) => s + p.monto, 0)
  const valor = cliente.valorEstimado ?? 0
  const progresoPago = valor > 0 ? Math.min(100, Math.round((totalPagado / valor) * 100)) : 0

  // Timeline combinado
  const timeline = [
    ...cliente.notasRel.map((n) => ({ fecha: n.creadoEn, tipo: n.tipo, texto: n.contenido })),
    ...cliente.citas.map((c) => ({ fecha: c.fecha, tipo: 'CITA', texto: c.titulo })),
    ...cliente.pagos.map((p) => ({ fecha: p.creadoEn, tipo: 'PAGO', texto: `Pago ${formatMoneda(p.monto)} (${p.estatus})` })),
  ].sort((a, b) => b.fecha.getTime() - a.fecha.getTime())

  return (
    <div className="space-y-4">
      <Link href="/clientes" className="inline-flex items-center gap-1 text-sm text-secondary hover:text-[var(--text-primary)]">
        <ArrowLeft className="h-4 w-4" /> Volver a clientes
      </Link>

      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold">{cliente.nombre}</h1>
        <Badge color={ETAPAS[cliente.etapa].color}>
          {ETAPAS[cliente.etapa].icon} {ETAPAS[cliente.etapa].label}
        </Badge>
        <Badge color={TEMPERATURAS[cliente.temperatura].color}>
          {TEMPERATURAS[cliente.temperatura].emoji} {TEMPERATURAS[cliente.temperatura].label}
        </Badge>
        {dias != null && dias > 7 && <span className="text-sm font-medium text-red-500">{dias} días sin contacto</span>}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <ClienteEditor
            cliente={{
              id: cliente.id,
              nombre: cliente.nombre,
              telefono: cliente.telefono,
              correo: cliente.correo,
              etapa: cliente.etapa,
              temperatura: cliente.temperatura,
              objecion: cliente.objecion,
              valorEstimado: cliente.valorEstimado,
              retoPrincipal: cliente.retoPrincipal,
              proximaAccion: cliente.proximaAccion,
            }}
            archivos={cliente.archivos}
          />

          <AssistantPanel clienteId={cliente.id} />

          <Card>
            <h3 className="mb-3 font-semibold">Línea de tiempo</h3>
            <div className="space-y-3">
              {timeline.length === 0 && <p className="text-sm text-secondary">Sin interacciones.</p>}
              {timeline.map((t, i) => (
                <div key={i} className="flex gap-3 border-l-2 border-[var(--color-marca)] pl-3">
                  <div>
                    <p className="text-sm">{t.texto}</p>
                    <p className="text-xs text-secondary">
                      {t.tipo} · {formatRelativo(t.fecha)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          {cliente.empresa && (
            <Card>
              <h3 className="mb-2 font-semibold">Empresa</h3>
              <p className="text-sm">{cliente.empresa.nombre}</p>
              {cliente.empresa.giro && <p className="text-sm text-secondary">{cliente.empresa.giro}</p>}
            </Card>
          )}

          <Card>
            <h3 className="mb-2 font-semibold">Pagos</h3>
            <p className="text-sm text-secondary">Cobrado: {formatMoneda(totalPagado)} de {formatMoneda(valor)}</p>
            <div className="my-2 h-2 w-full overflow-hidden rounded-full bg-[var(--bg-secondary)]">
              <div className="h-full bg-green-500" style={{ width: `${progresoPago}%` }} />
            </div>
            <ul className="space-y-1 text-sm">
              {cliente.pagos.map((p) => (
                <li key={p.id} className="flex justify-between">
                  <span>{formatMoneda(p.monto)}</span>
                  <Badge color={p.estatus === 'PAGADO' ? 'green' : p.estatus === 'VENCIDO' ? 'red' : 'yellow'}>{p.estatus}</Badge>
                </li>
              ))}
              {cliente.pagos.length === 0 && <li className="text-secondary">Sin pagos.</li>}
            </ul>
          </Card>

          <Card>
            <h3 className="mb-2 font-semibold">Resumen</h3>
            <p className="text-sm text-secondary">Último contacto: {cliente.ultimoContacto ? formatFecha(cliente.ultimoContacto) : '—'}</p>
            {cliente.objecion && <p className="mt-1 text-sm">Objeción: {cliente.objecion}</p>}
            {cliente.proximaAccion && <p className="mt-1 text-sm">Próxima acción: {cliente.proximaAccion}</p>}
          </Card>
        </div>
      </div>
    </div>
  )
}
