"use client"

import { useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from 'recharts'
import { useBranex } from './branex-provider'
import { formatPercent } from '@/lib/utils'

const renderActiveShape = (props: {
  cx: number
  cy: number
  innerRadius: number
  outerRadius: number
  startAngle: number
  endAngle: number
  fill: string
  payload: { name: string; value: number }
}) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload } = props

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        style={{
          filter: `drop-shadow(0 0 10px ${fill}50)`,
          transition: 'all 0.3s ease'
        }}
      />
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius - 5}
        outerRadius={innerRadius - 2}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <text x={cx} y={cy - 10} textAnchor="middle" fill="#ffffff" className="text-lg font-bold font-[family-name:var(--font-space-grotesk)]">
        {payload.name}
      </text>
      <text x={cx} y={cy + 15} textAnchor="middle" fill="#ffffff" className="text-2xl font-bold font-[family-name:var(--font-jetbrains-mono)]">
        {formatPercent(payload.value)}
      </text>
    </g>
  )
}

export function AllocationChart() {
  const { metrics } = useBranex()
  const [activeIndex, setActiveIndex] = useState(0)

  const hasData = metrics.sectorAllocation.length > 0
  const data = hasData ? metrics.sectorAllocation : []

  return (
    <div className="glass-card p-6 animate-fade-slide-up" style={{ animationDelay: '300ms' }}>
      <h2 className="text-lg font-semibold font-[family-name:var(--font-space-grotesk)] text-white mb-6">
        Distribución de Activos
      </h2>

      <div className="h-[280px]">
        {!hasData ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-[rgba(123,97,255,0.1)] flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-[#7B61FF]/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
              </svg>
            </div>
            <p className="text-[#8892b0] mb-2">Sin datos de asignación</p>
            <p className="text-xs text-[#8892b0]/60">Agrega posiciones para ver la distribución</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                activeIndex={activeIndex}
                activeShape={renderActiveShape}
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                onMouseEnter={(_, index) => setActiveIndex(index)}
                animationDuration={1500}
                animationBegin={0}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    style={{
                      filter: activeIndex === index ? `drop-shadow(0 0 10px ${entry.color}50)` : 'none',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {hasData && (
        <div className="grid grid-cols-2 gap-3 mt-4">
          {data.map((item, index) => (
            <div
              key={item.name}
              className="flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all hover:bg-[rgba(0,163,255,0.05)]"
              onMouseEnter={() => setActiveIndex(index)}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-[#8892b0]">{item.name}</span>
              </div>
              <span className="text-sm font-mono text-white">{formatPercent(item.value)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
