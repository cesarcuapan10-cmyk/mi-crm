'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const BASE = typeof window !== 'undefined' ? window.location.origin : 'https://tu-crm.com'

const canales = [
  { nombre: 'WhatsApp', utm: 'whatsapp', color: 'green' },
  { nombre: 'Facebook', utm: 'facebook', color: 'blue' },
  { nombre: 'Instagram', utm: 'instagram', color: 'purple' },
  { nombre: 'Directo', utm: 'directo', color: 'gray' },
]

export default function CompartirPage() {
  const [copied, setCopied] = useState<string | null>(null)

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 1500)
  }

  const landing = `${BASE}/landing`

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Compartir</h1>

      <Card>
        <h3 className="mb-2 font-semibold">Tu página de captura</h3>
        <div className="flex items-center gap-2">
          <input readOnly value={landing} className="input-base" />
          <Button variant="secondary" onClick={() => copy(landing, 'base')}>
            {copied === 'base' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
      </Card>

      <Card>
        <h3 className="mb-3 font-semibold">Enlaces por canal (con UTM)</h3>
        <div className="space-y-2">
          {canales.map((c) => {
            const link = `${landing}?utm_source=${c.utm}`
            return (
              <div key={c.utm} className="flex items-center gap-2">
                <span className="w-24 text-sm font-medium">{c.nombre}</span>
                <input readOnly value={link} className="input-base" />
                <Button variant="secondary" size="sm" onClick={() => copy(link, c.utm)}>
                  {copied === c.utm ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
                <a href={`https://wa.me/?text=${encodeURIComponent(link)}`} target="_blank" rel="noreferrer">
                  <Button size="sm">Compartir</Button>
                </a>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
