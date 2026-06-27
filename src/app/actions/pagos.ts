'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { puede, type Rol } from '@/lib/auth-utils'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const pagoSchema = z.object({
  clienteId: z.string().min(1),
  monto: z.coerce.number().positive('El monto debe ser mayor a 0'),
  metodo: z.enum(['TRANSFERENCIA', 'TARJETA', 'LIGA_PAGO']),
  estatus: z.enum(['PENDIENTE', 'PAGADO', 'VENCIDO']).default('PENDIENTE'),
  concepto: z.string().optional().nullable(),
  fechaVencimiento: z.string().optional().nullable(),
  fechaPago: z.string().optional().nullable(),
})

export async function crearPago(input: unknown) {
  const session = await auth()
  if (!session?.user) return { success: false, error: 'No autenticado' }
  if (!puede(session.user.rol as Rol, 'crear')) return { success: false, error: 'Sin permiso' }
  const parsed = pagoSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message }
  const d = parsed.data
  try {
    const last = await prisma.pago.findFirst({ orderBy: { folio: 'desc' }, select: { folio: true } })
    const folio = (last?.folio ?? 0) + 1
    const pago = await prisma.pago.create({
      data: {
        clienteId: d.clienteId,
        monto: d.monto,
        metodo: d.metodo,
        estatus: d.estatus,
        concepto: d.concepto || null,
        folio,
        fechaVencimiento: d.fechaVencimiento ? new Date(d.fechaVencimiento) : null,
        fechaPago: d.estatus === 'PAGADO' ? new Date(d.fechaPago || Date.now()) : null,
      },
    })
    await prisma.nota.create({
      data: { clienteId: d.clienteId, usuarioId: session.user.id, contenido: `Pago registrado: $${d.monto}`, tipo: 'PAGO' },
    })
    revalidatePath('/pagos')
    return { success: true, data: pago }
  } catch {
    return { success: false, error: 'Error al registrar pago' }
  }
}

export async function actualizarEstatusPago(id: string, estatus: 'PENDIENTE' | 'PAGADO' | 'VENCIDO') {
  const session = await auth()
  if (!session?.user) return { success: false, error: 'No autenticado' }
  if (!puede(session.user.rol as Rol, 'editar')) return { success: false, error: 'Sin permiso' }
  await prisma.pago.update({
    where: { id },
    data: { estatus, fechaPago: estatus === 'PAGADO' ? new Date() : null },
  })
  revalidatePath('/pagos')
  return { success: true }
}

export async function eliminarPago(id: string) {
  const session = await auth()
  if (!session?.user) return { success: false, error: 'No autenticado' }
  if (!puede(session.user.rol as Rol, 'eliminar')) return { success: false, error: 'Sin permiso' }
  await prisma.pago.update({ where: { id }, data: { eliminadoEn: new Date() } })
  revalidatePath('/pagos')
  return { success: true }
}
