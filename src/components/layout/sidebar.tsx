'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Kanban,
  Calendar,
  CreditCard,
  ListChecks,
  FileText,
  Share2,
  UsersRound,
  Shield,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar } from '@/components/ui/avatar'

const links = [
  { href: '/', label: 'Tablero', icon: LayoutDashboard },
  { href: '/clientes', label: 'Clientes', icon: Users },
  { href: '/embudo', label: 'Embudo', icon: Kanban },
  { href: '/agenda', label: 'Agenda', icon: Calendar },
  { href: '/pagos', label: 'Pagos', icon: CreditCard },
  { href: '/seguimiento', label: 'Seguimiento', icon: ListChecks },
  { href: '/plantillas', label: 'Plantillas', icon: FileText },
  { href: '/compartir', label: 'Compartir', icon: Share2 },
  { href: '/equipo', label: 'Equipo', icon: UsersRound },
  { href: '/admin', label: 'Admin', icon: Shield },
]

export function Sidebar({ nombre, rol }: { nombre: string; rol: string }) {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex md:w-60 md:flex-col md:border-r md:border-[var(--border)] md:bg-[var(--bg-secondary)] md:p-4">
      <div className="mb-6 flex items-center gap-2 px-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-marca)] font-bold text-neutral-900">
          CC
        </div>
        <span className="font-semibold leading-tight">César Cuapan CRM</span>
      </div>
      <nav className="flex flex-1 flex-col gap-1">
        {links.map((l) => {
          const active = l.href === '/' ? pathname === '/' : pathname.startsWith(l.href)
          const Icon = l.icon
          return (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                active
                  ? 'bg-[var(--color-marca)] font-medium text-neutral-900'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-primary)] hover:text-[var(--text-primary)]'
              )}
            >
              <Icon className="h-4 w-4" />
              {l.label}
            </Link>
          )
        })}
      </nav>
      <div className="mt-4 flex items-center gap-3 rounded-lg border border-[var(--border)] p-2">
        <Avatar name={nombre} size={36} />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{nombre}</p>
          <p className="text-xs text-secondary">{rol}</p>
        </div>
      </div>
    </aside>
  )
}
