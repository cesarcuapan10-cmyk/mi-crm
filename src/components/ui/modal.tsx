'use client'
import { ReactNode, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

export function Modal({
  open,
  onClose,
  title,
  children,
  size = 'md',
}: {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg'
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (open) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const maxW = size === 'sm' ? 'max-w-sm' : size === 'lg' ? 'max-w-3xl' : 'max-w-lg'

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/50" onClick={onClose} />
          <motion.div
            className={`relative z-10 w-full ${maxW} max-h-[85vh] overflow-y-auto rounded-2xl bg-[var(--bg-primary)] p-5 shadow-xl`}
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
          >
            <div className="mb-4 flex items-center justify-between">
              {title && <h2 className="text-lg font-semibold">{title}</h2>}
              <button onClick={onClose} className="ml-auto rounded-lg p-1 hover:bg-[var(--bg-secondary)]">
                <X className="h-5 w-5" />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
