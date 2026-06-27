'use client'

import { useState } from 'react'
import { Sparkles, MessageSquare, Thermometer, ArrowRight, FileText, Shield } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  escribirMensaje,
  clasificarTemperatura,
  sugerirProximaAccion,
  resumirCliente,
  manejarObjecion,
} from '@/app/actions/ia'

const acciones = [
  { key: 'mensaje', label: 'Escribir mensaje', icon: MessageSquare, fn: escribirMensaje },
  { key: 'temp', label: 'Clasificar temperatura', icon: Thermometer, fn: clasificarTemperatura },
  { key: 'accion', label: 'Sugerir próxima acción', icon: ArrowRight, fn: sugerirProximaAccion },
  { key: 'resumen', label: 'Resumir cliente', icon: FileText, fn: resumirCliente },
  { key: 'objecion', label: 'Manejar objeción', icon: Shield, fn: manejarObjecion },
]

export function AssistantPanel({ clienteId }: { clienteId: string }) {
  const [loading, setLoading] = useState<string | null>(null)
  const [resultado, setResultado] = useState<string>('')

  const run = async (key: string, fn: (id: string) => Promise<{ success: boolean; texto?: string; error?: string }>) => {
    setLoading(key)
    setResultado('')
    const r = await fn(clienteId)
    setLoading(null)
    setResultado(r.texto || r.error || 'Sin respuesta')
  }

  return (
    <Card>
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-[var(--color-marca)]" />
        <h3 className="font-semibold">Asistente IA</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {acciones.map((a) => {
          const Icon = a.icon
          return (
            <Button key={a.key} variant="secondary" size="sm" loading={loading === a.key} onClick={() => run(a.key, a.fn)}>
              <Icon className="h-4 w-4" /> {a.label}
            </Button>
          )
        })}
      </div>
      {resultado && (
        <div className="mt-4 whitespace-pre-wrap rounded-lg bg-[var(--bg-secondary)] p-3 text-sm">{resultado}</div>
      )}
    </Card>
  )
}
