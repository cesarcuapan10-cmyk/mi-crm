import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { PlantillasManager } from '@/components/plantillas/plantillas-manager'

export default async function PlantillasPage() {
  const session = await auth()
  if (!session?.user) return null
  const mias = await prisma.plantillaMensaje.findMany({
    where: { usuarioId: session.user.id },
    orderBy: { creadoEn: 'desc' },
  })
  return <PlantillasManager mias={mias} />
}
