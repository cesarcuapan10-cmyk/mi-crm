'use server'

import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export async function registrarLead(input: { nombre: string; telefono: string; correo?: string; utmSource?: string }) {
  const parsed = z
    .object({
      nombre: z.string().min(2),
      telefono: z.string().min(8),
      correo: z.string().email().optional().or(z.literal('')),
      utmSource: z.string().optional(),
    })
    .safeParse(input)
  if (!parsed.success) return { success: false, error: 'Datos inválidos' }
  const d = parsed.data
  try {
    const admin = await prisma.usuario.findFirst({ where: { rol: 'ADMIN', eliminadoEn: null } })
    await prisma.cliente.create({
      data: {
        nombre: d.nombre,
        telefono: d.telefono,
        correo: d.correo || null,
        origen: d.utmSource || 'Landing',
        utmSource: d.utmSource || null,
        etapa: 'NUEVO',
        usuarioId: admin?.id,
      },
    })
    return { success: true }
  } catch {
    return { success: false, error: 'No se pudo registrar' }
  }
}
