'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { puede, type Rol } from '@/lib/auth-utils'
import { registrarAuditoria } from './auditoria'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const clienteSchema = z.object({
  nombre: z.string().min(2, 'El nombre es obligatorio'),
  telefono: z.string().optional().nullable(),
  correo: z.string().email('Correo inválido').optional().or(z.literal('')).nullable(),
  origen: z.string().optional().nullable(),
  etapa: z.enum(['NUEVO', 'CONTACTADO', 'CITA_AGENDADA', 'PROPUESTA_ENVIADA', 'GANADO', 'PERDIDO']).optional(),
  temperatura: z.enum(['CALIENTE', 'TIBIO', 'FRIO']).optional(),
  objecion: z.string().optional().nullable(),
  notas: z.string().optional().nullable(),
  proximaAccion: z.string().optional().nullable(),
  fechaProximaAccion: z.string().optional().nullable(),
  valorEstimado: z.coerce.number().optional().nullable(),
  retoPrincipal: z.string().optional().nullable(),
  empresaNombre: z.string().optional().nullable(),
})

type Resultado<T = unknown> = { success: boolean; data?: T; error?: string }

async function getSession() {
  const session = await auth()
  if (!session?.user) return null
  return session
}

export async function crearCliente(input: unknown): Promise<Resultado> {
  const session = await getSession()
  if (!session) return { success: false, error: 'No autenticado' }
  if (!puede(session.user.rol as Rol, 'crear')) return { success: false, error: 'Sin permiso' }

  const parsed = clienteSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message }

  const d = parsed.data
  try {
    let empresaId: string | undefined
    if (d.empresaNombre) {
      const emp = await prisma.empresa.create({ data: { nombre: d.empresaNombre } })
      empresaId = emp.id
    }
    const cliente = await prisma.cliente.create({
      data: {
        nombre: d.nombre,
        telefono: d.telefono || null,
        correo: d.correo || null,
        origen: d.origen || null,
        etapa: d.etapa ?? 'NUEVO',
        temperatura: d.temperatura ?? 'TIBIO',
        objecion: d.objecion || null,
        notas: d.notas || null,
        proximaAccion: d.proximaAccion || null,
        fechaProximaAccion: d.fechaProximaAccion ? new Date(d.fechaProximaAccion) : null,
        valorEstimado: d.valorEstimado ?? null,
        retoPrincipal: d.retoPrincipal || null,
        usuarioId: session.user.id,
        empresaId,
        ultimoContacto: new Date(),
      },
    })
    await registrarAuditoria({
      usuarioId: session.user.id,
      accion: 'crear',
      entidad: 'cliente',
      entidadId: cliente.id,
      detalle: cliente.nombre,
    })
    revalidatePath('/clientes')
    return { success: true, data: cliente }
  } catch (e) {
    return { success: false, error: 'Error al crear cliente' }
  }
}

export async function actualizarCliente(id: string, input: unknown): Promise<Resultado> {
  const session = await getSession()
  if (!session) return { success: false, error: 'No autenticado' }
  if (!puede(session.user.rol as Rol, 'editar')) return { success: false, error: 'Sin permiso' }

  const parsed = clienteSchema.partial().safeParse(input)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message }
  const d = parsed.data

  try {
    const cliente = await prisma.cliente.update({
      where: { id },
      data: {
        nombre: d.nombre,
        telefono: d.telefono ?? undefined,
        correo: d.correo ?? undefined,
        origen: d.origen ?? undefined,
        etapa: d.etapa,
        temperatura: d.temperatura,
        objecion: d.objecion ?? undefined,
        notas: d.notas ?? undefined,
        proximaAccion: d.proximaAccion ?? undefined,
        fechaProximaAccion: d.fechaProximaAccion ? new Date(d.fechaProximaAccion) : undefined,
        valorEstimado: d.valorEstimado ?? undefined,
        retoPrincipal: d.retoPrincipal ?? undefined,
      },
    })
    await registrarAuditoria({ usuarioId: session.user.id, accion: 'editar', entidad: 'cliente', entidadId: id })
    revalidatePath(`/clientes/${id}`)
    revalidatePath('/clientes')
    return { success: true, data: cliente }
  } catch {
    return { success: false, error: 'Error al actualizar' }
  }
}

export async function cambiarEtapa(id: string, etapa: string): Promise<Resultado> {
  const session = await getSession()
  if (!session) return { success: false, error: 'No autenticado' }
  if (!puede(session.user.rol as Rol, 'editar')) return { success: false, error: 'Sin permiso' }

  try {
    const estado =
      etapa === 'GANADO' ? 'GANADO' : etapa === 'PERDIDO' ? 'PERDIDO' : 'ACTIVO'
    await prisma.cliente.update({
      where: { id },
      data: { etapa: etapa as never, estado: estado as never, ultimoContacto: new Date() },
    })
    await prisma.nota.create({
      data: { clienteId: id, usuarioId: session.user.id, contenido: `Etapa cambiada a ${etapa}`, tipo: 'ETAPA' },
    })
    revalidatePath('/embudo')
    revalidatePath('/clientes')
    return { success: true }
  } catch {
    return { success: false, error: 'Error al cambiar etapa' }
  }
}

export async function cambiarEstado(id: string, estado: string, motivo?: string): Promise<Resultado> {
  const session = await getSession()
  if (!session) return { success: false, error: 'No autenticado' }
  if (!puede(session.user.rol as Rol, 'editar')) return { success: false, error: 'Sin permiso' }
  try {
    await prisma.cliente.update({
      where: { id },
      data: {
        estado: estado as never,
        etapa: estado === 'GANADO' ? 'GANADO' : estado === 'PERDIDO' ? 'PERDIDO' : undefined,
        objecion: motivo ?? undefined,
      },
    })
    await prisma.nota.create({
      data: { clienteId: id, usuarioId: session.user.id, contenido: `Estado: ${estado}${motivo ? ` (${motivo})` : ''}`, tipo: 'SISTEMA' },
    })
    revalidatePath('/clientes')
    return { success: true }
  } catch {
    return { success: false, error: 'Error' }
  }
}

export async function eliminarCliente(id: string): Promise<Resultado> {
  const session = await getSession()
  if (!session) return { success: false, error: 'No autenticado' }
  if (!puede(session.user.rol as Rol, 'eliminar')) return { success: false, error: 'Sin permiso para eliminar' }
  try {
    await prisma.cliente.update({ where: { id }, data: { eliminadoEn: new Date() } })
    await registrarAuditoria({ usuarioId: session.user.id, accion: 'eliminar', entidad: 'cliente', entidadId: id })
    revalidatePath('/clientes')
    return { success: true }
  } catch {
    return { success: false, error: 'Error al eliminar' }
  }
}

export async function buscarDuplicados(telefono?: string, correo?: string) {
  const session = await getSession()
  if (!session) return []
  if (!telefono && !correo) return []
  return prisma.cliente.findMany({
    where: {
      eliminadoEn: null,
      OR: [
        telefono ? { telefono } : undefined,
        correo ? { correo } : undefined,
      ].filter(Boolean) as object[],
    },
    select: { id: true, nombre: true, telefono: true, correo: true },
    take: 5,
  })
}

export async function toggleFavorito(clienteId: string): Promise<Resultado> {
  const session = await getSession()
  if (!session) return { success: false, error: 'No autenticado' }
  const existente = await prisma.favorito.findUnique({
    where: { usuarioId_clienteId: { usuarioId: session.user.id, clienteId } },
  })
  if (existente) {
    await prisma.favorito.delete({ where: { usuarioId_clienteId: { usuarioId: session.user.id, clienteId } } })
  } else {
    await prisma.favorito.create({ data: { usuarioId: session.user.id, clienteId } })
  }
  revalidatePath('/clientes')
  return { success: true }
}
