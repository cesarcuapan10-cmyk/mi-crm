'use client'

import { useState } from 'react'
import { signOut } from 'next-auth/react'
import { Moon, Sun, LogOut, ChevronDown } from 'lucide-react'
import { Avatar } from '@/components/ui/avatar'
import { GlobalSearch } from '@/components/search/global-search'
import { NotificationBell } from '@/components/notifications/bell'
import { useTheme } from '@/components/providers'

export function TopBar({ nombre }: { nombre: string }) {
  const [open, setOpen] = useState(false)
  const { theme, toggle } = useTheme()

  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-[var(--border)] bg-[var(--bg-primary)]/80 px-4 py-3 backdrop-blur">
      <div className="md:hidden font-semibold">César Cuapan CRM</div>
      <div className="ml-auto flex items-center gap-2">
        <GlobalSearch />
        <NotificationBell />
        <button onClick={toggle} className="rounded-lg p-2 hover:bg-[var(--bg-secondary)]">
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
        <div className="relative">
          <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-1 rounded-lg p-1 hover:bg-[var(--bg-secondary)]">
            <Avatar name={nombre} size={32} />
            <ChevronDown className="h-4 w-4" />
          </button>
          {open && (
            <div className="absolute right-0 z-50 mt-2 w-44 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] p-1 shadow-lg">
              <div className="px-3 py-2 text-sm font-medium">{nombre}</div>
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-500 hover:bg-[var(--bg-secondary)]"
              >
                <LogOut className="h-4 w-4" /> Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
