'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'

export async function getRecordatoriosPendientes() {
  const session = await auth()
  if (!session?.user) return []
  return prisma.recordatorio.findMany({
    where: {
      usuarioId: session.user.id,
      completado: false,
      fecha: { lte: new Date() },
    },
    include: { cliente: { select: { id: true, nombre: true } } },
    orderBy: { fecha: 'asc' },
    take: 20,
  })
}

export async function completarRecordatorio(id: string) {
  const session = await auth()
  if (!session?.user) return { success: false, error: 'No autorizado' }
  await prisma.recordatorio.update({ where: { id }, data: { completado: true } })
  revalidatePath('/')
  return { success: true }
}

export async function posponerRecordatorio(id: string) {
  const session = await auth()
  if (!session?.user) return { success: false, error: 'No autorizado' }
  const r = await prisma.recordatorio.findUnique({ where: { id } })
  if (!r) return { success: false, error: 'No existe' }
  await prisma.recordatorio.update({
    where: { id },
    data: { fecha: new Date(r.fecha.getTime() + 86400000), pospuesto: true },
  })
  revalidatePath('/')
  return { success: true }
}
