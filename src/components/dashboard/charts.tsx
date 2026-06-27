'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

export function RevenueChart({ data }: { data: { mes: string; ingresos: number; ganados: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(125,125,125,0.15)" />
        <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip
          contentStyle={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 8 }}
          formatter={(value, name) => {
            const v = Number(value)
            return [name === 'ingresos' ? `$${v.toLocaleString('es-MX')}` : v, name === 'ingresos' ? 'Ingresos' : 'Ganados']
          }}
        />
        <Bar dataKey="ingresos" fill="#e8b763" radius={[4, 4, 0, 0]} />
        <Bar dataKey="ganados" fill="#60a5fa" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
