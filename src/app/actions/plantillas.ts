'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const schema = z.object({
  nombre: z.string().min(1),
  contenido: z.string().min(1),
  canal: z.enum(['WHATSAPP', 'CORREO']).default('WHATSAPP'),
  etapa: z.string().optional().nullable(),
  tipo: z.string().optional().nullable(),
})

export async function crearPlantilla(input: unknown) {
  const session = await auth()
  if (!session?.user) return { success: false, error: 'No autenticado' }
  const parsed = schema.safeParse(input)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message }
  const d = parsed.data
  await prisma.plantillaMensaje.create({
    data: { usuarioId: session.user.id, nombre: d.nombre, contenido: d.contenido, canal: d.canal, etapa: d.etapa || null, tipo: d.tipo || null },
  })
  revalidatePath('/plantillas')
  return { success: true }
}

export async function actualizarPlantilla(id: string, input: unknown) {
  const session = await auth()
  if (!session?.user) return { success: false, error: 'No autenticado' }
  const parsed = schema.partial().safeParse(input)
  if (!parsed.success) return { success: false, error: 'Datos inválidos' }
  await prisma.plantillaMensaje.update({ where: { id }, data: parsed.data as never })
  revalidatePath('/plantillas')
  return { success: true }
}

export async function duplicarPlantilla(id: string) {
  const session = await auth()
  if (!session?.user) return { success: false, error: 'No autenticado' }
  const p = await prisma.plantillaMensaje.findUnique({ where: { id } })
  if (!p) return { success: false, error: 'No existe' }
  await prisma.plantillaMensaje.create({
    data: { usuarioId: session.user.id, nombre: `${p.nombre} (copia)`, contenido: p.contenido, canal: p.canal, etapa: p.etapa, tipo: p.tipo },
  })
  revalidatePath('/plantillas')
  return { success: true }
}

export async function eliminarPlantilla(id: string) {
  const session = await auth()
  if (!session?.user) return { success: false, error: 'No autenticado' }
  await prisma.plantillaMensaje.delete({ where: { id } })
  revalidatePath('/plantillas')
  return { success: true }
}

export async function toggleFavoritaPlantilla(id: string, valor: boolean) {
  const session = await auth()
  if (!session?.user) return { success: false, error: 'No autenticado' }
  await prisma.plantillaMensaje.update({ where: { id }, data: { esFavorita: valor } })
  revalidatePath('/plantillas')
  return { success: true }
}
