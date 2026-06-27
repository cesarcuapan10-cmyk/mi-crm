'use client'
import { InputHTMLAttributes, forwardRef, useId } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  helper?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, helper, error, className, id, ...props }, ref) => {
    const genId = useId()
    const inputId = id ?? genId
    return (
      <div className="w-full">
        {label && <label htmlFor={inputId} className="mb-1 block text-sm font-medium">{label}</label>}
        <input
          ref={ref}
          id={inputId}
          className={cn('input-base', error && 'border-red-500', className)}
          {...props}
        />
        {error ? (
          <p className="mt-1 text-xs text-red-500">{error}</p>
        ) : helper ? (
          <p className="mt-1 text-xs text-secondary">{helper}</p>
        ) : null}
      </div>
    )
  }
)
Input.displayName = 'Input'
