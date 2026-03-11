"use client"

import { useState, useMemo } from 'react'
import { Search, Plus, Bell, BellOff, TrendingUp, TrendingDown, X, Eye } from 'lucide-react'
import { Area, AreaChart, ResponsiveContainer } from 'recharts'
import { Button } from '@/components/ui/button'
import { ProtectedRoute } from '@/components/branex/protected-route'
import { useBranex } from '@/components/branex/branex-provider'
import { cn, parseDecimal } from '@/lib/utils'

// Empty state component
function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="glass-card p-12 text-center animate-fade-slide-up">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#FFB800]/20 to-[#FF8C00]/20 border border-[#FFB800]/30 mb-6">
        <Eye className="w-10 h-10 text-[#FFB800]" />
      </div>
      <h2 className="text-2xl font-bold font-[family-name:var(--font-space-grotesk)] text-white mb-3">
        Tu watchlist está vacía
      </h2>
      <p className="text-[#8892b0] max-w-md mx-auto mb-8">
        Agrega acciones que quieras seguir de cerca. Configura alertas de precio y añádelas rápidamente a tu portafolio cuando sea el momento.
      </p>
      <Button
        onClick={onAdd}
        className="bg-gradient-to-r from-[#FFB800] to-[#FF8C00] hover:opacity-90 text-[#050510] gap-2 px-8 py-3 h-auto text-lg font-semibold"
      >
        <Plus className="w-5 h-5" />
        Agregar Activo
      </Button>
    </div>
  )
}

export default function WatchlistPage() {
  const { watchlist, addWatchlistItem, updateWatchlistItem, deleteWatchlistItem } = useBranex()
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [formData, setFormData] = useState({
    symbol: '',
    name: '',
    sector: 'Tecnología',
    price: 0,
    change: 0,
    volume: '',
    marketCap: '',
  })

  // Generate sparkline data for display (derived, not stored)
  const itemsWithSparkline = useMemo(() => {
    return watchlist.map(item => {
      const seed = item.symbol.charCodeAt(0) + (item.symbol.charCodeAt(1) || 0)
      const sparkline = Array.from({ length: 7 }, (_, i) => {
        const variance = Math.sin(seed + i * 0.5) * 0.05
        return item.price * (0.97 + variance + i * 0.005)
      })
      return { ...item, sparkline }
    })
  }, [watchlist])

  const hasData = watchlist.length > 0

  const toggleAlert = (id: string) => {
    const item = watchlist.find(w => w.id === id)
    if (item) {
      updateWatchlistItem(id, { alert: !item.alert })
    }
  }

  const removeItem = (id: string) => {
    deleteWatchlistItem(id)
  }

  const handleAddItem = () => {
    if (!formData.symbol || !formData.name) return

    addWatchlistItem({
      symbol: formData.symbol.toUpperCase(),
      name: formData.name,
      sector: formData.sector,
      price: formData.price || 0,
      change: formData.change || 0,
      volume: formData.volume || '—',
      marketCap: formData.marketCap || '—',
      alert: false,
    })

    setShowAddModal(false)
    setFormData({
      symbol: '',
      name: '',
      sector: 'Tecnología',
      price: 0,
      change: 0,
      volume: '',
      marketCap: '',
    })
  }

  const filteredItems = itemsWithSparkline.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <ProtectedRoute>
        <div className="p-4 md:p-6 lg:p-8">
          <div className="flex flex-col gap-4 mb-6 md:mb-8">
            <div className="animate-fade-slide-up">
              <h1 className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-space-grotesk)] text-white mb-2">
                Watchlist
              </h1>
              <p className="text-sm md:text-base text-[#8892b0]">
                {hasData
                  ? 'Seguimiento de activos de interes con alertas de precio.'
                  : 'Comienza agregando activos que quieras seguir.'
                }
              </p>
            </div>
            {hasData && (
              <div className="flex items-center gap-3 animate-fade-slide-up" style={{ animationDelay: '100ms' }}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8892b0]" />
                  <input
                    type="text"
                    placeholder="Buscar en watchlist..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64 h-10 pl-10 pr-4 bg-[rgba(255,255,255,0.03)] border border-[rgba(0,163,255,0.15)] rounded-lg text-sm text-white placeholder:text-[#8892b0] focus:outline-none focus:border-[#00A3FF]"
                  />
                </div>
                <Button
                  onClick={() => setShowAddModal(true)}
                  className="bg-gradient-to-r from-[#00A3FF] to-[#0066FF] hover:opacity-90 text-white gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Añadir Símbolo
                </Button>
              </div>
            )}
          </div>

          {/* Empty State */}
          {!hasData && <EmptyState onAdd={() => setShowAddModal(true)} />}

          {/* Watchlist Grid */}
          {hasData && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredItems.map((item, i) => (
                <div
                  key={item.id}
                  className="glass-card p-5 animate-fade-slide-up hover:border-[rgba(0,163,255,0.3)] transition-all group"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white text-lg">{item.symbol}</span>
                        <span className="px-2 py-0.5 text-xs rounded-full bg-[rgba(0,163,255,0.1)] text-[#00A3FF] border border-[rgba(0,163,255,0.2)]">
                          {item.sector}
                        </span>
                      </div>
                      <p className="text-sm text-[#8892b0] truncate max-w-[180px]">{item.name}</p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => toggleAlert(item.id)}
                        className={cn(
                          "p-1.5 rounded-lg transition-colors",
                          item.alert
                            ? "bg-[rgba(0,163,255,0.1)] text-[#00A3FF]"
                            : "text-[#8892b0] hover:bg-[rgba(255,255,255,0.05)]"
                        )}
                        title={item.alert ? 'Desactivar alerta' : 'Activar alerta'}
                      >
                        {item.alert ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-1.5 rounded-lg text-[#8892b0] hover:bg-[rgba(255,51,102,0.1)] hover:text-[#FF3366] transition-colors"
                        title="Eliminar de watchlist"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-baseline gap-3 mb-4">
                    <span className="text-2xl font-bold font-mono text-white">
                      ${item.price.toFixed(2)}
                    </span>
                    <div className={cn(
                      "flex items-center gap-1 text-sm font-mono",
                      item.change > 0 ? "text-[#00FF88]" : item.change < 0 ? "text-[#FF3366]" : "text-[#8892b0]"
                    )}>
                      {item.change > 0 ? <TrendingUp className="w-3 h-3" /> : item.change < 0 ? <TrendingDown className="w-3 h-3" /> : null}
                      {item.change > 0 ? '+' : ''}{item.change}%
                    </div>
                  </div>

                  <div className="h-12 mb-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={item.sparkline.map(v => ({ v }))}>
                        <defs>
                          <linearGradient id={`spark-${item.id}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={item.change >= 0 ? '#00FF88' : '#FF3366'} stopOpacity={0.3} />
                            <stop offset="100%" stopColor={item.change >= 0 ? '#00FF88' : '#FF3366'} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <Area
                          type="monotone"
                          dataKey="v"
                          stroke={item.change >= 0 ? '#00FF88' : '#FF3366'}
                          strokeWidth={1.5}
                          fill={`url(#spark-${item.id})`}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[rgba(0,163,255,0.1)]">
                    <div>
                      <p className="text-xs text-[#8892b0]">Volumen</p>
                      <p className="text-sm font-mono text-white">{item.volume}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#8892b0]">Cap. Mercado</p>
                      <p className="text-sm font-mono text-white">{item.marketCap}</p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Add New Card */}
              <div
                onClick={() => setShowAddModal(true)}
                className="glass-card p-5 flex flex-col items-center justify-center min-h-[280px] cursor-pointer hover:border-[rgba(0,163,255,0.3)] transition-all animate-fade-slide-up"
                style={{ animationDelay: `${filteredItems.length * 50}ms` }}
              >
                <div className="w-16 h-16 rounded-full bg-[rgba(0,163,255,0.1)] flex items-center justify-center mb-4">
                  <Plus className="w-8 h-8 text-[#00A3FF]" />
                </div>
                <p className="text-lg font-medium text-white mb-2">Añadir Símbolo</p>
                <p className="text-sm text-[#8892b0] text-center">
                  Busca cualquier acción de NYSE o NASDAQ
                </p>
              </div>
            </div>
          )}
        </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="glass-card w-full max-w-lg mx-4 p-6 animate-fade-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Añadir a Watchlist</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddModal(false)}
                className="h-8 w-8 p-0 text-[#8892b0] hover:text-white"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm text-[#8892b0] mb-2">Símbolo *</label>
                <input
                  type="text"
                  value={formData.symbol}
                  onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
                  placeholder="AAPL"
                  className="w-full h-10 px-3 bg-[rgba(255,255,255,0.03)] border border-[rgba(0,163,255,0.15)] rounded-lg text-white placeholder:text-[#8892b0] focus:outline-none focus:border-[#00A3FF]"
                />
              </div>
              <div>
                <label className="block text-sm text-[#8892b0] mb-2">Nombre *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Apple Inc"
                  className="w-full h-10 px-3 bg-[rgba(255,255,255,0.03)] border border-[rgba(0,163,255,0.15)] rounded-lg text-white placeholder:text-[#8892b0] focus:outline-none focus:border-[#00A3FF]"
                />
              </div>
              <div>
                <label className="block text-sm text-[#8892b0] mb-2">Sector</label>
                <select
                  value={formData.sector}
                  onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                  className="w-full h-10 px-3 bg-[rgba(255,255,255,0.03)] border border-[rgba(0,163,255,0.15)] rounded-lg text-white focus:outline-none focus:border-[#00A3FF]"
                >
                  {['Tecnología', 'Salud', 'Finanzas', 'Consumo', 'Energía', 'Industrial', 'Otros'].map(s => (
                    <option key={s} value={s} className="bg-[#0D0D2B]">{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-[#8892b0] mb-2">Precio Actual</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price || ''}
                  onChange={(e) => setFormData({ ...formData, price: parseDecimal(e.target.value) })}
                  placeholder="150.00"
                  className="w-full h-10 px-3 bg-[rgba(255,255,255,0.03)] border border-[rgba(0,163,255,0.15)] rounded-lg text-white placeholder:text-[#8892b0] focus:outline-none focus:border-[#00A3FF]"
                />
              </div>
              <div>
                <label className="block text-sm text-[#8892b0] mb-2">Cambio %</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.change || ''}
                  onChange={(e) => setFormData({ ...formData, change: parseDecimal(e.target.value) })}
                  placeholder="2.5"
                  className="w-full h-10 px-3 bg-[rgba(255,255,255,0.03)] border border-[rgba(0,163,255,0.15)] rounded-lg text-white placeholder:text-[#8892b0] focus:outline-none focus:border-[#00A3FF]"
                />
              </div>
              <div>
                <label className="block text-sm text-[#8892b0] mb-2">Volumen</label>
                <input
                  type="text"
                  value={formData.volume}
                  onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
                  placeholder="45.2M"
                  className="w-full h-10 px-3 bg-[rgba(255,255,255,0.03)] border border-[rgba(0,163,255,0.15)] rounded-lg text-white placeholder:text-[#8892b0] focus:outline-none focus:border-[#00A3FF]"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm text-[#8892b0] mb-2">Cap. Mercado</label>
                <input
                  type="text"
                  value={formData.marketCap}
                  onChange={(e) => setFormData({ ...formData, marketCap: e.target.value })}
                  placeholder="2.8T"
                  className="w-full h-10 px-3 bg-[rgba(255,255,255,0.03)] border border-[rgba(0,163,255,0.15)] rounded-lg text-white placeholder:text-[#8892b0] focus:outline-none focus:border-[#00A3FF]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                variant="ghost"
                onClick={() => setShowAddModal(false)}
                className="text-[#8892b0] hover:text-white"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleAddItem}
                disabled={!formData.symbol || !formData.name}
                className="bg-gradient-to-r from-[#00A3FF] to-[#0066FF] hover:opacity-90 text-white disabled:opacity-50"
              >
                Añadir a Watchlist
              </Button>
            </div>
          </div>
        </div>
      )}
    </ProtectedRoute>
  )
}
