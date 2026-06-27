'use client'

import { ReactNode, createContext, useContext, useEffect, useState } from 'react'
import { SessionProvider } from 'next-auth/react'
import { ToastProvider } from '@/components/ui/toast'

type Theme = 'light' | 'dark'
const ThemeContext = createContext<{ theme: Theme; toggle: () => void }>({
  theme: 'light',
  toggle: () => {},
})

export function useTheme() {
  return useContext(ThemeContext)
}

function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light')

  useEffect(() => {
    const stored = (localStorage.getItem('tema') as Theme) || 'light'
    setTheme(stored)
    document.documentElement.setAttribute('data-theme', stored)
  }, [])

  const toggle = () => {
    setTheme((prev) => {
      const next = prev === 'light' ? 'dark' : 'light'
      localStorage.setItem('tema', next)
      document.documentElement.setAttribute('data-theme', next)
      return next
    })
  }

  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <ToastProvider>{children}</ToastProvider>
      </ThemeProvider>
    </SessionProvider>
  )
}
