"use client"

import { useState, useMemo } from 'react'
import { Cpu, Heart, Building2, ShoppingBag, Zap, Factory, Boxes, Home, Lightbulb, Radio, ChevronRight, Briefcase } from 'lucide-react'
import { ProtectedRoute } from '@/components/branex/protected-route'
import { useBranex } from '@/components/branex/branex-provider'
import { cn, formatNumber, formatCurrency } from '@/lib/utils'

// Sector icon mapping
const sectorIcons: Record<string, typeof Cpu> = {
  'Tecnologia': Cpu,
  'Salud': Heart,
  'Finanzas': Building2,
  'Consumo': ShoppingBag,
  'Energia': Zap,
  'Industrial': Factory,
  'Materiales': Boxes,
  'Inmobiliario': Home,
  'Telecomunicaciones': Radio,
  'Servicios Publicos': Lightbulb,
  'Otros': Briefcase,
}

// Full page empty state
function FullPageEmptyState() {
  return (
    <div className="glass-card p-12 text-center animate-fade-slide-up">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#7B61FF]/20 to-[#5B41DF]/20 border border-[#7B61FF]/30 mb-6">
        <Factory className="w-10 h-10 text-[#7B61FF]" />
      </div>
      <h2 className="text-2xl font-bold font-[family-name:var(--font-space-grotesk)] text-white mb-3">
        Agrega posiciones con sus sectores para ver este analisis
      </h2>
      <p className="text-[#8892b0] max-w-md mx-auto mb-8">
        Cuando agregues posiciones a tu portafolio y asignes un sector a cada una, podras ver el desglose detallado de tu exposicion sectorial.
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

export default function SectoresPage() {
  const { holdingsWithMetrics, metrics } = useBranex()
  const [selectedSector, setSelectedSector] = useState<string | null>(null)

  const hasData = holdingsWithMetrics.length > 0

  // Calculate sector data from real holdings
  const sectorsData = useMemo(() => {
    if (!hasData) return []
    
    const sectorMap: Record<string, {
      name: string
      color: string
      exposure: number
      holdings: number
      totalValue: number
      totalPnL: number
      pnlContribution: number
      stocks: string[]
    }> = {}
    
    holdingsWithMetrics.forEach(h => {
      if (!sectorMap[h.sector]) {
        sectorMap[h.sector] = {
          name: h.sector,
          color: h.sectorColor,
          exposure: 0,
          holdings: 0,
          totalValue: 0,
          totalPnL: 0,
          pnlContribution: 0,
          stocks: [],
        }
      }
      sectorMap[h.sector].exposure += h.weight
      sectorMap[h.sector].holdings += 1
      sectorMap[h.sector].totalValue += h.marketValue
      sectorMap[h.sector].totalPnL += h.totalPnL
      sectorMap[h.sector].stocks.push(h.symbol)
    })
    
    // Calculate P&L contribution
    const totalAbsPnL = Math.abs(metrics.totalPnL)
    Object.values(sectorMap).forEach(sector => {
      sector.pnlContribution = totalAbsPnL > 0 ? (sector.totalPnL / totalAbsPnL) * 100 : 0
    })
    
    return Object.values(sectorMap).sort((a, b) => b.exposure - a.exposure)
  }, [holdingsWithMetrics, metrics.totalPnL, hasData])

  const activeSector = sectorsData.find(s => s.name === selectedSector)

  return (
    <ProtectedRoute>
        <div className="p-4 md:p-6 lg:p-8">
          <div className="mb-6 md:mb-8 animate-fade-slide-up">
            <h1 className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-space-grotesk)] text-white mb-2">
              Sectores
            </h1>
            <p className="text-sm md:text-base text-[#8892b0]">
              {hasData 
                ? 'Analisis detallado de tu exposicion por sector basado en tus posiciones reales.'
                : 'Agrega posiciones con sus sectores para ver este analisis.'
              }
            </p>
          </div>

          {/* Full page empty state if no data */}
          {!hasData && <FullPageEmptyState />}

          {hasData && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Sector Cards */}
              <div className="lg:col-span-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {sectorsData.map((sector, i) => {
                    const Icon = sectorIcons[sector.name] || Briefcase
                    const isSelected = selectedSector === sector.name
                    
                    return (
                      <div
                        key={sector.name}
                        onClick={() => setSelectedSector(isSelected ? null : sector.name)}
                        className={cn(
                          "glass-card p-5 cursor-pointer transition-all animate-fade-slide-up",
                          isSelected && "border-[rgba(0,163,255,0.4)] blue-glow"
                        )}
                        style={{ animationDelay: `${i * 50}ms` }}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-lg flex items-center justify-center"
                              style={{ backgroundColor: `${sector.color}20` }}
                            >
                              <Icon className="w-5 h-5" style={{ color: sector.color }} />
                            </div>
                            <div>
                              <h3 className="font-medium text-white">{sector.name}</h3>
                              <span className="text-xs text-[#8892b0]">{sector.holdings} posicion{sector.holdings !== 1 ? 'es' : ''}</span>
                            </div>
                          </div>
                          <ChevronRight className={cn(
                            "w-5 h-5 text-[#8892b0] transition-transform",
                            isSelected && "rotate-90"
                          )} />
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-xs text-[#8892b0] mb-1">Exposicion</p>
                            <p className="text-lg font-mono font-bold text-white">{sector.exposure.toFixed(1)}%</p>
                          </div>
                          <div>
                            <p className="text-xs text-[#8892b0] mb-1">Valor Total</p>
                            <p className="text-lg font-mono font-bold text-white">
                              ${formatCurrency(sector.totalValue)}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-[#8892b0] mb-1">P&L</p>
                            <p className={cn(
                              "text-sm font-mono font-medium",
                              sector.totalPnL >= 0 ? "text-[#00FF88]" : "text-[#FF3366]"
                            )}>
                              {sector.totalPnL >= 0 ? '+' : ''}${formatCurrency(sector.totalPnL)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-[#8892b0] mb-1">Contribucion P&L</p>
                            <p className={cn(
                              "text-sm font-mono font-medium",
                              sector.pnlContribution >= 0 ? "text-[#00FF88]" : "text-[#FF3366]"
                            )}>
                              {sector.pnlContribution >= 0 ? '+' : ''}{sector.pnlContribution.toFixed(1)}%
                            </p>
                          </div>
                        </div>

                        {/* Progress bar showing exposure */}
                        <div className="mt-4">
                          <div className="h-1.5 w-full bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden">
                            <div 
                              className="h-full rounded-full transition-all duration-500"
                              style={{ 
                                width: `${Math.min(sector.exposure, 100)}%`,
                                backgroundColor: sector.color 
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Sector Detail Panel */}
              <div className="lg:col-span-1">
                <div className="glass-card p-6 sticky top-24 animate-fade-slide-up" style={{ animationDelay: '200ms' }}>
                  {activeSector ? (
                    <>
                      <div className="flex items-center gap-3 mb-6">
                        {(() => {
                          const Icon = sectorIcons[activeSector.name] || Briefcase
                          return (
                            <div
                              className="w-12 h-12 rounded-lg flex items-center justify-center"
                              style={{ backgroundColor: `${activeSector.color}20` }}
                            >
                              <Icon className="w-6 h-6" style={{ color: activeSector.color }} />
                            </div>
                          )
                        })()}
                        <div>
                          <h2 className="text-xl font-bold font-[family-name:var(--font-space-grotesk)] text-white">
                            {activeSector.name}
                          </h2>
                          <span className="text-sm text-[#8892b0]">{activeSector.holdings} posicion{activeSector.holdings !== 1 ? 'es' : ''}</span>
                        </div>
                      </div>

                      <div className="space-y-4 mb-6">
                        <div className="flex justify-between items-center p-3 rounded-lg bg-[rgba(255,255,255,0.02)]">
                          <span className="text-sm text-[#8892b0]">Exposicion Total</span>
                          <span className="font-mono font-bold text-white">{activeSector.exposure.toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-lg bg-[rgba(255,255,255,0.02)]">
                          <span className="text-sm text-[#8892b0]">Valor de Mercado</span>
                          <span className="font-mono font-bold text-white">${formatCurrency(activeSector.totalValue)}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-lg bg-[rgba(255,255,255,0.02)]">
                          <span className="text-sm text-[#8892b0]">P&L Total</span>
                          <span className={cn(
                            "font-mono font-bold",
                            activeSector.totalPnL >= 0 ? "text-[#00FF88]" : "text-[#FF3366]"
                          )}>
                            {activeSector.totalPnL >= 0 ? '+' : ''}${formatCurrency(activeSector.totalPnL)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-lg bg-[rgba(255,255,255,0.02)]">
                          <span className="text-sm text-[#8892b0]">Contribucion P&L</span>
                          <span className={cn(
                            "font-mono font-bold",
                            activeSector.pnlContribution >= 0 ? "text-[#00FF88]" : "text-[#FF3366]"
                          )}>
                            {activeSector.pnlContribution >= 0 ? '+' : ''}{activeSector.pnlContribution.toFixed(1)}%
                          </span>
                        </div>
                      </div>

                      {activeSector.stocks.length > 0 && (
                        <>
                          <h3 className="text-sm font-medium text-[#8892b0] mb-3">Posiciones en este Sector</h3>
                          <div className="space-y-2">
                            {activeSector.stocks.map(symbol => {
                              const holding = holdingsWithMetrics.find(h => h.symbol === symbol)
                              return (
                                <div
                                  key={symbol}
                                  className="flex items-center justify-between p-3 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(0,163,255,0.1)]"
                                >
                                  <div>
                                    <span className="font-mono text-sm font-medium text-white">{symbol}</span>
                                    {holding && (
                                      <p className="text-xs text-[#8892b0]">{holding.weight.toFixed(1)}% del portafolio</p>
                                    )}
                                  </div>
                                  {holding && (
                                    <span className={cn(
                                      "text-xs font-mono",
                                      holding.pnlPercent >= 0 ? "text-[#00FF88]" : "text-[#FF3366]"
                                    )}>
                                      {holding.pnlPercent >= 0 ? '+' : ''}{holding.pnlPercent.toFixed(1)}%
                                    </span>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 rounded-full bg-[rgba(0,163,255,0.1)] flex items-center justify-center mx-auto mb-4">
                        <Factory className="w-8 h-8 text-[#00A3FF]" />
                      </div>
                      <h3 className="text-lg font-medium text-white mb-2">Selecciona un Sector</h3>
                      <p className="text-sm text-[#8892b0]">
                        Haz clic en cualquier tarjeta de sector para ver el analisis detallado.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
    </ProtectedRoute>
  )
}
