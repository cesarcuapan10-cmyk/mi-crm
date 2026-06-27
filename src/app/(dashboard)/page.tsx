import Link from 'next/link'
import { TrendingUp, TrendingDown, Users, Calendar, DollarSign, Target, Percent, AlertCircle } from 'lucide-react'
import { getDashboardStats } from '@/app/actions/dashboard'
import { Card } from '@/components/ui/card'
import { RevenueChart } from '@/components/dashboard/charts'
import { formatMoneda } from '@/lib/format'
import { META_MES } from '@/lib/constants'

export default async function TableroPage() {
  const stats = await getDashboardStats()
  if (!stats) return <div>No autorizado</div>

  const progreso = Math.min(100, Math.round((stats.nuevosMes / META_MES) * 100))

  const tarjetas = [
    { label: 'Nuevos clientes', value: stats.nuevosMes, icon: Users, color: 'text-blue-500' },
    { label: 'Citas agendadas', value: stats.citasMes, icon: Calendar, color: 'text-purple-500' },
    { label: 'Cobrado este mes', value: formatMoneda(stats.ingresosMes), icon: DollarSign, color: 'text-green-500' },
    { label: 'Tasa de cierre', value: `${stats.tasaCierre}%`, icon: Percent, color: 'text-amber-500' },
    { label: 'Valor del embudo', value: formatMoneda(stats.valorFunnel), icon: Target, color: 'text-cyan-500' },
    { label: 'Pagos vencidos', value: formatMoneda(stats.vencidosTotal), icon: AlertCircle, color: 'text-red-500' },
  ]

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Tablero</h1>
        {stats.leadsSinContacto > 0 && (
          <Link href="/seguimiento" className="flex items-center gap-2 rounded-full bg-red-100 px-3 py-1 text-sm text-red-700 dark:bg-red-900/40 dark:text-red-300">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            {stats.leadsSinContacto} leads sin contactar
          </Link>
        )}
      </div>

      {/* Meta del mes */}
      <Card>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-semibold">Meta del mes: {META_MES} nuevos clientes</h2>
          <span className="text-sm text-secondary">
            {stats.nuevosMes} / {META_MES}
          </span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-[var(--bg-secondary)]">
          <div className="h-full rounded-full bg-[var(--color-marca)] transition-all" style={{ width: `${progreso}%` }} />
        </div>
        <div className="mt-2 flex items-center gap-1 text-sm">
          {stats.variacion >= 0 ? (
            <TrendingUp className="h-4 w-4 text-green-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500" />
          )}
          <span className={stats.variacion >= 0 ? 'text-green-600' : 'text-red-600'}>{Math.abs(stats.variacion)}%</span>
          <span className="text-secondary">vs mes anterior (ingresos)</span>
        </div>
      </Card>

      {/* Bento de stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {tarjetas.map((t) => {
          const Icon = t.icon
          return (
            <Card key={t.label}>
              <Icon className={`mb-2 h-5 w-5 ${t.color}`} />
              <p className="text-2xl font-semibold">{t.value}</p>
              <p className="text-sm text-secondary">{t.label}</p>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <h2 className="mb-3 font-semibold">Ingresos y clientes ganados (6 meses)</h2>
          <RevenueChart data={stats.meses} />
        </Card>
        <Card>
          <h2 className="mb-3 font-semibold">De dónde llegan</h2>
          <div className="space-y-2">
            {stats.porCanal.length === 0 && <p className="text-sm text-secondary">Sin datos.</p>}
            {stats.porCanal.map((c) => (
              <div key={c.canal} className="flex items-center justify-between text-sm">
                <span>{c.canal}</span>
                <span className="font-medium">{c.total}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
