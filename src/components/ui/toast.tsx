'use client'
import { createContext, useCallback, useContext, useState, ReactNode } from 'react'
import { CheckCircle, XCircle, Info, X } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info'
interface Toast {
  id: number
  type: ToastType
  message: string
}

const ToastContext = createContext<{ toast: (type: ToastType, message: string) => void }>({
  toast: () => {},
})

export function useToast() {
  return useContext(ToastContext)
}

const icons = {
  success: <CheckCircle className="h-5 w-5 text-green-500" />,
  error: <XCircle className="h-5 w-5 text-red-500" />,
  info: <Info className="h-5 w-5 text-blue-500" />,
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((type: ToastType, message: string) => {
    const id = Date.now() + Math.random()
    setToasts((t) => [...t, { id, type, message }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000)
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
        {toasts.map((t) => (
          <div key={t.id} className="flex items-center gap-3 rounded-lg bg-[var(--bg-primary)] px-4 py-3 shadow-lg border border-[var(--border)] min-w-[260px]">
            {icons[t.type]}
            <span className="text-sm">{t.message}</span>
            <button onClick={() => setToasts((x) => x.filter((y) => y.id !== t.id))} className="ml-auto">
              <X className="h-4 w-4 text-secondary" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
