'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { startOfMonth, subMonths, format } from 'date-fns'
import { es } from 'date-fns/locale'

export async function getDashboardStats() {
  const session = await auth()
  if (!session?.user) return null

  const inicioMes = startOfMonth(new Date())

  const [
    nuevosMes,
    citasMes,
    pagosMes,
    ganadosMes,
    totalActivos,
    leadsSinContacto,
    pagosVencidos,
    funnel,
    porCanal,
  ] = await Promise.all([
    prisma.cliente.count({ where: { eliminadoEn: null, creadoEn: { gte: inicioMes } } }),
    prisma.cita.count({ where: { eliminadoEn: null, fecha: { gte: inicioMes } } }),
    prisma.pago.findMany({ where: { eliminadoEn: null, estatus: 'PAGADO', fechaPago: { gte: inicioMes } }, select: { monto: true } }),
    prisma.cliente.count({ where: { eliminadoEn: null, estado: 'GANADO', actualizadoEn: { gte: inicioMes } } }),
    prisma.cliente.count({ where: { eliminadoEn: null, estado: 'ACTIVO' } }),
    prisma.cliente.count({ where: { eliminadoEn: null, etapa: 'NUEVO', ultimoContacto: null } }),
    prisma.pago.findMany({ where: { eliminadoEn: null, estatus: 'VENCIDO' }, select: { monto: true } }),
    prisma.cliente.findMany({ where: { eliminadoEn: null, estado: 'ACTIVO' }, select: { valorEstimado: true } }),
    prisma.cliente.groupBy({ by: ['origen'], where: { eliminadoEn: null }, _count: true }),
  ])

  const ingresosMes = pagosMes.reduce((s, p) => s + p.monto, 0)
  const vencidosTotal = pagosVencidos.reduce((s, p) => s + p.monto, 0)
  const valorFunnel = funnel.reduce((s, c) => s + (c.valorEstimado ?? 0), 0)

  const totalCerrados = await prisma.cliente.count({ where: { eliminadoEn: null, estado: { in: ['GANADO', 'PERDIDO'] } } })
  const totalGanados = await prisma.cliente.count({ where: { eliminadoEn: null, estado: 'GANADO' } })
  const tasaCierre = totalCerrados > 0 ? Math.round((totalGanados / totalCerrados) * 100) : 0

  // 6 meses
  const meses: { mes: string; ingresos: number; ganados: number }[] = []
  for (let i = 5; i >= 0; i--) {
    const ini = startOfMonth(subMonths(new Date(), i))
    const fin = startOfMonth(subMonths(new Date(), i - 1))
    const [pagos, ganados] = await Promise.all([
      prisma.pago.findMany({ where: { eliminadoEn: null, estatus: 'PAGADO', fechaPago: { gte: ini, lt: fin } }, select: { monto: true } }),
      prisma.cliente.count({ where: { eliminadoEn: null, estado: 'GANADO', actualizadoEn: { gte: ini, lt: fin } } }),
    ])
    meses.push({
      mes: format(ini, 'MMM', { locale: es }),
      ingresos: pagos.reduce((s, p) => s + p.monto, 0),
      ganados,
    })
  }

  const mesActual = meses[5]?.ingresos ?? 0
  const mesAnterior = meses[4]?.ingresos ?? 0
  const variacion = mesAnterior > 0 ? Math.round(((mesActual - mesAnterior) / mesAnterior) * 100) : 0

  return {
    nuevosMes,
    citasMes,
    ingresosMes,
    ganadosMes,
    totalActivos,
    leadsSinContacto,
    vencidosTotal,
    valorFunnel,
    tasaCierre,
    meses,
    variacion,
    porCanal: porCanal.map((c) => ({ canal: c.origen ?? 'Sin origen', total: c._count })),
  }
}
