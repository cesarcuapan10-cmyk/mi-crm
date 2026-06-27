'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { completarOnboarding } from '@/app/actions/usuarios'

const pasos = [
  { titulo: '¡Bienvenido a tu CRM! 👋', texto: 'Aquí gestionarás todos tus clientes de coaching y consultoría.' },
  { titulo: 'Tablero', texto: 'Revisa tu meta del mes, ingresos y de dónde llegan tus clientes.' },
  { titulo: 'Embudo', texto: 'Arrastra clientes entre etapas para mover tus oportunidades.' },
  { titulo: 'Seguimiento', texto: 'Cada día verás a quién contactar primero según prioridad.' },
  { titulo: 'Asistente IA', texto: 'En cada cliente tienes ayuda para escribir mensajes y cerrar ventas.' },
]

export function OnboardingTour({ completado }: { completado: boolean }) {
  const [visible, setVisible] = useState(!completado)
  const [paso, setPaso] = useState(0)

  if (!visible) return null

  const finalizar = async () => {
    setVisible(false)
    await completarOnboarding()
  }

  const actual = pasos[paso]

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 p-4">
      <div className="card max-w-sm p-6 text-center">
        <h2 className="text-lg font-semibold">{actual.titulo}</h2>
        <p className="mt-2 text-sm text-secondary">{actual.texto}</p>
        <div className="mt-2 flex justify-center gap-1">
          {pasos.map((_, i) => (
            <span key={i} className={`h-1.5 w-1.5 rounded-full ${i === paso ? 'bg-[var(--color-marca)]' : 'bg-[var(--border)]'}`} />
          ))}
        </div>
        <div className="mt-5 flex justify-between gap-2">
          <Button variant="ghost" size="sm" onClick={finalizar}>
            Saltar
          </Button>
          <div className="flex gap-2">
            {paso > 0 && (
              <Button variant="secondary" size="sm" onClick={() => setPaso((p) => p - 1)}>
                Atrás
              </Button>
            )}
            {paso < pasos.length - 1 ? (
              <Button size="sm" onClick={() => setPaso((p) => p + 1)}>
                Siguiente
              </Button>
            ) : (
              <Button size="sm" onClick={finalizar}>
                Empezar
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
