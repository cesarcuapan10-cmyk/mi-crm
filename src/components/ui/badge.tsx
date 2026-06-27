import { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

const colorMap: Record<string, string> = {
  blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  yellow: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
  orange: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  green: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  red: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  gray: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
}

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  color?: string
}

export function Badge({ color = 'gray', className, ...props }: BadgeProps) {
  return (
    <span
      className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium', colorMap[color] ?? colorMap.gray, className)}
      {...props}
    />
  )
}
