export const ETAPAS = {
  NUEVO: { label: 'Nuevo', color: 'blue', icon: '🌱' },
  CONTACTADO: { label: 'Contactado', color: 'purple', icon: '📞' },
  CITA_AGENDADA: { label: 'Cita agendada', color: 'yellow', icon: '📅' },
  PROPUESTA_ENVIADA: { label: 'Propuesta enviada', color: 'orange', icon: '📋' },
  GANADO: { label: 'Ganado', color: 'green', icon: '🎉' },
  PERDIDO: { label: 'Perdido', color: 'red', icon: '❌' },
} as const

export const TEMPERATURAS = {
  CALIENTE: { label: 'Caliente', emoji: '🔥', color: 'red' },
  TIBIO: { label: 'Tibio', emoji: '☀️', color: 'yellow' },
  FRIO: { label: 'Frío', emoji: '❄️', color: 'blue' },
} as const

export const ESTADOS = {
  ACTIVO: { label: 'Activo', color: 'green' },
  GANADO: { label: 'Ganado', color: 'emerald' },
  PERDIDO: { label: 'Perdido', color: 'red' },
  ARCHIVADO: { label: 'Archivado', color: 'gray' },
} as const

export const MODEL_IA = 'claude-haiku-4-5-20251001'

export const META_MES = 30

export const BRAND_COLOR = '#e8b763'

export const HORARIO = {
  inicio: '09:00',
  fin: '18:00',
  duracion: 45,
}

export const METODOS_PAGO = {
  TRANSFERENCIA: 'Transferencia',
  TARJETA: 'Tarjeta',
  LIGA_PAGO: 'Liga de pago',
} as const

export const ESTATUS_PAGO = {
  PENDIENTE: { label: 'Pendiente', color: 'yellow' },
  PAGADO: { label: 'Pagado', color: 'green' },
  VENCIDO: { label: 'Vencido', color: 'red' },
} as const

export const ORIGENES = [
  'Instagram', 'Facebook', 'WhatsApp', 'Referido', 'Google', 'Volante', 'LinkedIn', 'Otro'
] as const

export const MOTIVOS_PERDIDA = [
  'Precio muy alto',
  'No tenía tiempo',
  'Eligió a la competencia',
  'No era el momento',
  'Sin respuesta',
  'Falta de presupuesto',
  'Otro',
] as const

export const ETAPAS_EMBUDO = [
  'NUEVO', 'CONTACTADO', 'CITA_AGENDADA', 'PROPUESTA_ENVIADA', 'GANADO',
] as const
