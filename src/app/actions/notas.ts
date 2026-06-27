'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const notaSchema = z.object({
  clienteId: z.string().min(1),
  contenido: z.string().min(1, 'Escribe algo'),
  tipo: z.enum(['LLAMADA', 'MENSAJE', 'CITA', 'PAGO', 'ETAPA', 'ARCHIVO', 'NOTA', 'SISTEMA']).default('NOTA'),
})

export async function crearNota(input: unknown) {
  const session = await auth()
  if (!session?.user) return { success: false, error: 'No autenticado' }
  const parsed = notaSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message }
  const d = parsed.data
  try {
    await prisma.nota.create({
      data: { clienteId: d.clienteId, usuarioId: session.user.id, contenido: d.contenido, tipo: d.tipo, fechaContacto: new Date() },
    })
    await prisma.cliente.update({ where: { id: d.clienteId }, data: { ultimoContacto: new Date() } })
    revalidatePath(`/clientes/${d.clienteId}`)
    return { success: true }
  } catch {
    return { success: false, error: 'Error al crear nota' }
  }
}

export async function eliminarNota(id: string, clienteId: string) {
  const session = await auth()
  if (!session?.user) return { success: false, error: 'No autenticado' }
  await prisma.nota.update({ where: { id }, data: { eliminadoEn: new Date() } })
  revalidatePath(`/clientes/${clienteId}`)
  return { success: true }
}
