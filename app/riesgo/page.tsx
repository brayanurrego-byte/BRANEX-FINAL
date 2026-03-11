"use client"

import { useMemo } from 'react'
import { AlertTriangle, Shield, TrendingUp, Activity, BarChart3, Briefcase } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
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
          <span className="font-mono font-medium text-white">{entry.value.toFixed(1)}%</span>
        </div>
      ))}
    </div>
  )
}

// Full page empty state
function FullPageEmptyState() {
  return (
    <div className="glass-card p-12 text-center animate-fade-slide-up">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#FF3366]/20 to-[#FF6B35]/20 border border-[#FF3366]/30 mb-6">
        <Shield className="w-10 h-10 text-[#FF3366]" />
      </div>
      <h2 className="text-2xl font-bold font-[family-name:var(--font-space-grotesk)] text-white mb-3">
        Agrega posiciones para ver tu analisis de riesgo
      </h2>
      <p className="text-[#8892b0] max-w-md mx-auto mb-8">
        El analisis de riesgo se calcula automaticamente basado en la concentracion de posiciones, sectores y diversificacion de tu portafolio.
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

export default function RiesgoPage() {
  const { holdingsWithMetrics, metrics } = useBranex()
  
  const hasData = holdingsWithMetrics.length > 0

  // Position concentration data
  const positionConcentration = useMemo(() => {
    if (!hasData) return []
    
    return holdingsWithMetrics
      .map(h => ({
        symbol: h.symbol,
        weight: h.weight,
        isRisky: h.weight > 20,
      }))
      .sort((a, b) => b.weight - a.weight)
  }, [holdingsWithMetrics, hasData])

  // Sector concentration data
  const sectorConcentration = useMemo(() => {
    if (!hasData) return []
    
    const sectorMap: Record<string, { weight: number; color: string }> = {}
    
    holdingsWithMetrics.forEach(h => {
      if (!sectorMap[h.sector]) {
        sectorMap[h.sector] = { weight: 0, color: h.sectorColor }
      }
      sectorMap[h.sector].weight += h.weight
    })
    
    return Object.entries(sectorMap)
      .map(([name, data]) => ({
        sector: name,
        weight: data.weight,
        color: data.color,
        isRisky: data.weight > 40,
      }))
      .sort((a, b) => b.weight - a.weight)
  }, [holdingsWithMetrics, hasData])

  // Diversification score (0-100)
  const diversificationScore = useMemo(() => {
    if (!hasData) return 0
    
    const holdingsCount = holdingsWithMetrics.length
    const sectorsCount = new Set(holdingsWithMetrics.map(h => h.sector)).size
    const maxPositionWeight = Math.max(...holdingsWithMetrics.map(h => h.weight))
    const maxSectorWeight = Math.max(...sectorConcentration.map(s => s.weight))
    
    // Base score of 50
    let score = 50
    
    // Add points for holdings count (max 30 points)
    score += Math.min(holdingsCount * 3, 30)
    
    // Deduct for concentration
    score -= maxPositionWeight * 0.3
    score -= maxSectorWeight * 0.2
    
    // Add points for sector diversity
    score += Math.min(sectorsCount * 5, 20)
    
    return Math.max(0, Math.min(100, Math.round(score)))
  }, [holdingsWithMetrics, sectorConcentration, hasData])

  // Risk summary data
  const riskSummary = useMemo(() => {
    if (!hasData) return []
    
    const maxPosition = holdingsWithMetrics.reduce((max, h) => h.weight > max.weight ? h : max, holdingsWithMetrics[0])
    const maxSector = sectorConcentration.length > 0 ? sectorConcentration[0] : null
    const sectorsCount = new Set(holdingsWithMetrics.map(h => h.sector)).size
    
    return [
      { metric: 'Posiciones activas', value: holdingsWithMetrics.length.toString() },
      { metric: 'Sectores', value: sectorsCount.toString() },
      { metric: 'Mayor posicion', value: `${maxPosition?.symbol || '-'} (${maxPosition?.weight.toFixed(1) || 0}%)` },
      { metric: 'Mayor sector', value: `${maxSector?.sector || '-'} (${maxSector?.weight.toFixed(1) || 0}%)` },
      { metric: 'Capital invertido', value: `$${formatCurrency(metrics.totalInvested)}` },
    ]
  }, [holdingsWithMetrics, sectorConcentration, metrics.totalInvested, hasData])

  const getScoreColor = (score: number) => {
    if (score >= 70) return '#00FF88'
    if (score >= 40) return '#FFB800'
    return '#FF3366'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 70) return 'Diversificado'
    if (score >= 40) return 'Moderado'
    return 'Concentrado'
  }

  return (
    <ProtectedRoute>
        <div className="p-4 md:p-6 lg:p-8">
          <div className="mb-6 md:mb-8 animate-fade-slide-up">
            <h1 className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-space-grotesk)] text-white mb-2">
              Gestion de Riesgo
            </h1>
            <p className="text-sm md:text-base text-[#8892b0]">
              {hasData 
                ? 'Analisis de concentracion y diversificacion de tu portafolio.'
                : 'Agrega posiciones para ver tu analisis de riesgo.'
              }
            </p>
          </div>

          {/* Full page empty state if no data */}
          {!hasData && <FullPageEmptyState />}

          {hasData && (
            <>
              {/* Score + Summary Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Diversification Score */}
                <div className="glass-card p-6 animate-fade-slide-up" style={{ animationDelay: '100ms' }}>
                  <div className="flex items-center gap-2 mb-6">
                    <Shield className="w-5 h-5 text-[#00A3FF]" />
                    <h3 className="text-lg font-semibold font-[family-name:var(--font-space-grotesk)] text-white">
                      Diversificacion
                    </h3>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="relative w-40 h-40">
                      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke="rgba(255,255,255,0.05)"
                          strokeWidth="8"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke={getScoreColor(diversificationScore)}
                          strokeWidth="8"
                          strokeLinecap="round"
                          strokeDasharray={`${diversificationScore * 2.51} 251`}
                          style={{
                            filter: `drop-shadow(0 0 15px ${getScoreColor(diversificationScore)}50)`,
                            transition: 'all 1s ease-out'
                          }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-bold font-mono text-white">{diversificationScore}</span>
                        <span className="text-sm text-[#8892b0]">/ 100</span>
                      </div>
                    </div>
                    <p className="text-xl font-semibold mt-4" style={{ color: getScoreColor(diversificationScore) }}>
                      {getScoreLabel(diversificationScore)}
                    </p>
                    <p className="text-sm text-[#8892b0] text-center mt-2">
                      Basado en numero de posiciones, concentracion y sectores
                    </p>
                    {/* Score scale */}
                    <div className="w-full mt-6">
                      <div className="h-2 rounded-full bg-gradient-to-r from-[#FF3366] via-[#FFB800] to-[#00FF88]" />
                      <div className="flex justify-between mt-2 text-xs text-[#8892b0]">
                        <span>0</span>
                        <span>40</span>
                        <span>70</span>
                        <span>100</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Risk Summary Table */}
                <div className="lg:col-span-2 glass-card p-6 animate-fade-slide-up" style={{ animationDelay: '200ms' }}>
                  <div className="flex items-center gap-2 mb-6">
                    <Briefcase className="w-5 h-5 text-[#7B61FF]" />
                    <h3 className="text-lg font-semibold font-[family-name:var(--font-space-grotesk)] text-white">
                      Resumen de Riesgo
                    </h3>
                  </div>
                  <div className="space-y-4">
                    {riskSummary.map((item) => (
                      <div
                        key={item.metric}
                        className="flex items-center justify-between p-4 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(0,163,255,0.1)]"
                      >
                        <span className="text-sm text-[#8892b0]">{item.metric}</span>
                        <span className="font-mono font-medium text-white">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Concentration Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Position Concentration */}
                <div className="glass-card p-6 animate-fade-slide-up" style={{ animationDelay: '300ms' }}>
                  <div className="flex items-center gap-2 mb-6">
                    <BarChart3 className="w-5 h-5 text-[#00FF88]" />
                    <h3 className="text-lg font-semibold font-[family-name:var(--font-space-grotesk)] text-white">
                      Concentracion por Posicion
                    </h3>
                  </div>
                  <p className="text-xs text-[#8892b0] mb-4">
                    Las barras rojas indican posiciones que representan {'>'} 20% del portafolio (riesgo de concentracion)
                  </p>
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={positionConcentration} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,163,255,0.08)" horizontal={true} vertical={false} />
                        <XAxis type="number" tick={{ fill: '#8892b0', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v.toFixed(0)}%`} domain={[0, 'auto']} />
                        <YAxis type="category" dataKey="symbol" tick={{ fill: '#8892b0', fontSize: 11 }} axisLine={false} tickLine={false} width={60} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="weight" name="Peso" radius={[0, 4, 4, 0]}>
                          {positionConcentration.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.isRisky ? '#FF3366' : '#00FF88'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Sector Concentration */}
                <div className="glass-card p-6 animate-fade-slide-up" style={{ animationDelay: '400ms' }}>
                  <div className="flex items-center gap-2 mb-6">
                    <Activity className="w-5 h-5 text-[#FFB800]" />
                    <h3 className="text-lg font-semibold font-[family-name:var(--font-space-grotesk)] text-white">
                      Concentracion por Sector
                    </h3>
                  </div>
                  <p className="text-xs text-[#8892b0] mb-4">
                    Las barras rojas indican sectores que representan {'>'} 40% del portafolio
                  </p>
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={sectorConcentration} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,163,255,0.08)" horizontal={true} vertical={false} />
                        <XAxis type="number" tick={{ fill: '#8892b0', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v.toFixed(0)}%`} domain={[0, 'auto']} />
                        <YAxis type="category" dataKey="sector" tick={{ fill: '#8892b0', fontSize: 11 }} axisLine={false} tickLine={false} width={100} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="weight" name="Peso" radius={[0, 4, 4, 0]}>
                          {sectorConcentration.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.isRisky ? '#FF3366' : entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
    </ProtectedRoute>
  )
}
