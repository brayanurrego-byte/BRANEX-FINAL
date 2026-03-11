"use client"

import { useMemo } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, TrendingDown, Briefcase, PieChart as PieChartIcon, BarChart3 } from 'lucide-react'
import { ProtectedRoute } from '@/components/branex/protected-route'
import { useBranex } from '@/components/branex/branex-provider'
import { cn, formatNumber, formatCurrency } from '@/lib/utils'

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#0D0D2B]/95 backdrop-blur-xl border border-[rgba(0,163,255,0.2)] rounded-lg p-3 shadow-xl">
      <p className="text-xs text-[#8892b0] mb-2">{label}</p>
      {payload.map((entry, i: number) => (
        <div key={i} className="flex items-center gap-2 text-sm">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-[#8892b0]">{entry.name}:</span>
          <span className="font-mono font-medium text-white">
            {typeof entry.value === 'number' && entry.value < 1000 
              ? `${entry.value.toFixed(1)}%` 
              : `$${formatCurrency(entry.value)}`}
          </span>
        </div>
      ))}
    </div>
  )
}

// Empty state component
function EmptyState({ icon: Icon, title, description }: { icon: typeof Briefcase; title: string; description: string }) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center p-8">
      <div className="w-16 h-16 rounded-full bg-[rgba(0,163,255,0.1)] flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-[#00A3FF]/50" />
      </div>
      <p className="text-[#8892b0] mb-2">{title}</p>
      <p className="text-xs text-[#8892b0]/60 max-w-xs">{description}</p>
    </div>
  )
}

// Full page empty state
function FullPageEmptyState() {
  return (
    <div className="glass-card p-12 text-center animate-fade-slide-up">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#00A3FF]/20 to-[#0066FF]/20 border border-[#00A3FF]/30 mb-6">
        <BarChart3 className="w-10 h-10 text-[#00A3FF]" />
      </div>
      <h2 className="text-2xl font-bold font-[family-name:var(--font-space-grotesk)] text-white mb-3">
        Sin datos para analizar
      </h2>
      <p className="text-[#8892b0] max-w-md mx-auto mb-8">
        Agrega posiciones en tu portafolio para ver el analisis detallado de tu rendimiento, contribucion por posicion y distribucion sectorial.
      </p>
      <a
        href="/portafolio"
        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#00A3FF] to-[#0066FF] hover:opacity-90 text-white rounded-lg font-medium transition-opacity"
      >
        Ir a Portafolio
      </a>
    </div>
  )
}

export default function AnalisisPage() {
  const { holdingsWithMetrics, metrics, snapshots } = useBranex()
  
  const hasData = holdingsWithMetrics.length > 0
  const hasSnapshots = snapshots.length >= 2

  // Portfolio evolution data from snapshots
  const evolutionData = useMemo(() => {
    if (!hasSnapshots) return []
    
    const sortedSnapshots = [...snapshots].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    
    return sortedSnapshots.map((s) => ({
      date: new Date(s.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
      value: s.value,
    }))
  }, [snapshots, hasSnapshots])

  // Contribution by position (horizontal bar chart)
  const contributionData = useMemo(() => {
    if (!hasData || metrics.totalPnL === 0) return []
    
    return holdingsWithMetrics
      .map(h => ({
        symbol: h.symbol,
        contribution: metrics.totalPnL !== 0 ? (h.totalPnL / Math.abs(metrics.totalPnL)) * 100 : 0,
        pnl: h.totalPnL,
        isPositive: h.totalPnL >= 0,
      }))
      .sort((a, b) => b.contribution - a.contribution)
  }, [holdingsWithMetrics, metrics.totalPnL, hasData])

  // Sector table data
  const sectorTableData = useMemo(() => {
    if (!hasData) return []
    
    const sectorMap: Record<string, { 
      holdings: number
      totalValue: number
      totalPnL: number
      weight: number
      color: string
    }> = {}
    
    holdingsWithMetrics.forEach(h => {
      if (!sectorMap[h.sector]) {
        sectorMap[h.sector] = {
          holdings: 0,
          totalValue: 0,
          totalPnL: 0,
          weight: 0,
          color: h.sectorColor,
        }
      }
      sectorMap[h.sector].holdings += 1
      sectorMap[h.sector].totalValue += h.marketValue
      sectorMap[h.sector].totalPnL += h.totalPnL
      sectorMap[h.sector].weight += h.weight
    })
    
    return Object.entries(sectorMap).map(([name, data]) => ({
      name,
      ...data,
    })).sort((a, b) => b.weight - a.weight)
  }, [holdingsWithMetrics, hasData])

  return (
    <ProtectedRoute>
        <div className="p-4 md:p-6 lg:p-8">
          <div className="mb-6 md:mb-8 animate-fade-slide-up">
            <h1 className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-space-grotesk)] text-white mb-2">
              Analisis
            </h1>
            <p className="text-sm md:text-base text-[#8892b0]">
              {hasData 
                ? 'Metricas de rendimiento y analisis detallado de tu portafolio.'
                : 'Agrega posiciones para ver el analisis de tu portafolio.'
              }
            </p>
          </div>

          {/* Full page empty state if no data */}
          {!hasData && <FullPageEmptyState />}

          {hasData && (
            <>
              {/* Portfolio Evolution Chart */}
              <div className="glass-card p-6 mb-6 animate-fade-slide-up" style={{ animationDelay: '100ms' }}>
                <div className="flex items-center gap-2 mb-6">
                  <TrendingUp className="w-5 h-5 text-[#00A3FF]" />
                  <h3 className="text-lg font-semibold font-[family-name:var(--font-space-grotesk)] text-white">
                    Evolucion del Portafolio
                  </h3>
                </div>
                <div className="h-[300px]">
                  {!hasSnapshots ? (
                    <EmptyState 
                      icon={TrendingUp} 
                      title="Sin datos de evolucion" 
                      description="Guarda snapshots semanales en la seccion Portafolio para ver la evolucion de tu portafolio." 
                    />
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={evolutionData}>
                        <defs>
                          <linearGradient id="evolutionGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#00A3FF" stopOpacity={0.3} />
                            <stop offset="100%" stopColor="#00A3FF" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,163,255,0.08)" />
                        <XAxis dataKey="date" tick={{ fill: '#8892b0', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: '#8892b0', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}K`} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="value" name="Valor" stroke="#00A3FF" strokeWidth={2} fill="url(#evolutionGrad)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Two column layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Contribution by Position */}
                <div className="glass-card p-6 animate-fade-slide-up" style={{ animationDelay: '200ms' }}>
                  <div className="flex items-center gap-2 mb-6">
                    <BarChart3 className="w-5 h-5 text-[#7B61FF]" />
                    <h3 className="text-lg font-semibold font-[family-name:var(--font-space-grotesk)] text-white">
                      Contribucion por Posicion
                    </h3>
                  </div>
                  <div className="h-[300px]">
                    {contributionData.length === 0 ? (
                      <EmptyState 
                        icon={BarChart3} 
                        title="Sin datos de contribucion" 
                        description="Agrega posiciones con ganancias o perdidas para ver su contribucion al P&L total." 
                      />
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={contributionData} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,163,255,0.08)" horizontal={true} vertical={false} />
                          <XAxis type="number" tick={{ fill: '#8892b0', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v.toFixed(0)}%`} />
                          <YAxis type="category" dataKey="symbol" tick={{ fill: '#8892b0', fontSize: 11 }} axisLine={false} tickLine={false} width={60} />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar dataKey="contribution" name="Contribucion" radius={[0, 4, 4, 0]}>
                            {contributionData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.isPositive ? '#00FF88' : '#FF3366'} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

                {/* Sector Distribution Donut */}
                <div className="glass-card p-6 animate-fade-slide-up" style={{ animationDelay: '300ms' }}>
                  <div className="flex items-center gap-2 mb-6">
                    <PieChartIcon className="w-5 h-5 text-[#00FF88]" />
                    <h3 className="text-lg font-semibold font-[family-name:var(--font-space-grotesk)] text-white">
                      Distribucion por Sector
                    </h3>
                  </div>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={sectorTableData}
                          cx="50%"
                          cy="50%"
                          innerRadius={70}
                          outerRadius={100}
                          paddingAngle={2}
                          dataKey="weight"
                          nameKey="name"
                        >
                          {sectorTableData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          content={({ active, payload }) => {
                            if (!active || !payload?.length) return null
                            const data = payload[0].payload
                            return (
                              <div className="bg-[#0D0D2B]/95 backdrop-blur-xl border border-[rgba(0,163,255,0.2)] rounded-lg p-3 shadow-xl">
                                <p className="text-sm font-medium text-white mb-1">{data.name}</p>
                                <p className="text-xs text-[#8892b0]">Peso: {data.weight.toFixed(1)}%</p>
                                <p className="text-xs text-[#8892b0]">Valor: ${formatCurrency(data.totalValue)}</p>
                              </div>
                            )
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Sector Details Table */}
              <div className="glass-card p-6 animate-fade-slide-up" style={{ animationDelay: '400ms' }}>
                <div className="flex items-center gap-2 mb-6">
                  <Briefcase className="w-5 h-5 text-[#FFB800]" />
                  <h3 className="text-lg font-semibold font-[family-name:var(--font-space-grotesk)] text-white">
                    Detalle por Sector
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[rgba(0,163,255,0.15)]">
                        <th className="px-4 py-3 text-left text-xs font-medium text-[#8892b0] uppercase">Sector</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-[#8892b0] uppercase">Posiciones</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-[#8892b0] uppercase">Valor Total</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-[#8892b0] uppercase">P&L</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-[#8892b0] uppercase">Peso %</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[rgba(0,163,255,0.08)]">
                      {sectorTableData.map((sector) => (
                        <tr key={sector.name} className="hover:bg-[rgba(0,163,255,0.03)]">
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: sector.color }} />
                              <span className="text-sm font-medium text-white">{sector.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-center text-sm font-mono text-white">
                            {sector.holdings}
                          </td>
                          <td className="px-4 py-4 text-right text-sm font-mono text-white">
                            ${formatCurrency(sector.totalValue)}
                          </td>
                          <td className="px-4 py-4 text-right">
                            <span className={cn(
                              "text-sm font-mono",
                              sector.totalPnL >= 0 ? "text-[#00FF88]" : "text-[#FF3366]"
                            )}>
                              {sector.totalPnL >= 0 ? '+' : ''}${formatCurrency(sector.totalPnL)}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-right text-sm font-mono text-white">
                            {sector.weight.toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
    </ProtectedRoute>
  )
}
