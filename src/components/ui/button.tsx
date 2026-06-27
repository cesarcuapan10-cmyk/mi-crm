'use client'

import { ButtonHTMLAttributes, forwardRef } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
}

const variants: Record<Variant, string> = {
  primary: 'bg-[var(--color-marca)] text-neutral-900 hover:bg-[var(--color-marca-hover)] font-semibold',
  secondary: 'bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:opacity-80 border border-[var(--border)]',
  ghost: 'bg-transparent text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]',
  danger: 'bg-red-500 text-white hover:bg-red-600',
  outline: 'bg-transparent border border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]',
}

const sizes: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, className, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'
