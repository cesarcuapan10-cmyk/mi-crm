'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await signIn('credentials', { email, password, redirect: false })
    setLoading(false)
    if (res?.error) {
      setError('Credenciales incorrectas')
    } else {
      router.push('/')
      router.refresh()
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg-secondary)] p-4">
      <div className="card w-full max-w-sm p-8">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-marca)] text-lg font-bold text-neutral-900">
            CC
          </div>
          <h1 className="text-xl font-semibold">César Cuapan CRM</h1>
          <p className="text-sm text-secondary">Coaching, consultoría y mentoría</p>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <Input label="Correo" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input label="Contraseña" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" loading={loading} className="w-full">
            Entrar
          </Button>
        </form>
      </div>
    </div>
  )
}
