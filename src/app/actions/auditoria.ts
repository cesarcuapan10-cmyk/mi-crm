'use server'

import { prisma } from '@/lib/prisma'

export async function registrarAuditoria(params: {
  usuarioId?: string | null
  accion: string
  entidad: string
  entidadId?: string | null
  detalle?: string | null
}) {
  try {
    await prisma.registroAuditoria.create({
      data: {
        usuarioId: params.usuarioId ?? null,
        accion: params.accion,
        entidad: params.entidad,
        entidadId: params.entidadId ?? null,
        detalle: params.detalle ?? null,
      },
    })
  } catch {
    // no-op: la auditoría no debe romper la operación principal
  }
}
