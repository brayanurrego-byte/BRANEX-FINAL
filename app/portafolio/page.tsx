"use client"

import { useState } from 'react'
import { Plus, Pencil, Trash2, X, Check, Search, TrendingUp, TrendingDown, Briefcase, Camera } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProtectedRoute } from '@/components/branex/protected-route'
import { useBranex } from '@/components/branex/branex-provider'
import { cn, parseDecimal, formatCurrency, formatQuantity, formatPercent } from '@/lib/utils'

const SECTORS = [
  'Tecnología',
  'Salud',
  'Finanzas',
  'Consumo',
  'Energía',
  'Industrial',
  'Materiales',
  'Inmobiliario',
  'Telecomunicaciones',
  'Servicios Públicos',
  'Otros',
]


interface HoldingFormData {
  name: string
  symbol: string
  sector: string
  quantity: number
  avgCost: number
  currentPrice: number
  entryDate: string
  notes: string
}

const emptyForm: HoldingFormData = {
  name: '',
  symbol: '',
  sector: 'Tecnología',
  quantity: 0,
  avgCost: 0,
  currentPrice: 0,
  entryDate: new Date().toISOString().split('T')[0],
  notes: '',
}

// Empty state component
function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="glass-card p-12 text-center animate-fade-slide-up">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#00A3FF]/20 to-[#0066FF]/20 border border-[#00A3FF]/30 mb-6">
        <Briefcase className="w-10 h-10 text-[#00A3FF]" />
      </div>
      <h2 className="text-2xl font-bold font-[family-name:var(--font-space-grotesk)] text-white mb-3">
        Tu portafolio está vacío
      </h2>
      <p className="text-[#8892b0] max-w-md mx-auto mb-8">
        Comienza agregando tu primera posición. Registra acciones, ETFs o fondos con su precio de compra para comenzar a rastrear tu rendimiento.
      </p>
      <Button
        onClick={onAdd}
        className="bg-gradient-to-r from-[#00A3FF] to-[#0066FF] hover:opacity-90 text-white gap-2 px-8 py-3 h-auto text-lg"
      >
        <Plus className="w-5 h-5" />
        Agregar Primera Posición
      </Button>
    </div>
  )
}

export default function PortafolioPage() {
  const { holdingsWithMetrics, addHolding, updateHolding, updateHoldingPrice, deleteHolding, metrics, saveWeeklySnapshot } = useBranex()
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<HoldingFormData>(emptyForm)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [snapshotSaved, setSnapshotSaved] = useState<string | null>(null)

  const hasData = holdingsWithMetrics.length > 0

  const filteredHoldings = holdingsWithMetrics.filter(h =>
    h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.sector.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleOpenAdd = () => {
    setFormData(emptyForm)
    setEditingId(null)
    setShowAddModal(true)
  }

  const handleOpenEdit = (holding: typeof holdingsWithMetrics[0]) => {
    setFormData({
      name: holding.name,
      symbol: holding.symbol,
      sector: holding.sector,
      quantity: holding.quantity,
      avgCost: holding.avgCost,
      currentPrice: holding.currentPrice,
      entryDate: holding.entryDate,
      notes: holding.notes || '',
    })
    setEditingId(holding.id)
    setShowAddModal(true)
  }

  const handleSave = () => {
    if (!formData.name || !formData.symbol) return

    if (editingId) {
      updateHolding(editingId, {
        name: formData.name,
        symbol: formData.symbol.toUpperCase(),
        sector: formData.sector,
        quantity: formData.quantity,
        avgCost: formData.avgCost,
        currentPrice: formData.currentPrice,
        entryDate: formData.entryDate,
        notes: formData.notes,
      })
    } else {
      addHolding({
        name: formData.name,
        symbol: formData.symbol.toUpperCase(),
        sector: formData.sector,
        quantity: formData.quantity,
        avgCost: formData.avgCost,
        currentPrice: formData.currentPrice,
        entryDate: formData.entryDate,
        notes: formData.notes,
      })
    }

    setShowAddModal(false)
    setEditingId(null)
    setFormData(emptyForm)
  }

  const handleDelete = (id: string) => {
    deleteHolding(id)
    setDeleteConfirmId(null)
  }

  const handleSaveSnapshot = () => {
    const date = saveWeeklySnapshot()
    setSnapshotSaved(date)
    setTimeout(() => setSnapshotSaved(null), 3000)
  }

  return (
    <ProtectedRoute>
        <div className="p-4 md:p-6 lg:p-8">
          {/* Page Header */}
          <div className="flex flex-col gap-4 mb-6 md:mb-8">
            <div className="animate-fade-slide-up">
              <h1 className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-space-grotesk)] text-white mb-2">
                Gestion de Portafolio
              </h1>
              <p className="text-sm md:text-base text-[#8892b0]">
                {hasData 
                  ? 'Administra tus posiciones y actualiza precios manualmente.'
                  : 'Comienza agregando tu primera posicion de inversion.'
                }
              </p>
            </div>
            {hasData && (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 animate-fade-slide-up" style={{ animationDelay: '100ms' }}>
                <Button
                  onClick={handleSaveSnapshot}
                  className={cn(
                    "gap-2 transition-all min-h-[44px] text-sm",
                    snapshotSaved 
                      ? "bg-[#00FF88] text-[#050510]" 
                      : "bg-[rgba(0,255,136,0.1)] border border-[#00FF88]/30 text-[#00FF88] hover:bg-[rgba(0,255,136,0.2)]"
                  )}
                >
                  <Camera className="w-4 h-4" />
                  <span className="hidden sm:inline">{snapshotSaved ? `Guardado: ${snapshotSaved}` : 'Guardar Snapshot Semanal'}</span>
                  <span className="sm:hidden">{snapshotSaved ? 'Guardado' : 'Snapshot'}</span>
                </Button>
                <Button
                  onClick={handleOpenAdd}
                  className="bg-gradient-to-r from-[#00A3FF] to-[#0066FF] hover:opacity-90 text-white gap-2 min-h-[44px]"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Agregar Posicion</span>
                  <span className="sm:hidden">Agregar</span>
                </Button>
              </div>
            )}
          </div>

          {/* Empty State */}
          {!hasData && <EmptyState onAdd={handleOpenAdd} />}

          {/* Summary Cards - Only show if has data */}
          {hasData && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
              <div className="glass-card p-3 md:p-5 animate-fade-slide-up">
                <p className="text-xs md:text-sm text-[#8892b0] mb-1">Valor Total</p>
                <p className="text-lg md:text-2xl font-bold font-mono text-white">
                  ${formatCurrency(metrics.totalValue)}
                </p>
              </div>
              <div className="glass-card p-3 md:p-5 animate-fade-slide-up" style={{ animationDelay: '50ms' }}>
                <p className="text-xs md:text-sm text-[#8892b0] mb-1">P&L Total</p>
                <p className={cn(
                  "text-lg md:text-2xl font-bold font-mono",
                  metrics.totalPnL >= 0 ? "text-[#00FF88]" : "text-[#FF3366]"
                )}>
                  {metrics.totalPnL >= 0 ? '+' : ''}${formatCurrency(metrics.totalPnL)}
                </p>
              </div>
              <div className="glass-card p-3 md:p-5 animate-fade-slide-up" style={{ animationDelay: '100ms' }}>
                <p className="text-xs md:text-sm text-[#8892b0] mb-1">Retorno Total</p>
                <p className={cn(
                  "text-lg md:text-2xl font-bold font-mono",
                  metrics.totalReturnPercent >= 0 ? "text-[#00FF88]" : "text-[#FF3366]"
                )}>
                  {metrics.totalReturnPercent >= 0 ? '+' : ''}{metrics.totalReturnPercent.toFixed(1)}%
                </p>
              </div>
              <div className="glass-card p-3 md:p-5 animate-fade-slide-up" style={{ animationDelay: '150ms' }}>
                <p className="text-xs md:text-sm text-[#8892b0] mb-1">Posiciones</p>
                <p className="text-lg md:text-2xl font-bold font-mono text-white">
                  {metrics.activePositions}
                </p>
              </div>
            </div>
          )}

          {/* Holdings Table - Only show if has data */}
          {hasData && (
            <div className="glass-card p-4 md:p-6 animate-fade-slide-up" style={{ animationDelay: '200ms' }}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 md:mb-6">
                <h2 className="text-base md:text-lg font-semibold font-[family-name:var(--font-space-grotesk)] text-white">
                  Mis Posiciones
                </h2>
                <div className="relative flex-1 sm:flex-none w-full sm:w-auto">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8892b0]" />
                  <input
                    type="text"
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full sm:w-48 md:w-64 h-10 pl-9 pr-4 bg-[rgba(255,255,255,0.03)] border border-[rgba(0,163,255,0.15)] rounded-lg text-sm text-white placeholder:text-[#8892b0] focus:outline-none focus:border-[#00A3FF]"
                  />
                </div>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-3">
                {filteredHoldings.map((holding) => (
                  <div 
                    key={holding.id}
                    className={cn(
                      "glass-card p-4",
                      holding.totalPnL >= 0 ? "bg-[rgba(0,255,136,0.02)]" : "bg-[rgba(255,51,102,0.02)]"
                    )}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-white">{holding.symbol}</span>
                          <span
                            className="px-1.5 py-0.5 text-[10px] font-medium rounded-full border"
                            style={{
                              backgroundColor: `${holding.sectorColor}15`,
                              borderColor: `${holding.sectorColor}30`,
                              color: holding.sectorColor
                            }}
                          >
                            {holding.sector}
                          </span>
                        </div>
                        <p className="text-xs text-[#8892b0]">{holding.name}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleOpenEdit(holding)}
                          className="h-9 w-9 p-0 text-[#00A3FF] hover:bg-[rgba(0,163,255,0.1)]"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setDeleteConfirmId(holding.id)}
                          className="h-9 w-9 p-0 text-[#FF3366] hover:bg-[rgba(255,51,102,0.1)]"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-[#8892b0] text-xs">Cantidad</span>
                        <p className="font-mono text-white">{formatQuantity(holding.quantity)}</p>
                      </div>
                      <div>
                        <span className="text-[#8892b0] text-xs">Precio Actual</span>
                        <p className="font-mono text-white">${formatCurrency(holding.currentPrice)}</p>
                      </div>
                      <div>
                        <span className="text-[#8892b0] text-xs">Valor Mercado</span>
                        <p className="font-mono text-white">${formatCurrency(holding.marketValue)}</p>
                      </div>
                      <div>
                        <span className="text-[#8892b0] text-xs">P&L</span>
                        <p className={cn(
                          "font-mono flex items-center gap-1",
                          holding.totalPnL >= 0 ? "text-[#00FF88]" : "text-[#FF3366]"
                        )}>
                          {holding.pnlPercent >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {holding.pnlPercent >= 0 ? '+' : ''}{holding.pnlPercent.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[rgba(0,163,255,0.15)]">
                      <th className="px-3 py-3 text-left text-xs font-medium text-[#8892b0] uppercase">Activo</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-[#8892b0] uppercase">Sector</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-[#8892b0] uppercase">Cant.</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-[#8892b0] uppercase">Coste Prom.</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-[#8892b0] uppercase">Precio Actual</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-[#8892b0] uppercase">Valor Mercado</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-[#8892b0] uppercase">P&L Total</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-[#8892b0] uppercase">P&L%</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-[#8892b0] uppercase">Peso</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-[#8892b0] uppercase">Entrada</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-[#8892b0] uppercase">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[rgba(0,163,255,0.08)]">
                    {filteredHoldings.map((holding) => (
                      <tr
                        key={holding.id}
                        className={cn(
                          "transition-colors hover:bg-[rgba(0,163,255,0.05)]",
                          holding.totalPnL >= 0 ? "bg-[rgba(0,255,136,0.02)]" : "bg-[rgba(255,51,102,0.02)]"
                        )}
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
                        <td className="px-3 py-4 text-sm font-mono text-white">
                          {formatQuantity(holding.quantity)}
                        </td>
                        <td className="px-3 py-4 text-sm font-mono text-[#8892b0]">
                          ${formatCurrency(holding.avgCost)}
                        </td>
                        <td className="px-3 py-4 text-sm font-mono text-white">
                          ${formatCurrency(holding.currentPrice)}
                        </td>
                        <td className="px-3 py-4 text-sm font-mono text-white">
                          ${formatCurrency(holding.marketValue)}
                        </td>
                        <td className="px-3 py-4">
                          <span className={cn(
                            "text-sm font-mono",
                            holding.totalPnL >= 0 ? "text-[#00FF88]" : "text-[#FF3366]"
                          )}>
                            {holding.totalPnL >= 0 ? '+' : ''}${formatCurrency(holding.totalPnL)}
                          </span>
                        </td>
                        <td className="px-3 py-4">
                          <div className={cn(
                            "flex items-center gap-1 text-sm font-mono",
                            holding.pnlPercent >= 0 ? "text-[#00FF88]" : "text-[#FF3366]"
                          )}>
                            {holding.pnlPercent >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {holding.pnlPercent >= 0 ? '+' : ''}{holding.pnlPercent.toFixed(1)}%
                          </div>
                        </td>
                        <td className="px-3 py-4 text-sm font-mono text-[#8892b0]">
                          {holding.weight.toFixed(1)}%
                        </td>
                        <td className="px-3 py-4 text-sm text-[#8892b0]">
                          {new Date(holding.entryDate).toLocaleDateString('es-ES')}
                        </td>
                        <td className="px-3 py-4">
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleOpenEdit(holding)}
                              className="h-8 w-8 p-0 text-[#00A3FF] hover:bg-[rgba(0,163,255,0.1)]"
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            {deleteConfirmId === holding.id ? (
                              <div className="flex items-center gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDelete(holding.id)}
                                  className="h-8 w-8 p-0 text-[#FF3366] hover:bg-[rgba(255,51,102,0.1)]"
                                  title="Confirmar eliminación"
                                >
                                  <Check className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setDeleteConfirmId(null)}
                                  className="h-8 w-8 p-0 text-[#8892b0] hover:bg-[rgba(255,255,255,0.05)]"
                                  title="Cancelar"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            ) : (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setDeleteConfirmId(holding.id)}
                                className="h-8 w-8 p-0 text-[#FF3366] hover:bg-[rgba(255,51,102,0.1)]"
                                title="Eliminar posición"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredHoldings.length === 0 && searchTerm && (
                  <div className="text-center py-12">
                    <p className="text-[#8892b0]">No se encontraron posiciones que coincidan con "{searchTerm}"</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="glass-card w-full md:max-w-2xl md:mx-4 p-4 md:p-6 max-h-[90vh] overflow-y-auto rounded-t-2xl md:rounded-xl animate-fade-slide-up">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h3 className="text-lg md:text-xl font-semibold text-white">
                {editingId ? 'Editar Posicion' : 'Nueva Posicion'}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setShowAddModal(false); setEditingId(null); }}
                className="h-10 w-10 p-0 text-[#8892b0] hover:text-white min-h-[44px]"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-4 md:mb-6">
              <div>
                <label className="block text-sm text-[#8892b0] mb-2">Nombre del Activo *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Apple Inc"
                  className="w-full h-10 px-3 bg-[rgba(255,255,255,0.03)] border border-[rgba(0,163,255,0.15)] rounded-lg text-white placeholder:text-[#8892b0] focus:outline-none focus:border-[#00A3FF]"
                />
              </div>
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
                <label className="block text-sm text-[#8892b0] mb-2">Sector</label>
                <select
                  value={formData.sector}
                  onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                  className="w-full h-10 px-3 bg-[rgba(255,255,255,0.03)] border border-[rgba(0,163,255,0.15)] rounded-lg text-white focus:outline-none focus:border-[#00A3FF]"
                >
                  {SECTORS.map(sector => (
                    <option key={sector} value={sector} className="bg-[#0D0D2B]">{sector}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-[#8892b0] mb-2">Cantidad de Acciones *</label>
                <input
                  type="number"
                  step="any"
                  value={formData.quantity || ''}
                  onChange={(e) => setFormData({ ...formData, quantity: parseDecimal(e.target.value) })}
                  placeholder="0.223"
                  className="w-full h-10 px-3 bg-[rgba(255,255,255,0.03)] border border-[rgba(0,163,255,0.15)] rounded-lg text-white placeholder:text-[#8892b0] focus:outline-none focus:border-[#00A3FF]"
                />
              </div>
              <div>
                <label className="block text-sm text-[#8892b0] mb-2">Precio Promedio de Compra *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.avgCost || ''}
                  onChange={(e) => setFormData({ ...formData, avgCost: parseDecimal(e.target.value) })}
                  placeholder="150.00"
                  className="w-full h-10 px-3 bg-[rgba(255,255,255,0.03)] border border-[rgba(0,163,255,0.15)] rounded-lg text-white placeholder:text-[#8892b0] focus:outline-none focus:border-[#00A3FF]"
                />
              </div>
              <div>
                <label className="block text-sm text-[#8892b0] mb-2">Precio Actual *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.currentPrice || ''}
                  onChange={(e) => setFormData({ ...formData, currentPrice: parseDecimal(e.target.value) })}
                  placeholder="175.50"
                  className="w-full h-10 px-3 bg-[rgba(255,255,255,0.03)] border border-[rgba(0,163,255,0.15)] rounded-lg text-white placeholder:text-[#8892b0] focus:outline-none focus:border-[#00A3FF]"
                />
              </div>
              <div>
                <label className="block text-sm text-[#8892b0] mb-2">Fecha de Entrada</label>
                <input
                  type="date"
                  value={formData.entryDate}
                  onChange={(e) => setFormData({ ...formData, entryDate: e.target.value })}
                  className="w-full h-10 px-3 bg-[rgba(255,255,255,0.03)] border border-[rgba(0,163,255,0.15)] rounded-lg text-white focus:outline-none focus:border-[#00A3FF]"
                />
              </div>
              <div>
                <label className="block text-sm text-[#8892b0] mb-2">Notas (opcional)</label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Añadir nota..."
                  className="w-full h-10 px-3 bg-[rgba(255,255,255,0.03)] border border-[rgba(0,163,255,0.15)] rounded-lg text-white placeholder:text-[#8892b0] focus:outline-none focus:border-[#00A3FF]"
                />
              </div>
            </div>

            {/* Live Preview */}
            {formData.quantity > 0 && formData.avgCost > 0 && formData.currentPrice > 0 && (
              <div className="glass-card p-3 md:p-4 mb-4 md:mb-6 bg-[rgba(0,163,255,0.05)]">
                <p className="text-xs md:text-sm text-[#8892b0] mb-2">Vista previa:</p>
                <div className="grid grid-cols-3 gap-2 md:gap-4">
                  <div>
                    <p className="text-[10px] md:text-xs text-[#8892b0]">Inversion</p>
                    <p className="text-sm md:text-lg font-mono font-semibold text-white">
                      ${formatCurrency(formData.quantity * formData.avgCost)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] md:text-xs text-[#8892b0]">Valor Actual</p>
                    <p className="text-sm md:text-lg font-mono font-semibold text-white">
                      ${formatCurrency(formData.quantity * formData.currentPrice)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] md:text-xs text-[#8892b0]">P&L</p>
                    {(() => {
                      const pnl = (formData.currentPrice - formData.avgCost) * formData.quantity
                      const pnlPercent = ((formData.currentPrice - formData.avgCost) / formData.avgCost) * 100
                      return (
                        <p className={cn(
                          "text-sm md:text-lg font-mono font-semibold",
                          pnl >= 0 ? "text-[#00FF88]" : "text-[#FF3366]"
                        )}>
                          {pnlPercent >= 0 ? '+' : ''}{pnlPercent.toFixed(1)}%
                        </p>
                      )
                    })()}
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
              <Button
                variant="ghost"
                onClick={() => { setShowAddModal(false); setEditingId(null); }}
                className="text-[#8892b0] hover:text-white min-h-[44px]"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={!formData.name || !formData.symbol || !formData.quantity || !formData.avgCost || !formData.currentPrice}
                className="bg-gradient-to-r from-[#00A3FF] to-[#0066FF] hover:opacity-90 text-white disabled:opacity-50 min-h-[44px]"
              >
                {editingId ? 'Guardar Cambios' : 'Agregar Posicion'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="glass-card w-full md:max-w-md md:mx-4 p-4 md:p-6 rounded-t-2xl md:rounded-xl animate-fade-slide-up">
            <h3 className="text-lg md:text-xl font-semibold text-white mb-3 md:mb-4">Eliminar esta posicion?</h3>
            <p className="text-sm md:text-base text-[#8892b0] mb-4 md:mb-6">
              Esta accion no se puede deshacer. La posicion sera eliminada permanentemente de tu portafolio.
            </p>
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
              <Button
                variant="ghost"
                onClick={() => setDeleteConfirmId(null)}
                className="text-[#8892b0] hover:text-white min-h-[44px]"
              >
                Cancelar
              </Button>
              <Button
                onClick={() => handleDelete(deleteConfirmId)}
                className="bg-[#FF3366] hover:bg-[#CC2952] text-white min-h-[44px]"
              >
                Eliminar
              </Button>
            </div>
          </div>
        </div>
      )}
    </ProtectedRoute>
  )
}
