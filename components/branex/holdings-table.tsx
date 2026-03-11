"use client"

import { useState, useMemo } from 'react'
import { Search, ArrowUpDown, Plus, TrendingUp, TrendingDown, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn, formatDollar, formatQuantity, formatPercent } from '@/lib/utils'
import { Area, AreaChart, ResponsiveContainer } from 'recharts'
import { useBranex } from './branex-provider'
import Link from 'next/link'


type SortKey = 'name' | 'sector' | 'quantity' | 'avgCost' | 'currentPrice' | 'marketValue' | 'totalPnL' | 'pnlPercent' | 'weight'

// Mobile card component for each holding
function HoldingCard({ holding, isExpanded, onToggle }: { 
  holding: ReturnType<typeof useHoldingsWithSparkline>[0]
  isExpanded: boolean
  onToggle: () => void 
}) {
  return (
    <div 
      className={cn(
        "glass-card p-4 transition-all",
        holding.totalPnL > 0 ? "bg-[rgba(0,255,136,0.02)]" : "bg-[rgba(255,51,102,0.02)]"
      )}
    >
      {/* Main Row - Always Visible */}
      <button 
        className="w-full flex items-center justify-between gap-3 min-h-[44px]"
        onClick={onToggle}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-white truncate">{holding.symbol}</span>
            <span
              className="px-1.5 py-0.5 text-[10px] font-medium rounded-full border flex-shrink-0"
              style={{
                backgroundColor: `${holding.sectorColor}15`,
                borderColor: `${holding.sectorColor}30`,
                color: holding.sectorColor
              }}
            >
              {holding.sector}
            </span>
          </div>
          <p className="text-xs text-[#8892b0] truncate text-left">{holding.name}</p>
        </div>
        
        <div className="text-right flex-shrink-0">
          <div className={cn(
            "text-sm font-mono font-medium",
            holding.pnlPercent > 0 ? "text-[#00FF88]" : "text-[#FF3366]"
          )}>
            {holding.pnlPercent > 0 ? '+' : ''}{formatPercent(holding.pnlPercent)}
          </div>
          <div className={cn(
            "text-xs font-mono",
            holding.dayChange > 0 ? "text-[#00FF88]" : "text-[#FF3366]"
          )}>
            Hoy: {holding.dayChange > 0 ? '+' : ''}{formatPercent(holding.dayChange)}
          </div>
        </div>
        
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-[#8892b0] flex-shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-[#8892b0] flex-shrink-0" />
        )}
      </button>
      
      {/* Expanded Details */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-[rgba(0,163,255,0.1)] grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-[#8892b0] text-xs">Cantidad</span>
            <p className="font-mono text-white">{formatQuantity(holding.quantity)}</p>
          </div>
          <div>
            <span className="text-[#8892b0] text-xs">Precio Actual</span>
            <p className="font-mono text-white">${formatDollar(holding.currentPrice)}</p>
          </div>
          <div>
            <span className="text-[#8892b0] text-xs">Coste Promedio</span>
            <p className="font-mono text-[#8892b0]">${formatDollar(holding.avgCost)}</p>
          </div>
          <div>
            <span className="text-[#8892b0] text-xs">Valor Mercado</span>
            <p className="font-mono text-white">${formatDollar(holding.marketValue)}</p>
          </div>
          <div>
            <span className="text-[#8892b0] text-xs">P&L Total</span>
            <p className={cn(
              "font-mono",
              holding.totalPnL > 0 ? "text-[#00FF88]" : "text-[#FF3366]"
            )}>
              {holding.totalPnL > 0 ? '+' : ''}${formatDollar(holding.totalPnL)}
            </p>
          </div>
          <div>
            <span className="text-[#8892b0] text-xs">Peso en Portafolio</span>
            <p className="font-mono text-white">{formatPercent(holding.weight)}</p>
          </div>
          <div className="col-span-2">
            <span className="text-[#8892b0] text-xs">Rendimiento 7D</span>
            <div className="h-12 mt-1">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={holding.sparklineData.map(v => ({ v }))}>
                  <defs>
                    <linearGradient id={`spark-mobile-${holding.id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={holding.dayChange > 0 ? '#00FF88' : '#FF3366'} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={holding.dayChange > 0 ? '#00FF88' : '#FF3366'} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="v"
                    stroke={holding.dayChange > 0 ? '#00FF88' : '#FF3366'}
                    strokeWidth={1.5}
                    fill={`url(#spark-mobile-${holding.id})`}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function useHoldingsWithSparkline() {
  const { holdingsWithMetrics } = useBranex()
  
  return useMemo(() => {
    return holdingsWithMetrics.map(h => {
      const seed = h.symbol.charCodeAt(0) + h.symbol.charCodeAt(h.symbol.length - 1)
      const sparklineData = Array.from({ length: 7 }, (_, i) => {
        const variance = Math.sin(seed + i * 0.5) * 0.1
        return h.currentPrice * (0.95 + variance + i * 0.01)
      })
      const dayChange = ((sparklineData[6] - sparklineData[5]) / sparklineData[5]) * 100
      
      return {
        ...h,
        sparklineData,
        dayChange: Number(dayChange.toFixed(1)),
        low52w: h.currentPrice * 0.7,
        high52w: h.currentPrice * 1.15,
      }
    })
  }, [holdingsWithMetrics])
}

export function HoldingsTable() {
  const holdingsWithSparkline = useHoldingsWithSparkline()
  const [searchTerm, setSearchTerm] = useState('')
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' } | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filteredHoldings = holdingsWithSparkline.filter(h => 
    h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.sector.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const sortedHoldings = [...filteredHoldings].sort((a, b) => {
    if (!sortConfig) return 0
    const aVal = a[sortConfig.key]
    const bVal = b[sortConfig.key]
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortConfig.direction === 'asc' 
        ? aVal.localeCompare(bVal) 
        : bVal.localeCompare(aVal)
    }
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal
    }
    return 0
  })

  const handleSort = (key: SortKey) => {
    setSortConfig(prev => ({
      key,
      direction: prev?.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const calculate52WRange = (current: number, low: number, high: number) => {
    return ((current - low) / (high - low)) * 100
  }

  return (
    <div className="glass-card p-4 md:p-6 animate-fade-slide-up" style={{ animationDelay: '400ms' }}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 md:gap-4 mb-4 md:mb-6">
        <h2 className="text-base md:text-lg font-semibold font-[family-name:var(--font-space-grotesk)] text-white">
          Posiciones Activas
        </h2>
        <div className="flex items-center gap-2 md:gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8892b0]" />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-48 md:w-64 h-10 pl-9 pr-4 bg-[rgba(255,255,255,0.03)] border border-[rgba(0,163,255,0.15)] rounded-lg text-sm text-white placeholder:text-[#8892b0] focus:outline-none focus:border-[#00A3FF]"
            />
          </div>
          <Link href="/portafolio">
            <Button className="bg-gradient-to-r from-[#00A3FF] to-[#0066FF] hover:opacity-90 text-white gap-2 h-10 min-h-[44px]">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Anadir</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {sortedHoldings.map((holding) => (
          <HoldingCard
            key={holding.id}
            holding={holding}
            isExpanded={expandedId === holding.id}
            onToggle={() => setExpandedId(expandedId === holding.id ? null : holding.id)}
          />
        ))}
        
        {sortedHoldings.length === 0 && (
          <div className="text-center py-8">
            <p className="text-[#8892b0] mb-4">No hay posiciones activas</p>
            <Link href="/portafolio">
              <Button className="bg-gradient-to-r from-[#00A3FF] to-[#0066FF] hover:opacity-90 text-white gap-2 min-h-[44px]">
                <Plus className="w-4 h-4" />
                Anadir tu primera posicion
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[rgba(0,163,255,0.15)]">
              {[
                { key: 'name', label: 'Activo', sortable: true },
                { key: 'sector', label: 'Sector', sortable: true },
                { key: 'quantity', label: 'Cant.', sortable: true },
                { key: 'avgCost', label: 'Coste Prom.', sortable: true },
                { key: 'currentPrice', label: 'Precio Actual', sortable: true },
                { key: 'marketValue', label: 'Valor Mercado', sortable: true },
                { key: 'totalPnL', label: 'P&L Total', sortable: true },
                { key: 'pnlPercent', label: 'P&L%', sortable: true },
                { key: null, label: 'Cambio Dia', sortable: false },
                { key: null, label: '7D', sortable: false },
                { key: null, label: 'Rango 52S', sortable: false },
                { key: 'weight', label: 'Peso', sortable: true },
              ].map((col, idx) => (
                <th
                  key={idx}
                  className={cn(
                    "px-3 py-3 text-left text-xs font-medium text-[#8892b0] uppercase tracking-wider whitespace-nowrap",
                    col.sortable && "cursor-pointer hover:text-[#00A3FF]"
                  )}
                  onClick={() => col.sortable && col.key && handleSort(col.key as SortKey)}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {col.sortable && <ArrowUpDown className="w-3 h-3" />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgba(0,163,255,0.08)]">
            {sortedHoldings.map((holding, idx) => (
              <tr
                key={holding.id}
                className={cn(
                  "transition-colors hover:bg-[rgba(0,163,255,0.05)]",
                  holding.totalPnL > 0 ? "bg-[rgba(0,255,136,0.02)]" : "bg-[rgba(255,51,102,0.02)]"
                )}
                style={{ animationDelay: `${500 + idx * 50}ms` }}
              >
                <td className="px-3 py-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-white">{holding.name}</span>
                    <span className="text-xs font-mono text-[#00A3FF]">{holding.symbol}</span>
                  </div>
                </td>
                <td className="px-3 py-4">
                  <span
                    className="px-2 py-1 text-xs font-medium rounded-full border"
                    style={{
                      backgroundColor: `${holding.sectorColor}15`,
                      borderColor: `${holding.sectorColor}30`,
                      color: holding.sectorColor
                    }}
                  >
                    {holding.sector}
                  </span>
                </td>
                <td className="px-3 py-4 text-sm font-mono text-white">{formatQuantity(holding.quantity)}</td>
                <td className="px-3 py-4 text-sm font-mono text-[#8892b0]">
                  ${formatDollar(holding.avgCost)}
                </td>
                <td className="px-3 py-4 text-sm font-mono text-white">
                  ${formatDollar(holding.currentPrice)}
                </td>
                <td className="px-3 py-4 text-sm font-mono text-white">
                  ${formatDollar(holding.marketValue)}
                </td>
                <td className="px-3 py-4">
                  <span className={cn(
                    "text-sm font-mono",
                    holding.totalPnL > 0 ? "text-[#00FF88]" : "text-[#FF3366]"
                  )}>
                    {holding.totalPnL > 0 ? '+' : ''}${formatDollar(holding.totalPnL)}
                  </span>
                </td>
                <td className="px-3 py-4">
                  <div className={cn(
                    "flex items-center gap-1 text-sm font-mono",
                    holding.pnlPercent > 0 ? "text-[#00FF88]" : "text-[#FF3366]"
                  )}>
                    {holding.pnlPercent > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {holding.pnlPercent > 0 ? '+' : ''}{formatPercent(holding.pnlPercent)}
                  </div>
                </td>
                <td className="px-3 py-4">
                  <span className={cn(
                    "text-sm font-mono",
                    holding.dayChange > 0 ? "text-[#00FF88]" : "text-[#FF3366]"
                  )}>
                    {holding.dayChange > 0 ? '+' : ''}{formatPercent(holding.dayChange)}
                  </span>
                </td>
                <td className="px-3 py-4 w-20">
                  <ResponsiveContainer width={60} height={30}>
                    <AreaChart data={holding.sparklineData.map(v => ({ v }))}>
                      <defs>
                        <linearGradient id={`spark-${holding.id}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={holding.dayChange > 0 ? '#00FF88' : '#FF3366'} stopOpacity={0.3} />
                          <stop offset="100%" stopColor={holding.dayChange > 0 ? '#00FF88' : '#FF3366'} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Area
                        type="monotone"
                        dataKey="v"
                        stroke={holding.dayChange > 0 ? '#00FF88' : '#FF3366'}
                        strokeWidth={1.5}
                        fill={`url(#spark-${holding.id})`}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </td>
                <td className="px-3 py-4 w-24">
                  <div className="relative h-2 bg-[rgba(255,255,255,0.1)] rounded-full overflow-hidden">
                    <div
                      className="absolute left-0 top-0 h-full bg-gradient-to-r from-[#00A3FF] to-[#00D4FF] rounded-full"
                      style={{ width: `${calculate52WRange(holding.currentPrice, holding.low52w, holding.high52w)}%` }}
                    />
                    <div
                      className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-white rounded-full shadow"
                      style={{ left: `calc(${calculate52WRange(holding.currentPrice, holding.low52w, holding.high52w)}% - 3px)` }}
                    />
                  </div>
                </td>
                <td className="px-3 py-4 text-sm font-mono text-[#8892b0]">
                  {formatPercent(holding.weight)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {sortedHoldings.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[#8892b0]">No hay posiciones activas</p>
            <Link href="/portafolio">
              <Button className="mt-4 bg-gradient-to-r from-[#00A3FF] to-[#0066FF] hover:opacity-90 text-white gap-2">
                <Plus className="w-4 h-4" />
                Anadir tu primera posicion
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
