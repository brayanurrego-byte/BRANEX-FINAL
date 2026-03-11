"use client"

import { useMemo } from 'react'
import { AlertTriangle, TrendingUp, TrendingDown, Lightbulb, BarChart3, Target, Shield, PieChart } from 'lucide-react'
import { ProtectedRoute } from '@/components/branex/protected-route'
import { useBranex } from '@/components/branex/branex-provider'
import { cn, formatNumber, formatCurrency } from '@/lib/utils'

// Full page empty state
function FullPageEmptyState() {
  return (
    <div className="glass-card p-12 text-center animate-fade-slide-up">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#00A3FF]/20 to-[#0066FF]/20 border border-[#00A3FF]/30 mb-6">
        <Target className="w-10 h-10 text-[#00A3FF]" />
      </div>
      <h2 className="text-2xl font-bold font-[family-name:var(--font-space-grotesk)] text-white mb-3">
        Sin datos para analizar
      </h2>
      <p className="text-[#8892b0] max-w-md mx-auto mb-8">
        Agrega posiciones en tu portafolio para recibir un resumen automatico con insights calculados sobre tu rendimiento, diversificacion y alertas de concentracion.
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

interface Insight {
  id: string
  type: 'warning' | 'success' | 'info' | 'tip'
  icon: typeof AlertTriangle
  title: string
  description: string
  value?: string
}

export default function ResumenPage() {
  const { holdingsWithMetrics, metrics} = useBranex()

  const hasData = holdingsWithMetrics.length > 0

  // Calculate portfolio health score
  const healthScore = useMemo(() => {
    if (!hasData) return 0
    
    const holdingsCount = holdingsWithMetrics.length
    const sectorsCount = new Set(holdingsWithMetrics.map(h => h.sector)).size
    const returnPercent = metrics.totalReturnPercent
    
    // Position count score (30% weight)
    let positionScore = 0
    if (holdingsCount >= 13) positionScore = 100
    else if (holdingsCount >= 8) positionScore = 80
    else if (holdingsCount >= 4) positionScore = 60
    else if (holdingsCount >= 1) positionScore = 30
    
    // Sector diversification score (30% weight)
    let sectorScore = 0
    if (sectorsCount >= 4) sectorScore = 100
    else if (sectorsCount >= 2) sectorScore = 60
    else sectorScore = 20
    
    // P&L performance score (40% weight)
    let pnlScore = 0
    if (returnPercent >= 30) pnlScore = 100
    else if (returnPercent >= 10) pnlScore = 75
    else if (returnPercent >= 0) pnlScore = 50
    else pnlScore = 20
    
    const totalScore = (positionScore * 0.3) + (sectorScore * 0.3) + (pnlScore * 0.4)
    return Math.round(totalScore)
  }, [holdingsWithMetrics, metrics.totalReturnPercent, hasData])

  // Generate real insights based on portfolio data
  const insights = useMemo(() => {
    if (!hasData) return []
    
    const result: Insight[] = []
    const sectorsCount = new Set(holdingsWithMetrics.map(h => h.sector)).size
    
    // Find max position weight
    const maxPosition = holdingsWithMetrics.reduce((max, h) => h.weight > max.weight ? h : max, holdingsWithMetrics[0])
    
    // Find max sector weight
    const sectorWeights: Record<string, number> = {}
    holdingsWithMetrics.forEach(h => {
      sectorWeights[h.sector] = (sectorWeights[h.sector] || 0) + h.weight
    })
    const maxSector = Object.entries(sectorWeights).reduce((max, [sector, weight]) => 
      weight > max.weight ? { sector, weight } : max, 
      { sector: '', weight: 0 }
    )
    
    // Concentration warnings
    if (maxPosition && maxPosition.weight > 25) {
      result.push({
        id: 'concentration-position',
        type: 'warning',
        icon: AlertTriangle,
        title: 'Concentracion Alta',
        description: `${maxPosition.symbol} representa ${maxPosition.weight.toFixed(1)}% de tu portafolio. Considera diversificar para reducir el riesgo.`,
        value: `${maxPosition.weight.toFixed(1)}%`,
      })
    }
    
    if (maxSector.weight > 40) {
      result.push({
        id: 'concentration-sector',
        type: 'warning',
        icon: PieChart,
        title: 'Sector Concentrado',
        description: `El sector ${maxSector.sector} representa ${maxSector.weight.toFixed(1)}% del portafolio. Una mayor diversificacion sectorial reduciria el riesgo.`,
        value: `${maxSector.weight.toFixed(1)}%`,
      })
    }
    
    // Performance insight
    if (metrics.totalReturnPercent > 0) {
      result.push({
        id: 'performance-positive',
        type: 'success',
        icon: TrendingUp,
        title: 'Retorno Positivo',
        description: `Tu portafolio tiene un retorno de +${metrics.totalReturnPercent.toFixed(1)}%, equivalente a $${formatCurrency(metrics.totalPnL)} en ganancias.`,
        value: `+${metrics.totalReturnPercent.toFixed(1)}%`,
      })
    } else if (metrics.totalReturnPercent < 0) {
      result.push({
        id: 'performance-negative',
        type: 'info',
        icon: TrendingDown,
        title: 'Retorno Negativo',
        description: `Tu portafolio tiene un retorno de ${metrics.totalReturnPercent.toFixed(1)}%, equivalente a $${formatCurrency(metrics.totalPnL)} en perdidas.`,
        value: `${metrics.totalReturnPercent.toFixed(1)}%`,
      })
    }
    
    // Diversification tips
    if (sectorsCount === 1) {
      result.push({
        id: 'tip-sectors',
        type: 'tip',
        icon: Lightbulb,
        title: 'Diversifica en Sectores',
        description: 'Todas tus posiciones estan en un solo sector. Considera agregar posiciones en diferentes sectores para reducir el riesgo sistematico.',
      })
    }
    
    if (holdingsWithMetrics.length < 3) {
      result.push({
        id: 'tip-positions',
        type: 'tip',
        icon: Lightbulb,
        title: 'Agrega Mas Posiciones',
        description: `Solo tienes ${holdingsWithMetrics.length} posicion${holdingsWithMetrics.length > 1 ? 'es' : ''}. Agregar mas posiciones ayudaria a diversificar tu portafolio.`,
      })
    }
    
    // Good diversification
    if (holdingsWithMetrics.length >= 5 && sectorsCount >= 3 && maxPosition.weight <= 25) {
      result.push({
        id: 'good-diversification',
        type: 'success',
        icon: Shield,
        title: 'Buena Diversificacion',
        description: 'Tu portafolio tiene una buena distribucion entre multiples posiciones y sectores. Esto reduce el riesgo de concentracion.',
      })
    }
    
    return result
  }, [holdingsWithMetrics, metrics, hasData])

  const getScoreColor = (score: number) => {
    if (score >= 70) return '#00FF88'
    if (score >= 40) return '#FFB800'
    return '#FF3366'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 70) return 'Saludable'
    if (score >= 40) return 'Moderado'
    return 'Necesita Atencion'
  }

  const getInsightStyles = (type: Insight['type']) => {
    switch (type) {
      case 'warning':
        return { bg: 'rgba(255,184,0,0.1)', border: 'rgba(255,184,0,0.3)', color: '#FFB800' }
      case 'success':
        return { bg: 'rgba(0,255,136,0.1)', border: 'rgba(0,255,136,0.3)', color: '#00FF88' }
      case 'info':
        return { bg: 'rgba(255,51,102,0.1)', border: 'rgba(255,51,102,0.3)', color: '#FF3366' }
      case 'tip':
        return { bg: 'rgba(0,163,255,0.1)', border: 'rgba(0,163,255,0.3)', color: '#00A3FF' }
      default:
        return { bg: 'rgba(136,146,176,0.1)', border: 'rgba(136,146,176,0.3)', color: '#8892b0' }
    }
  }

  return (
    <ProtectedRoute>
        <div className="p-4 md:p-6 lg:p-8">
          <div className="mb-6 md:mb-8 animate-fade-slide-up">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-gradient-to-br from-[#00A3FF] to-[#0066FF] flex items-center justify-center">
                <Target className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-space-grotesk)] text-white">
                  Resumen del Portafolio
                </h1>
                <p className="text-xs md:text-sm text-[#8892b0]">Insights automaticos basados en tus datos reales</p>
              </div>
            </div>
          </div>

          {/* Full page empty state if no data */}
          {!hasData && <FullPageEmptyState />}

          {hasData && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Insights List */}
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold font-[family-name:var(--font-space-grotesk)] text-white">
                    Insights de tu Portafolio
                  </h2>
                  {insights.length === 0 ? (
                    <div className="glass-card p-6 text-center">
                      <p className="text-[#8892b0]">No hay insights disponibles en este momento.</p>
                    </div>
                  ) : (
                    insights.map((insight, i) => {
                      const Icon = insight.icon
                      const styles = getInsightStyles(insight.type)
                      return (
                        <div
                          key={insight.id}
                          className="glass-card p-5 animate-fade-slide-up"
                          style={{ 
                            animationDelay: `${i * 100}ms`,
                            borderColor: styles.border,
                          }}
                        >
                          <div className="flex items-start gap-4">
                            <div
                              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                              style={{ backgroundColor: styles.bg }}
                            >
                              <Icon className="w-6 h-6" style={{ color: styles.color }} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <h3 className="font-semibold text-white">{insight.title}</h3>
                                {insight.value && (
                                  <span 
                                    className="text-lg font-mono font-bold"
                                    style={{ color: styles.color }}
                                  >
                                    {insight.value}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-[#8892b0]">{insight.description}</p>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>

                {/* Quick Stats */}
                <div className="glass-card p-6 animate-fade-slide-up" style={{ animationDelay: '500ms' }}>
                  <div className="flex items-center gap-2 mb-4">
                    <BarChart3 className="w-5 h-5 text-[#7B61FF]" />
                    <h3 className="text-lg font-semibold font-[family-name:var(--font-space-grotesk)] text-white">
                      Metricas Rapidas
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(0,163,255,0.1)]">
                      <p className="text-xs text-[#8892b0] mb-1">Valor Total</p>
                      <p className="text-lg font-mono font-bold text-white">
                        ${formatCurrency(metrics.totalValue)}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(0,163,255,0.1)]">
                      <p className="text-xs text-[#8892b0] mb-1">Invertido</p>
                      <p className="text-lg font-mono font-bold text-white">
                        ${formatCurrency(metrics.totalInvested)}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(0,163,255,0.1)]">
                      <p className="text-xs text-[#8892b0] mb-1">Ganancia/Perdida</p>
                      <p className={cn(
                        "text-lg font-mono font-bold",
                        metrics.totalPnL >= 0 ? "text-[#00FF88]" : "text-[#FF3366]"
                      )}>
                        {metrics.totalPnL >= 0 ? '+' : ''}${formatCurrency(metrics.totalPnL)}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(0,163,255,0.1)]">
                      <p className="text-xs text-[#8892b0] mb-1">Posiciones</p>
                      <p className="text-lg font-mono font-bold text-white">
                        {metrics.activePositions}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Portfolio Health Score */}
                <div className="glass-card p-6 animate-fade-slide-up" style={{ animationDelay: '200ms' }}>
                  <h3 className="text-lg font-semibold font-[family-name:var(--font-space-grotesk)] text-white mb-6">
                    Salud del Portafolio
                  </h3>
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
                          stroke={getScoreColor(healthScore)}
                          strokeWidth="8"
                          strokeLinecap="round"
                          strokeDasharray={`${healthScore * 2.51} 251`}
                          style={{
                            filter: `drop-shadow(0 0 15px ${getScoreColor(healthScore)}50)`,
                            transition: 'all 1s ease-out'
                          }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-bold font-mono text-white">{healthScore}</span>
                        <span className="text-sm text-[#8892b0]">/ 100</span>
                      </div>
                    </div>
                    <p
                      className="text-xl font-semibold mt-4"
                      style={{ color: getScoreColor(healthScore) }}
                    >
                      {getScoreLabel(healthScore)}
                    </p>
                    <p className="text-sm text-[#8892b0] text-center mt-2">
                      Basado en diversificacion, numero de posiciones y rendimiento
                    </p>
                  </div>
                  
                  {/* Score breakdown */}
                  <div className="mt-6 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#8892b0]">Posiciones</span>
                      <span className="font-mono text-white">{holdingsWithMetrics.length}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#8892b0]">Sectores</span>
                      <span className="font-mono text-white">{new Set(holdingsWithMetrics.map(h => h.sector)).size}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#8892b0]">Retorno</span>
                      <span className={cn(
                        "font-mono",
                        metrics.totalReturnPercent >= 0 ? "text-[#00FF88]" : "text-[#FF3366]"
                      )}>
                        {metrics.totalReturnPercent >= 0 ? '+' : ''}{metrics.totalReturnPercent.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Score scale */}
                <div className="glass-card p-6 animate-fade-slide-up" style={{ animationDelay: '300ms' }}>
                  <h3 className="text-sm font-medium text-[#8892b0] mb-4">Escala de Salud</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-[#00FF88]" />
                      <span className="text-sm text-white">70-100: Saludable</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-[#FFB800]" />
                      <span className="text-sm text-white">40-69: Moderado</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-[#FF3366]" />
                      <span className="text-sm text-white">0-39: Necesita Atencion</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
    </ProtectedRoute>
  )
}
