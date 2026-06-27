'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { puede, type Rol } from '@/lib/auth-utils'
import { revalidatePath } from 'next/cache'

export async function subirArchivo(formData: FormData) {
  const session = await auth()
  if (!session?.user) return { success: false, error: 'No autenticado' }
  if (!puede(session.user.rol as Rol, 'crear')) return { success: false, error: 'Sin permiso' }

  const clienteId = formData.get('clienteId') as string
  const etiqueta = (formData.get('etiqueta') as string) || 'OTRO'
  const file = formData.get('file') as File | null
  if (!file || !clienteId) return { success: false, error: 'Falta archivo' }

  try {
    const bytes = Buffer.from(await file.arrayBuffer())
    await prisma.archivo.create({
      data: {
        clienteId,
        usuarioId: session.user.id,
        nombre: file.name,
        etiqueta: etiqueta as never,
        tipo: file.type,
        tamano: file.size,
        datos: bytes,
      },
    })
    await prisma.nota.create({
      data: { clienteId, usuarioId: session.user.id, contenido: `Archivo subido: ${file.name}`, tipo: 'ARCHIVO' },
    })
    revalidatePath(`/clientes/${clienteId}`)
    return { success: true }
  } catch {
    return { success: false, error: 'Error al subir archivo' }
  }
}

export async function eliminarArchivo(id: string, clienteId: string) {
  const session = await auth()
  if (!session?.user) return { success: false, error: 'No autenticado' }
  if (!puede(session.user.rol as Rol, 'eliminar')) return { success: false, error: 'Sin permiso' }
  await prisma.archivo.delete({ where: { id } })
  revalidatePath(`/clientes/${clienteId}`)
  return { success: true }
}
