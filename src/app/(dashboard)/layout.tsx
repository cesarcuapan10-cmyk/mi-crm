import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { Sidebar } from '@/components/layout/sidebar'
import { TopBar } from '@/components/layout/top-bar'
import { BottomNav } from '@/components/layout/bottom-nav'
import { OnboardingTour } from '@/components/onboarding/tour'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const nombre = session.user.name ?? 'Usuario'
  const rol = session.user.rol ?? 'VENDEDOR'
  const usuario = await prisma.usuario.findUnique({ where: { id: session.user.id }, select: { onboardingCompletado: true } })

  return (
    <div className="flex min-h-screen">
      <Sidebar nombre={nombre} rol={rol} />
      <div className="flex flex-1 flex-col">
        <TopBar nombre={nombre} />
        <main className="flex-1 p-4 pb-20 md:p-6 md:pb-6">{children}</main>
        <BottomNav />
      </div>
      <OnboardingTour completado={usuario?.onboardingCompletado ?? true} />
    </div>
  )
}
