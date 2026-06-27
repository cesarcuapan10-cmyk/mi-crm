'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { puede, type Rol } from '@/lib/auth-utils'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const citaSchema = z.object({
  clienteId: z.string().min(1),
  titulo: z.string().min(1),
  fecha: z.string().min(1),
  duracion: z.coerce.number().default(45),
  notas: z.string().optional().nullable(),
})

export async function crearCita(input: unknown) {
  const session = await auth()
  if (!session?.user) return { success: false, error: 'No autenticado' }
  if (!puede(session.user.rol as Rol, 'crear')) return { success: false, error: 'Sin permiso' }
  const parsed = citaSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message }
  const d = parsed.data
  try {
    const cita = await prisma.cita.create({
      data: {
        clienteId: d.clienteId,
        usuarioId: session.user.id,
        titulo: d.titulo,
        fecha: new Date(d.fecha),
        duracion: d.duracion,
        notas: d.notas || null,
      },
    })
    await prisma.nota.create({
      data: { clienteId: d.clienteId, usuarioId: session.user.id, contenido: `Cita agendada: ${d.titulo}`, tipo: 'CITA' },
    })
    revalidatePath('/agenda')
    return { success: true, data: cita }
  } catch {
    return { success: false, error: 'Error al crear cita' }
  }
}

export async function confirmarCita(id: string) {
  const session = await auth()
  if (!session?.user) return { success: false, error: 'No autenticado' }
  await prisma.cita.update({ where: { id }, data: { confirmada: true } })
  revalidatePath('/agenda')
  return { success: true }
}

export async function eliminarCita(id: string) {
  const session = await auth()
  if (!session?.user) return { success: false, error: 'No autenticado' }
  await prisma.cita.update({ where: { id }, data: { eliminadoEn: new Date() } })
  revalidatePath('/agenda')
  return { success: true }
}

export async function crearCitaPublica(input: { vendedorId: string; nombre: string; telefono: string; correo?: string; fecha: string }) {
  const parsed = z
    .object({
      vendedorId: z.string().min(1),
      nombre: z.string().min(2),
      telefono: z.string().min(8),
      correo: z.string().email().optional().or(z.literal('')),
      fecha: z.string().min(1),
    })
    .safeParse(input)
  if (!parsed.success) return { success: false, error: 'Datos inválidos' }
  const d = parsed.data
  try {
    const cliente = await prisma.cliente.create({
      data: {
        nombre: d.nombre,
        telefono: d.telefono,
        correo: d.correo || null,
        etapa: 'CITA_AGENDADA',
        usuarioId: d.vendedorId,
        origen: 'Agenda pública',
        ultimoContacto: new Date(),
      },
    })
    await prisma.cita.create({
      data: {
        clienteId: cliente.id,
        usuarioId: d.vendedorId,
        titulo: `Cita con ${d.nombre}`,
        fecha: new Date(d.fecha),
        duracion: 45,
      },
    })
    return { success: true }
  } catch {
    return { success: false, error: 'Error al agendar' }
  }
}
