'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, Kanban, ListChecks, Menu } from 'lucide-react'
import { cn } from '@/lib/utils'

const tabs = [
  { href: '/', label: 'Tablero', icon: LayoutDashboard },
  { href: '/clientes', label: 'Clientes', icon: Users },
  { href: '/embudo', label: 'Embudo', icon: Kanban },
  { href: '/seguimiento', label: 'Seguir', icon: ListChecks },
  { href: '/admin', label: 'Más', icon: Menu },
]

export function BottomNav() {
  const pathname = usePathname()
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-[var(--border)] bg-[var(--bg-primary)] md:hidden">
      {tabs.map((t) => {
        const active = t.href === '/' ? pathname === '/' : pathname.startsWith(t.href)
        const Icon = t.icon
        return (
          <Link
            key={t.href}
            href={t.href}
            className={cn(
              'flex flex-1 flex-col items-center gap-0.5 py-2 text-xs',
              active ? 'text-[var(--color-marca-dark)]' : 'text-[var(--text-secondary)]'
            )}
          >
            <Icon className="h-5 w-5" />
            {t.label}
          </Link>
        )
      })}
    </nav>
  )
}
