import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { NextResponse } from 'next/server'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return new NextResponse('No autorizado', { status: 401 })
  const { id } = await params
  const archivo = await prisma.archivo.findUnique({ where: { id } })
  if (!archivo || !archivo.datos) return new NextResponse('No encontrado', { status: 404 })
  const body = new Uint8Array(archivo.datos)
  return new NextResponse(body, {
    headers: {
      'Content-Type': archivo.tipo || 'application/octet-stream',
      'Content-Disposition': `inline; filename="${archivo.nombre}"`,
    },
  })
}
