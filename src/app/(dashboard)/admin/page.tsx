import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { AdminPanel } from '@/components/admin/admin-panel'

export default async function AdminPage() {
  const session = await auth()
  if (!session?.user) return null
  if (session.user.rol !== 'ADMIN') redirect('/')

  const [usuarios, auditoria] = await Promise.all([
    prisma.usuario.findMany({ where: { eliminadoEn: null }, orderBy: { creadoEn: 'asc' }, select: { id: true, nombre: true, email: true, rol: true } }),
    prisma.registroAuditoria.findMany({ orderBy: { creadoEn: 'desc' }, take: 30, include: { usuario: { select: { nombre: true } } } }),
  ])

  return <AdminPanel usuarios={usuarios} auditoria={auditoria} />
}
