'use client'
import { SelectHTMLAttributes, forwardRef, useId } from 'react'
import { cn } from '@/lib/utils'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, className, id, children, ...props }, ref) => {
    const genId = useId()
    const selectId = id ?? genId
    return (
      <div className="w-full">
        {label && <label htmlFor={selectId} className="mb-1 block text-sm font-medium">{label}</label>}
        <select ref={ref} id={selectId} className={cn('input-base', className)} {...props}>
          {children}
        </select>
      </div>
    )
  }
)
Select.displayName = 'Select'
