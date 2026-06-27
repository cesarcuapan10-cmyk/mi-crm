import type { Metadata } from 'next'
import { Suspense } from 'react'
import { LandingForm } from './landing-form'

export const metadata: Metadata = {
  title: 'Transforma tu negocio con César Cuapan',
  description: 'Coaching, consultoría y mentoría para llevar tu negocio al siguiente nivel.',
  openGraph: {
    title: 'Transforma tu negocio con César Cuapan',
    description: 'Coaching, consultoría y mentoría para llevar tu negocio al siguiente nivel.',
    type: 'website',
  },
}

const testimonios = [
  { nombre: 'Laura M.', texto: 'César me ayudó a duplicar mis clientes en 3 meses.' },
  { nombre: 'Jorge R.', texto: 'La mentoría cambió por completo mi forma de vender.' },
  { nombre: 'Sofía P.', texto: 'Por fin tengo claridad y un plan que funciona.' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-secondary)]">
      <header className="bg-[var(--color-marca)] px-6 py-16 text-center text-neutral-900">
        <h1 className="mx-auto max-w-2xl text-3xl font-bold md:text-4xl">
          Lleva tu negocio al siguiente nivel con coaching y mentoría personalizada
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg">
          Agenda una sesión de diagnóstico gratuita y descubre cómo lograr tus objetivos más rápido.
        </p>
      </header>

      <main className="mx-auto max-w-md px-4 py-10">
        <div className="card p-6">
          <h2 className="mb-4 text-center text-xl font-semibold">Solicita tu sesión gratuita</h2>
          <Suspense fallback={null}>
            <LandingForm />
          </Suspense>
        </div>

        <section className="mt-10">
          <h3 className="mb-4 text-center font-semibold">Lo que dicen nuestros clientes</h3>
          <div className="space-y-3">
            {testimonios.map((t) => (
              <div key={t.nombre} className="card p-4">
                <p className="text-sm italic">“{t.texto}”</p>
                <p className="mt-1 text-xs text-secondary">— {t.nombre}</p>
              </div>
            ))}
          </div>
        </section>

        <a
          href="https://wa.me/5210000000000?text=Hola%20César,%20quiero%20más%20información"
          className="mt-8 flex items-center justify-center gap-2 rounded-lg bg-green-500 py-3 font-semibold text-white"
        >
          Escríbenos por WhatsApp
        </a>
      </main>
    </div>
  )
}
