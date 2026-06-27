'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function buscarGlobal(query: string) {
  const session = await auth()
  if (!session?.user) return { clientes: [], empresas: [], pagos: [] }
  if (!query || query.trim().length < 2) return { clientes: [], empresas: [], pagos: [] }

  const q = query.trim()

  const clientes = await prisma.cliente.findMany({
    where: {
      eliminadoEn: null,
      OR: [
        { nombre: { contains: q } },
        { telefono: { contains: q } },
        { correo: { contains: q } },
        { notas: { contains: q } },
      ],
    },
    take: 8,
    select: { id: true, nombre: true, telefono: true, etapa: true },
  })

  const empresas = await prisma.empresa.findMany({
    where: { nombre: { contains: q } },
    take: 5,
    select: { id: true, nombre: true, giro: true },
  })

  return { clientes, empresas, pagos: [] }
}
