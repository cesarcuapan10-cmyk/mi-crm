'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import { crearPago } from '@/app/actions/pagos'
import { METODOS_PAGO } from '@/lib/constants'

export function PagoFormButton({ clientes }: { clientes: { id: string; nombre: string }[] }) {
  const router = useRouter()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ clienteId: '', monto: '', metodo: 'TRANSFERENCIA', estatus: 'PENDIENTE', concepto: '', fechaVencimiento: '' })

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const r = await crearPago({ ...form, monto: Number(form.monto) })
    setLoading(false)
    if (r.success) {
      toast('success', 'Pago registrado')
      setOpen(false)
      router.refresh()
    } else toast('error', r.error ?? 'Error')
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>+ Registrar pago</Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Registrar pago">
        <form onSubmit={submit} className="space-y-3">
          <Select label="Cliente" value={form.clienteId} onChange={(e) => set('clienteId', e.target.value)} required>
            <option value="">Selecciona</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </Select>
          <Input label="Monto" type="number" value={form.monto} onChange={(e) => set('monto', e.target.value)} required />
          <Select label="Método" value={form.metodo} onChange={(e) => set('metodo', e.target.value)}>
            {Object.entries(METODOS_PAGO).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </Select>
          <Select label="Estatus" value={form.estatus} onChange={(e) => set('estatus', e.target.value)}>
            <option value="PENDIENTE">Pendiente</option>
            <option value="PAGADO">Pagado</option>
            <option value="VENCIDO">Vencido</option>
          </Select>
          <Input label="Concepto" value={form.concepto} onChange={(e) => set('concepto', e.target.value)} />
          <Input label="Fecha de vencimiento" type="date" value={form.fechaVencimiento} onChange={(e) => set('fechaVencimiento', e.target.value)} />
          <Button type="submit" loading={loading}>
            Guardar
          </Button>
        </form>
      </Modal>
    </>
  )
}
