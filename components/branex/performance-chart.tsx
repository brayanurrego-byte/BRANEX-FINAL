"use client"

import { useState, useMemo } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { cn, formatDollar } from '@/lib/utils'
import { useBranex } from './branex-provider'

const timeframes = ['1D', '1S', '1M', '3M', '6M', '1A', 'TODO']

const timeframeToDays: Record<string, number> = {
  '1D': 1,
  '1S': 7,
  '1M': 30,
  '3M': 90,
  '6M': 180,
  '1A': 365,
  'TODO': 730,
}


const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
  if (!active || !payload || !payload.length) return null

  return (
    <div className="bg-[#0D0D2B]/95 backdrop-blur-xl border border-[rgba(0,163,255,0.2)] rounded-lg p-3 shadow-xl">
      <p className="text-xs text-[#8892b0] mb-2">{label}</p>
      {payload.map((entry, index: number) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-[#8892b0]">{entry.name}:</span>
          <span className="font-mono font-medium text-white">
            ${formatDollar(entry.value)}
          </span>
        </div>
      ))}
    </div>
  )
}

export function PerformanceChart() {
  const { metrics, snapshots } = useBranex()
  const [activeTimeframe, setActiveTimeframe] = useState('1A')

  const hasData = metrics.totalValue > 0

  // Generate chart data — uses REAL snapshots when available, otherwise simulates
  const data = useMemo(() => {
    if (!hasData) return []
    
    const days = timeframeToDays[activeTimeframe]
    const currentValue = metrics.totalValue
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)
    
    // Filter snapshots within the timeframe
    const relevantSnapshots = snapshots
      .filter(s => new Date(s.date) >= cutoffDate)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    
    // If we have enough real data points (3+), use real snapshots
    if (relevantSnapshots.length >= 3) {
      return relevantSnapshots.map(s => ({
        date: new Date(s.date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
        portfolio: Math.round(s.value),
        invested: Math.round(s.invested),
      }))
    }
    
    // Fallback: generate simulated data based on current portfolio value
    const result = []
    let portfolioValue = currentValue * 0.75
    const portfolioGrowth = Math.pow(currentValue / portfolioValue, 1 / days)
    
    for (let i = 0; i < Math.min(days, 365); i++) {
      const variance = Math.sin(i * 0.1) * 0.02
      portfolioValue *= portfolioGrowth + variance * 0.5
      
      const date = new Date()
      date.setDate(date.getDate() - (days - i - 1))
      
      const interval = days <= 7 ? 1 : days <= 30 ? 1 : days <= 90 ? 3 : days <= 180 ? 6 : 12
      
      if (i % interval === 0 || i === days - 1) {
        result.push({
          date: date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
          portfolio: Math.round(portfolioValue),
          invested: Math.round(currentValue * 0.8), // approximate
        })
      }
    }
    
    return result
  }, [activeTimeframe, metrics.totalValue, hasData, snapshots])

  return (
    <div className="glass-card p-6 animate-fade-slide-up" style={{ animationDelay: '200ms' }}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-lg font-semibold font-[family-name:var(--font-space-grotesk)] text-white">
          Rendimiento del Portafolio
        </h2>
        <div className="flex items-center gap-1 p-1 bg-[rgba(255,255,255,0.03)] rounded-lg border border-[rgba(0,163,255,0.1)]">
          {timeframes.map((tf) => (
            <button
              key={tf}
              onClick={() => setActiveTimeframe(tf)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                activeTimeframe === tf
                  ? "bg-gradient-to-r from-[#00A3FF] to-[#0066FF] text-white"
                  : "text-[#8892b0] hover:text-white hover:bg-[rgba(0,163,255,0.1)]"
              )}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[350px]">
        {!hasData ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-[rgba(0,163,255,0.1)] flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-[#00A3FF]/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
            </div>
            <p className="text-[#8892b0] mb-2">Agrega posiciones para ver tu rendimiento</p>
            <p className="text-xs text-[#8892b0]/60">Los datos del gráfico se generarán automáticamente</p>
          </div>
        ) : (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00A3FF" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#00A3FF" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="investedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7B61FF" stopOpacity={0.1} />
                <stop offset="100%" stopColor="#7B61FF" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,163,255,0.08)" vertical={false} />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#8892b0', fontSize: 11 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#8892b0', fontSize: 11 }}
              tickFormatter={(value) => {
                if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`
                if (value >= 1000) return `$${(value / 1000).toFixed(2)}K`
                return `$${formatDollar(value)}`
              }}
              dx={-10}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              height={36}
              formatter={(value) => (
                <span className="text-xs text-[#8892b0]">{value}</span>
              )}
            />
            <Area
              type="monotone"
              dataKey="portfolio"
              name="Valor del Portafolio"
              stroke="#00A3FF"
              strokeWidth={2}
              fill="url(#portfolioGradient)"
              animationDuration={2000}
              animationBegin={0}
            />
            <Area
              type="monotone"
              dataKey="invested"
              name="Capital Invertido"
              stroke="#7B61FF"
              strokeWidth={1.5}
              strokeDasharray="5 5"
              fill="transparent"
              animationDuration={2000}
              animationBegin={200}
            />
          </AreaChart>
        </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
