import { cn } from '@/lib/utils'

const colors = ['#e8b763', '#60a5fa', '#a78bfa', '#34d399', '#f472b6', '#fb923c', '#22d3ee']

function hashColor(name: string) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h)
  return colors[Math.abs(h) % colors.length]
}

export function Avatar({ name, size = 36, className }: { name: string; size?: number; className?: string }) {
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
  return (
    <div
      className={cn('flex items-center justify-center rounded-full font-semibold text-neutral-900', className)}
      style={{ width: size, height: size, backgroundColor: hashColor(name), fontSize: size * 0.4 }}
    >
      {initials}
    </div>
  )
}
