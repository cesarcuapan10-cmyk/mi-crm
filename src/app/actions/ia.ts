'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { MODEL_IA } from '@/lib/constants'

type IAResult = { success: boolean; texto?: string; error?: string }

async function llamarIA(system: string, prompt: string, fallback: string): Promise<IAResult> {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) return { success: true, texto: fallback }
  try {
    const Anthropic = (await import('@anthropic-ai/sdk')).default
    const client = new Anthropic({ apiKey: key })
    const msg = await client.messages.create({
      model: MODEL_IA,
      max_tokens: 600,
      system,
      messages: [{ role: 'user', content: prompt }],
    })
    const texto = msg.content
      .map((b) => (b.type === 'text' ? b.text : ''))
      .join('\n')
      .trim()
    return { success: true, texto: texto || fallback }
  } catch {
    return { success: true, texto: fallback }
  }
}

async function getCliente(clienteId: string) {
  return prisma.cliente.findUnique({
    where: { id: clienteId },
    include: { empresa: true, notasRel: { orderBy: { creadoEn: 'desc' }, take: 5 } },
  })
}

export async function escribirMensaje(clienteId: string): Promise<IAResult> {
  const session = await auth()
  if (!session?.user) return { success: false, error: 'No autenticado' }
  const c = await getCliente(clienteId)
  if (!c) return { success: false, error: 'Cliente no encontrado' }
  const fallback = `Hola ${c.nombre}, soy César de Entidad Vendedora. Me dio mucho gusto saludarte. Me encantaría platicar contigo sobre cómo podemos ayudarte con ${c.retoPrincipal || 'tu objetivo'}. ¿Tienes unos minutos esta semana?`
  return llamarIA(
    'Eres César, coach y consultor. Escribe mensajes de WhatsApp cálidos, breves y profesionales en español de México.',
    `Escribe un mensaje de WhatsApp para ${c.nombre}, etapa ${c.etapa}, reto: ${c.retoPrincipal || 'no especificado'}, objeción: ${c.objecion || 'ninguna'}.`,
    fallback
  )
}

export async function clasificarTemperatura(clienteId: string): Promise<IAResult> {
  const session = await auth()
  if (!session?.user) return { success: false, error: 'No autenticado' }
  const c = await getCliente(clienteId)
  if (!c) return { success: false, error: 'Cliente no encontrado' }
  const notas = c.notasRel.map((n) => n.contenido).join('. ')
  const fallback = `Según la actividad reciente, este cliente parece ${c.temperatura === 'CALIENTE' ? 'CALIENTE 🔥 (alta intención)' : c.temperatura === 'TIBIO' ? 'TIBIO ☀️ (interés moderado)' : 'FRÍO ❄️ (poca actividad)'}. Recomendación: ${c.temperatura === 'FRIO' ? 'reactivar con un mensaje de valor.' : 'avanzar a la siguiente etapa.'}`
  return llamarIA(
    'Eres un asistente de ventas. Clasifica la temperatura del lead (CALIENTE, TIBIO o FRÍO) y justifica en 2 líneas.',
    `Cliente ${c.nombre}, etapa ${c.etapa}. Notas: ${notas || 'sin notas'}.`,
    fallback
  )
}

export async function sugerirProximaAccion(clienteId: string): Promise<IAResult> {
  const session = await auth()
  if (!session?.user) return { success: false, error: 'No autenticado' }
  const c = await getCliente(clienteId)
  if (!c) return { success: false, error: 'Cliente no encontrado' }
  const acciones: Record<string, string> = {
    NUEVO: 'Hacer el primer contacto por WhatsApp y presentarte.',
    CONTACTADO: 'Agendar una cita de diagnóstico de 45 minutos.',
    CITA_AGENDADA: 'Confirmar la cita un día antes y preparar la propuesta.',
    PROPUESTA_ENVIADA: 'Dar seguimiento a la propuesta y resolver objeciones.',
  }
  const fallback = `Próxima acción sugerida: ${acciones[c.etapa] || 'Dar seguimiento personalizado.'}`
  return llamarIA(
    'Eres un coach de ventas. Sugiere la siguiente acción concreta en 1-2 líneas.',
    `Cliente en etapa ${c.etapa}, temperatura ${c.temperatura}, objeción ${c.objecion || 'ninguna'}.`,
    fallback
  )
}

export async function resumirCliente(clienteId: string): Promise<IAResult> {
  const session = await auth()
  if (!session?.user) return { success: false, error: 'No autenticado' }
  const c = await getCliente(clienteId)
  if (!c) return { success: false, error: 'Cliente no encontrado' }
  const fallback = `${c.nombre} está en etapa ${c.etapa}, temperatura ${c.temperatura}. Valor estimado: ${c.valorEstimado ?? 'sin estimar'}. Reto principal: ${c.retoPrincipal || 'no definido'}. ${c.notasRel.length} interacciones recientes.`
  return llamarIA(
    'Resume el estado del cliente en un párrafo claro para el vendedor.',
    `Cliente: ${c.nombre}, etapa ${c.etapa}, notas: ${c.notasRel.map((n) => n.contenido).join('. ')}`,
    fallback
  )
}

export async function manejarObjecion(clienteId: string): Promise<IAResult> {
  const session = await auth()
  if (!session?.user) return { success: false, error: 'No autenticado' }
  const c = await getCliente(clienteId)
  if (!c) return { success: false, error: 'Cliente no encontrado' }
  const obj = c.objecion || 'el precio'
  const fallback = `Para manejar la objeción "${obj}": valida su preocupación, reencuadra hacia el valor y retorno de la inversión, y comparte un caso de éxito breve. Cierra con una pregunta que invite a avanzar.`
  return llamarIA(
    'Eres experto en cierre de ventas. Da un guion breve para manejar la objeción.',
    `Objeción del cliente ${c.nombre}: "${obj}".`,
    fallback
  )
}
