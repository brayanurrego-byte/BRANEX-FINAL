"use client"

import { useState, useMemo } from 'react'
import { Calendar, Search, Plus, ArrowDownCircle, ArrowUpCircle, DollarSign, SplitSquareVertical, Trash2, X, Pencil, Check, History, TrendingUp, Camera } from 'lucide-react'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Cell } from 'recharts'
import { Button } from '@/components/ui/button'
import { ProtectedRoute } from '@/components/branex/protected-route'
import { useBranex } from '@/components/branex/branex-provider'
import { cn, parseDecimal, formatNumber, formatCurrency } from '@/lib/utils'
import type { Transaction } from '@/lib/branex-types'


const typeConfig: Record<string, { color: string; bg: string; icon: typeof ArrowDownCircle; label: string }> = {
  'COMPRA': { color: '#00A3FF', bg: 'rgba(0,163,255,0.1)', icon: ArrowDownCircle, label: 'Compra' },
  'VENTA': { color: '#7B61FF', bg: 'rgba(123,97,255,0.1)', icon: ArrowUpCircle, label: 'Venta' },
  'DIVIDENDO': { color: '#00FF88', bg: 'rgba(0,255,136,0.1)', icon: DollarSign, label: 'Dividendo' },
  'SPLIT': { color: '#FFB800', bg: 'rgba(255,184,0,0.1)', icon: SplitSquareVertical, label: 'Stock Split' },
}

interface TransactionFormData {
  date: string
  type: Transaction['type']
  assetName: string
  symbol: string
  shares: number
  pricePerShare: number
  notes: string
}

const emptyForm: TransactionFormData = {
  date: new Date().toISOString().split('T')[0],
  type: 'COMPRA',
  assetName: '',
  symbol: '',
  shares: 0,
  pricePerShare: 0,
  notes: '',
}

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
            ${formatCurrency(entry.value)}
          </span>
        </div>
      ))}
    </div>
  )
}

// Empty state for transactions
function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="glass-card p-12 text-center animate-fade-slide-up">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#7B61FF]/20 to-[#5B41DF]/20 border border-[#7B61FF]/30 mb-6">
        <History className="w-10 h-10 text-[#7B61FF]" />
      </div>
      <h2 className="text-2xl font-bold font-[family-name:var(--font-space-grotesk)] text-white mb-3">
        Sin transacciones registradas
      </h2>
      <p className="text-[#8892b0] max-w-md mx-auto mb-8">
        Registra tu primera transaccion para comenzar a rastrear compras, ventas y dividendos. Las transacciones actualizan automaticamente tu portafolio.
      </p>
      <Button
        onClick={onAdd}
        className="bg-gradient-to-r from-[#7B61FF] to-[#5B41DF] hover:opacity-90 text-white gap-2 px-8 py-3 h-auto text-lg"
      >
        <Plus className="w-5 h-5" />
        Registrar Primera Transaccion
      </Button>
    </div>
  )
}

// Empty state for charts (not enough snapshots)
function ChartEmptyState() {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center p-8">
      <div className="w-16 h-16 rounded-full bg-[rgba(0,163,255,0.1)] flex items-center justify-center mb-4">
        <Camera className="w-8 h-8 text-[#00A3FF]/50" />
      </div>
      <p className="text-[#8892b0] mb-2">Aun no hay suficientes datos</p>
      <p className="text-xs text-[#8892b0]/60 max-w-xs">
        Agrega posiciones y guarda snapshots semanales en la seccion Portafolio para ver tu historial de rendimiento.
      </p>
    </div>
  )
}

export default function HistorialPage() {
  const { transactions, snapshots, addTransaction, deleteTransaction, updateTransaction, metrics } = useBranex()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState<TransactionFormData>(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'semanal' | 'mensual' | 'semestral' | 'anual'>('semanal')

  const hasData = transactions.length > 0
  const hasSnapshots = snapshots.length >= 2

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.assetName.toLowerCase().includes(searchTerm.toLowerCase()) || t.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = !filterType || t.type === filterType
    return matchesSearch && matchesFilter
  })

  // Calculate trade statistics from real data
  const tradeStats = useMemo(() => {
    const buySellTrades = transactions.filter(t => t.type === 'COMPRA' || t.type === 'VENTA')
    const totalTrades = buySellTrades.length
    const totalBuy = transactions.filter(t => t.type === 'COMPRA').reduce((sum, t) => sum + t.total, 0)
    const totalSell = transactions.filter(t => t.type === 'VENTA').reduce((sum, t) => sum + t.total, 0)
    const totalDividends = transactions.filter(t => t.type === 'DIVIDENDO').reduce((sum, t) => sum + t.total, 0)

    return {
      totalTrades,
      totalBuy,
      totalSell,
      totalDividends,
    }
  }, [transactions])

  // Weekly chart data - shows each snapshot as a data point (max last 52 weeks)
  const weeklyChartData = useMemo(() => {
    if (snapshots.length < 2) return []
    
    const sortedSnapshots = [...snapshots].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    
    return sortedSnapshots.map((s) => ({
      date: new Date(s.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
      value: s.value,
    }))
  }, [snapshots])

  // Monthly chart data - takes last snapshot of each month
  const monthlyChartData = useMemo(() => {
    if (snapshots.length < 2) return []
    
    const sortedSnapshots = [...snapshots].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    const monthlyData: Record<string, { value: number; prevValue: number }> = {}
    
    sortedSnapshots.forEach((s, index) => {
      const date = new Date(s.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const prevSnapshot = sortedSnapshots[index - 1]
      monthlyData[monthKey] = { 
        value: s.value, 
        prevValue: prevSnapshot ? prevSnapshot.value : s.value 
      }
    })
    
    return Object.entries(monthlyData).map(([key, data]) => {
      const [year, month] = key.split('-')
      const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
      const increased = data.value >= data.prevValue
      return {
        month: `${months[parseInt(month) - 1]} ${year.slice(2)}`,
        value: data.value,
        increased,
      }
    }).slice(-12)
  }, [snapshots])

  // Semestral chart data - compare start vs end of each 6-month period
  const semestralChartData = useMemo(() => {
    if (snapshots.length < 2) return []
    
    const sortedSnapshots = [...snapshots].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    const semesterData: Record<string, { start: number; end: number }> = {}
    
    sortedSnapshots.forEach((s) => {
      const date = new Date(s.date)
      const semester = date.getMonth() < 6 ? 1 : 2
      const semKey = `Sem ${semester} ${date.getFullYear()}`
      
      if (!semesterData[semKey]) {
        semesterData[semKey] = { start: s.value, end: s.value }
      } else {
        semesterData[semKey].end = s.value
      }
    })
    
    return Object.entries(semesterData).map(([key, data]) => ({
      period: key,
      start: data.start,
      end: data.end,
      change: ((data.end - data.start) / data.start) * 100,
    })).slice(-4)
  }, [snapshots])

  // Annual chart data - first vs last snapshot of each year
  const annualChartData = useMemo(() => {
    if (snapshots.length < 2) return []
    
    const sortedSnapshots = [...snapshots].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    const yearlyData: Record<string, { start: number; end: number }> = {}
    
    sortedSnapshots.forEach((s) => {
      const year = new Date(s.date).getFullYear().toString()
      
      if (!yearlyData[year]) {
        yearlyData[year] = { start: s.value, end: s.value }
      } else {
        yearlyData[year].end = s.value
      }
    })
    
    return Object.entries(yearlyData).map(([year, data]) => ({
      year,
      value: data.end,
      change: ((data.end - data.start) / data.start) * 100,
    }))
  }, [snapshots])

  const handleOpenEdit = (transaction: Transaction) => {
    setFormData({
      date: transaction.date,
      type: transaction.type,
      assetName: transaction.assetName,
      symbol: transaction.symbol,
      shares: transaction.shares,
      pricePerShare: transaction.pricePerShare,
      notes: transaction.notes || '',
    })
    setEditingId(transaction.id)
    setShowAddForm(true)
  }

  const handleSaveTransaction = () => {
    if (!formData.assetName || !formData.symbol || !formData.shares) return

    if (editingId) {
      updateTransaction(editingId, {
        date: formData.date,
        type: formData.type,
        assetName: formData.assetName,
        symbol: formData.symbol.toUpperCase(),
        shares: formData.shares,
        pricePerShare: formData.pricePerShare,
        total: formData.shares * formData.pricePerShare,
        notes: formData.notes,
      })
    } else {
      addTransaction({
        date: formData.date,
        type: formData.type,
        assetName: formData.assetName,
        symbol: formData.symbol.toUpperCase(),
        shares: formData.shares,
        pricePerShare: formData.pricePerShare,
        total: formData.shares * formData.pricePerShare,
        notes: formData.notes,
      })
    }

    setFormData(emptyForm)
    setShowAddForm(false)
    setEditingId(null)
  }

  const handleDelete = (id: string) => {
    deleteTransaction(id)
    setDeleteConfirmId(null)
  }

  return (
    <ProtectedRoute>
        <div className="p-4 md:p-6 lg:p-8">
          <div className="flex flex-col gap-4 mb-6 md:mb-8">
            <div className="animate-fade-slide-up">
              <h1 className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-space-grotesk)] text-white mb-2">
                Historial
              </h1>
              <p className="text-sm md:text-base text-[#8892b0]">
                {hasData 
                  ? 'Registro completo de transacciones y evolucion del portafolio.'
                  : 'Comienza registrando tu primera transaccion.'
                }
              </p>
            </div>
            {hasData && (
              <Button
                onClick={() => { setShowAddForm(true); setEditingId(null); setFormData(emptyForm); }}
                className="bg-gradient-to-r from-[#00A3FF] to-[#0066FF] hover:opacity-90 text-white gap-2 animate-fade-slide-up min-h-[44px] self-start"
                style={{ animationDelay: '100ms' }}
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Anadir Transaccion</span>
                <span className="sm:hidden">Anadir</span>
              </Button>
            )}
          </div>

          {/* Empty State */}
          {!hasData && !showAddForm && (
            <EmptyState onAdd={() => setShowAddForm(true)} />
          )}

          {/* Add Transaction Form */}
          {showAddForm && (
            <div className="glass-card p-6 mb-8 animate-fade-slide-up">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  {editingId ? 'Editar Transaccion' : 'Nueva Transaccion'}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setShowAddForm(false); setEditingId(null); }}
                  className="h-8 w-8 p-0 text-[#8892b0] hover:text-white"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-sm text-[#8892b0] mb-2">Fecha</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full h-10 px-3 bg-[rgba(255,255,255,0.03)] border border-[rgba(0,163,255,0.15)] rounded-lg text-white focus:outline-none focus:border-[#00A3FF]"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#8892b0] mb-2">Tipo</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as Transaction['type'] })}
                    className="w-full h-10 px-3 bg-[rgba(255,255,255,0.03)] border border-[rgba(0,163,255,0.15)] rounded-lg text-white focus:outline-none focus:border-[#00A3FF]"
                  >
                    <option value="COMPRA" className="bg-[#0D0D2B]">Compra</option>
                    <option value="VENTA" className="bg-[#0D0D2B]">Venta</option>
                    <option value="DIVIDENDO" className="bg-[#0D0D2B]">Dividendo</option>
                    <option value="SPLIT" className="bg-[#0D0D2B]">Stock Split</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-[#8892b0] mb-2">Nombre del Activo *</label>
                  <input
                    type="text"
                    value={formData.assetName}
                    onChange={(e) => setFormData({ ...formData, assetName: e.target.value })}
                    placeholder="Apple Inc"
                    className="w-full h-10 px-3 bg-[rgba(255,255,255,0.03)] border border-[rgba(0,163,255,0.15)] rounded-lg text-white placeholder:text-[#8892b0] focus:outline-none focus:border-[#00A3FF]"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#8892b0] mb-2">Simbolo *</label>
                  <input
                    type="text"
                    value={formData.symbol}
                    onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
                    placeholder="AAPL"
                    className="w-full h-10 px-3 bg-[rgba(255,255,255,0.03)] border border-[rgba(0,163,255,0.15)] rounded-lg text-white placeholder:text-[#8892b0] focus:outline-none focus:border-[#00A3FF]"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#8892b0] mb-2">Cantidad *</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.shares || ''}
                    onChange={(e) => setFormData({ ...formData, shares: parseDecimal(e.target.value) })}
                    placeholder="100"
                    className="w-full h-10 px-3 bg-[rgba(255,255,255,0.03)] border border-[rgba(0,163,255,0.15)] rounded-lg text-white placeholder:text-[#8892b0] focus:outline-none focus:border-[#00A3FF]"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#8892b0] mb-2">Precio por Accion</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.pricePerShare || ''}
                    onChange={(e) => setFormData({ ...formData, pricePerShare: parseDecimal(e.target.value) })}
                    placeholder="150.00"
                    className="w-full h-10 px-3 bg-[rgba(255,255,255,0.03)] border border-[rgba(0,163,255,0.15)] rounded-lg text-white placeholder:text-[#8892b0] focus:outline-none focus:border-[#00A3FF]"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#8892b0] mb-2">Notas (opcional)</label>
                  <input
                    type="text"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Anadir nota..."
                    className="w-full h-10 px-3 bg-[rgba(255,255,255,0.03)] border border-[rgba(0,163,255,0.15)] rounded-lg text-white placeholder:text-[#8892b0] focus:outline-none focus:border-[#00A3FF]"
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={handleSaveTransaction}
                    disabled={!formData.assetName || !formData.symbol || !formData.shares}
                    className="w-full bg-[#00FF88] hover:bg-[#00CC6A] text-[#050510] font-medium disabled:opacity-50"
                  >
                    {editingId ? 'Guardar Cambios' : 'Guardar Transaccion'}
                  </Button>
                </div>
              </div>
              {formData.shares > 0 && formData.pricePerShare > 0 && (
                <div className="text-sm text-[#8892b0]">
                  Total: <span className="font-mono text-white">${formatNumber(formData.shares * formData.pricePerShare)}</span>
                </div>
              )}
            </div>
          )}

          {/* Stats Cards - Only show if has data */}
          {hasData && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="glass-card p-5 animate-fade-slide-up">
                <p className="text-sm text-[#8892b0] mb-1">Total Transacciones</p>
                <p className="text-2xl font-bold font-mono text-white">{tradeStats.totalTrades}</p>
              </div>
              <div className="glass-card p-5 animate-fade-slide-up" style={{ animationDelay: '50ms' }}>
                <p className="text-sm text-[#8892b0] mb-1">Total Compras</p>
                <p className="text-2xl font-bold font-mono text-[#00A3FF]">
                  ${formatCurrency(tradeStats.totalBuy)}
                </p>
              </div>
              <div className="glass-card p-5 animate-fade-slide-up" style={{ animationDelay: '100ms' }}>
                <p className="text-sm text-[#8892b0] mb-1">Total Ventas</p>
                <p className="text-2xl font-bold font-mono text-[#7B61FF]">
                  ${formatCurrency(tradeStats.totalSell)}
                </p>
              </div>
              <div className="glass-card p-5 animate-fade-slide-up" style={{ animationDelay: '150ms' }}>
                <p className="text-sm text-[#8892b0] mb-1">Dividendos Recibidos</p>
                <p className="text-2xl font-bold font-mono text-[#00FF88]">
                  ${formatCurrency(tradeStats.totalDividends)}
                </p>
              </div>
            </div>
          )}

          {/* Performance Tabs - Only show if has data */}
          {hasData && (
            <div className="glass-card p-6 mb-8 animate-fade-slide-up" style={{ animationDelay: '200ms' }}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold font-[family-name:var(--font-space-grotesk)] text-white">
                  Rendimiento Historico
                </h3>
                <div className="flex gap-2">
                  {(['semanal', 'mensual', 'semestral', 'anual'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={cn(
                        "px-4 py-2 text-sm font-medium rounded-lg transition-all",
                        activeTab === tab
                          ? "bg-[#00A3FF] text-white"
                          : "text-[#8892b0] hover:bg-[rgba(0,163,255,0.1)]"
                      )}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-[300px]">
                {!hasSnapshots ? (
                  <ChartEmptyState />
                ) : activeTab === 'semanal' ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={weeklyChartData}>
                      <defs>
                        <linearGradient id="weeklyGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#00A3FF" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="#00A3FF" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,163,255,0.08)" />
                      <XAxis dataKey="date" tick={{ fill: '#8892b0', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#8892b0', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}K`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line type="monotone" dataKey="value" name="Valor" stroke="#00A3FF" strokeWidth={2} dot={{ fill: '#00A3FF', r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : activeTab === 'mensual' ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,163,255,0.08)" />
                      <XAxis dataKey="month" tick={{ fill: '#8892b0', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#8892b0', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}K`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="value" name="Valor" radius={[4, 4, 0, 0]}>
                        {monthlyChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.increased ? '#00FF88' : '#FF3366'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : activeTab === 'semestral' ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={semestralChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,163,255,0.08)" />
                      <XAxis dataKey="period" tick={{ fill: '#8892b0', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#8892b0', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}K`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="start" name="Inicio" fill="#00A3FF" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="end" name="Fin" fill="#00FF88" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={annualChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,163,255,0.08)" />
                      <XAxis dataKey="year" tick={{ fill: '#8892b0', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#8892b0', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}K`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="value" name="Valor Final" radius={[4, 4, 0, 0]}>
                        {annualChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.change >= 0 ? '#00FF88' : '#FF3366'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
              
              {hasSnapshots && (
                <div className="mt-4 pt-4 border-t border-[rgba(0,163,255,0.1)] text-center text-xs text-[#8892b0]">
                  Basado en {snapshots.length} snapshots guardados
                </div>
              )}
            </div>
          )}

          {/* Transactions Table - Only show if has data */}
          {hasData && (
            <div className="glass-card p-6 animate-fade-slide-up" style={{ animationDelay: '300ms' }}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <h2 className="text-lg font-semibold font-[family-name:var(--font-space-grotesk)] text-white">
                  Registro de Transacciones
                </h2>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8892b0]" />
                    <input
                      type="text"
                      placeholder="Buscar..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-48 h-9 pl-9 pr-4 bg-[rgba(255,255,255,0.03)] border border-[rgba(0,163,255,0.15)] rounded-lg text-sm text-white placeholder:text-[#8892b0] focus:outline-none focus:border-[#00A3FF]"
                    />
                  </div>
                  <div className="flex gap-1">
                    {['COMPRA', 'VENTA', 'DIVIDENDO'].map((type) => (
                      <button
                        key={type}
                        onClick={() => setFilterType(filterType === type ? null : type)}
                        className={cn(
                          "px-3 py-1.5 text-xs font-medium rounded-lg transition-all",
                          filterType === type
                            ? "bg-[#00A3FF] text-white"
                            : "text-[#8892b0] hover:bg-[rgba(0,163,255,0.1)]"
                        )}
                      >
                        {typeConfig[type].label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[rgba(0,163,255,0.15)]">
                      <th className="px-3 py-3 text-left text-xs font-medium text-[#8892b0] uppercase">Fecha</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-[#8892b0] uppercase">Tipo</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-[#8892b0] uppercase">Activo</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-[#8892b0] uppercase">Cantidad</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-[#8892b0] uppercase">Precio</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-[#8892b0] uppercase">Total</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-[#8892b0] uppercase">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[rgba(0,163,255,0.08)]">
                    {filteredTransactions.map((transaction) => {
                      const config = typeConfig[transaction.type]
                      const Icon = config.icon
                      return (
                        <tr key={transaction.id} className="hover:bg-[rgba(0,163,255,0.03)]">
                          <td className="px-3 py-4 text-sm text-white">
                            {new Date(transaction.date).toLocaleDateString('es-ES')}
                          </td>
                          <td className="px-3 py-4">
                            <span
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full"
                              style={{ backgroundColor: config.bg, color: config.color }}
                            >
                              <Icon className="w-3 h-3" />
                              {config.label}
                            </span>
                          </td>
                          <td className="px-3 py-4">
                            <div className="flex flex-col">
                              <span className="text-sm text-white">{transaction.assetName}</span>
                              <span className="text-xs font-mono text-[#00A3FF]">{transaction.symbol}</span>
                            </div>
                          </td>
                          <td className="px-3 py-4 text-sm font-mono text-white">
                            {formatNumber(transaction.shares)}
                          </td>
                          <td className="px-3 py-4 text-sm font-mono text-[#8892b0]">
                            ${formatNumber(transaction.pricePerShare)}
                          </td>
                          <td className="px-3 py-4 text-sm font-mono text-white">
                            ${formatNumber(transaction.total)}
                          </td>
                          <td className="px-3 py-4">
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleOpenEdit(transaction)}
                                className="h-8 w-8 p-0 text-[#00A3FF] hover:bg-[rgba(0,163,255,0.1)]"
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              {deleteConfirmId === transaction.id ? (
                                <div className="flex items-center gap-1">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDelete(transaction.id)}
                                    className="h-8 w-8 p-0 text-[#FF3366] hover:bg-[rgba(255,51,102,0.1)]"
                                  >
                                    <Check className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setDeleteConfirmId(null)}
                                    className="h-8 w-8 p-0 text-[#8892b0] hover:bg-[rgba(255,255,255,0.05)]"
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setDeleteConfirmId(transaction.id)}
                                  className="h-8 w-8 p-0 text-[#FF3366] hover:bg-[rgba(255,51,102,0.1)]"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>

                {filteredTransactions.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-[#8892b0]">No se encontraron transacciones</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
    </ProtectedRoute>
  )
}
