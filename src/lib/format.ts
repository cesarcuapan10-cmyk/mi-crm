import { format, formatDistanceToNow, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

export function formatFecha(date: Date | string | null | undefined, fmt = 'dd/MM/yyyy'): string {
  if (!date) return '—'
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, fmt, { locale: es })
}

export function formatMoneda(amount: number | null | undefined): string {
  if (amount == null) return '—'
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount)
}

export function formatTelefono(tel: string | null | undefined): string {
  if (!tel) return '—'
  const digits = tel.replace(/\D/g, '')
  if (digits.length === 10) {
    return `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`
  }
  return tel
}

export function formatRelativo(date: Date | string | null | undefined): string {
  if (!date) return '—'
  const d = typeof date === 'string' ? parseISO(date) : date
  return formatDistanceToNow(d, { addSuffix: true, locale: es })
}

export function diasSinContacto(date: Date | string | null | undefined): number | null {
  if (!date) return null
  const d = typeof date === 'string' ? parseISO(date) : date
  return Math.floor((Date.now() - d.getTime()) / 86400000)
}
