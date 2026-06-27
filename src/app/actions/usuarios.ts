'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { puede, type Rol } from '@/lib/auth-utils'
import { registrarAuditoria } from './auditoria'
import { revalidatePath } from 'next/cache'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const schema = z.object({
  nombre: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  rol: z.enum(['ADMIN', 'VENDEDOR', 'SOLO_LECTURA']).default('VENDEDOR'),
  metaMes: z.coerce.number().default(30),
})

async function requireAdmin() {
  const session = await auth()
  if (!session?.user) return null
  if (!puede(session.user.rol as Rol, 'admin')) return null
  return session
}

export async function crearUsuario(input: unknown) {
  const session = await requireAdmin()
  if (!session) return { success: false, error: 'Solo administradores' }
  const parsed = schema.safeParse(input)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message }
  const d = parsed.data
  const existe = await prisma.usuario.findUnique({ where: { email: d.email } })
  if (existe) return { success: false, error: 'El correo ya existe' }
  const hash = await bcrypt.hash(d.password, 10)
  const u = await prisma.usuario.create({
    data: { nombre: d.nombre, email: d.email, password: hash, rol: d.rol, metaMes: d.metaMes },
  })
  await registrarAuditoria({ usuarioId: session.user.id, accion: 'crear', entidad: 'usuario', entidadId: u.id })
  revalidatePath('/admin')
  revalidatePath('/equipo')
  return { success: true }
}

export async function desactivarUsuario(id: string) {
  const session = await requireAdmin()
  if (!session) return { success: false, error: 'Solo administradores' }
  await prisma.usuario.update({ where: { id }, data: { eliminadoEn: new Date() } })
  await registrarAuditoria({ usuarioId: session.user.id, accion: 'desactivar', entidad: 'usuario', entidadId: id })
  revalidatePath('/admin')
  return { success: true }
}

export async function resetPassword(id: string, nueva: string) {
  const session = await requireAdmin()
  if (!session) return { success: false, error: 'Solo administradores' }
  if (nueva.length < 6) return { success: false, error: 'Mínimo 6 caracteres' }
  const hash = await bcrypt.hash(nueva, 10)
  await prisma.usuario.update({ where: { id }, data: { password: hash } })
  await registrarAuditoria({ usuarioId: session.user.id, accion: 'reset-password', entidad: 'usuario', entidadId: id })
  return { success: true }
}

export async function completarOnboarding() {
  const session = await auth()
  if (!session?.user) return { success: false }
  await prisma.usuario.update({ where: { id: session.user.id }, data: { onboardingCompletado: true } })
  return { success: true }
}
