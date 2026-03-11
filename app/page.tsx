"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Briefcase, Calendar, TrendingUp, X, ArrowRight } from 'lucide-react'
import { ParticleBackground } from '@/components/branex/particle-background'
import { useBranex } from '@/components/branex/branex-provider'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num)
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function PortfolioSelectionPage() {
  const router = useRouter()
  const { portfolios, createPortfolio, selectPortfolio, isLoaded } = useBranex()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newPortfolioName, setNewPortfolioName] = useState('')

  const handleCreatePortfolio = () => {
    if (!newPortfolioName.trim()) return
    createPortfolio(newPortfolioName.trim())
    setNewPortfolioName('')
    setShowCreateModal(false)
    router.push('/dashboard')
  }

  const handleSelectPortfolio = (id: string) => {
    selectPortfolio(id)
    router.push('/dashboard')
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#050510] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#00A3FF] to-[#0066FF] flex items-center justify-center animate-pulse">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <p className="text-[#8892b0]">Cargando...</p>
        </div>
      </div>
    )
  }

  const hasPortfolios = portfolios.length > 0

  return (
    <div className="min-h-screen bg-[#050510] relative flex flex-col items-center justify-center p-4 md:p-6">
      <ParticleBackground />
      
      {/* Logo */}
      <div className="relative z-10 mb-8 md:mb-12 animate-fade-slide-up">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-[#00A3FF] to-[#0066FF] flex items-center justify-center shadow-lg shadow-[#00A3FF]/20">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white md:w-6 md:h-6">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="font-[family-name:var(--font-space-grotesk)] font-bold text-2xl md:text-3xl tracking-tight text-white">
            BRANEX
          </span>
        </div>
      </div>

      {/* Title */}
      <div className="relative z-10 text-center mb-8 md:mb-10 animate-fade-slide-up px-4" style={{ animationDelay: '100ms' }}>
        <h1 className="text-2xl md:text-4xl font-bold font-[family-name:var(--font-space-grotesk)] text-white mb-2 md:mb-3">
          Tus Portafolios
        </h1>
        <p className="text-sm md:text-base text-[#8892b0] max-w-md">
          {hasPortfolios 
            ? 'Selecciona un portafolio para continuar o crea uno nuevo.'
            : 'Comienza creando tu primer portafolio de inversiones.'
          }
        </p>
      </div>

      {/* Portfolio Grid */}
      {hasPortfolios && (
        <div className="relative z-10 w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8 px-2 animate-fade-slide-up" style={{ animationDelay: '200ms' }}>
          {portfolios.map((portfolio, index) => {
            const totalValue = portfolio.holdings.reduce(
              (sum, h) => sum + h.currentPrice * h.quantity, 0
            )
            return (
              <button
                key={portfolio.id}
                onClick={() => handleSelectPortfolio(portfolio.id)}
                className="group relative text-left"
                style={{ animationDelay: `${200 + index * 50}ms` }}
              >
                <div className="absolute -inset-px bg-gradient-to-r from-[#00A3FF] to-[#0066FF] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity blur" />
                <div className="relative glass-card-interactive p-4 md:p-6 h-full hover:border-[#00A3FF]/50 transition-all active:scale-[0.98]">
                  <div className="flex items-start justify-between mb-3 md:mb-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-gradient-to-br from-[#7B61FF]/20 to-[#00A3FF]/20 border border-[#7B61FF]/30 flex items-center justify-center">
                      <Briefcase className="w-5 h-5 md:w-6 md:h-6 text-[#7B61FF]" />
                    </div>
                    <ArrowRight className="w-5 h-5 text-[#8892b0] group-hover:text-[#00A3FF] group-hover:translate-x-1 transition-all" />
                  </div>
                  
                  <h3 className="text-base md:text-lg font-semibold text-white mb-1 group-hover:text-[#00A3FF] transition-colors truncate">
                    {portfolio.name}
                  </h3>
                  
                  <div className="flex items-center gap-2 text-xs md:text-sm text-[#8892b0] mb-3 md:mb-4">
                    <Calendar className="w-3 h-3 md:w-4 md:h-4" />
                    <span>{formatDate(portfolio.createdAt)}</span>
                  </div>
                  
                  <div className="pt-3 md:pt-4 border-t border-[rgba(0,163,255,0.1)] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] md:text-xs text-[#8892b0]">Posiciones</span>
                      <span className="text-xs md:text-sm font-mono text-white">{portfolio.holdings.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] md:text-xs text-[#8892b0]">Valor Total</span>
                      <span className="text-xs md:text-sm font-mono text-[#00FF88]">
                        ${formatNumber(totalValue)}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* Create Button */}
      <div className="relative z-10 animate-fade-slide-up w-full px-4 sm:w-auto" style={{ animationDelay: hasPortfolios ? '300ms' : '200ms' }}>
        <Button
          onClick={() => setShowCreateModal(true)}
          className={cn(
            "gap-2 transition-all w-full sm:w-auto min-h-[44px]",
            hasPortfolios
              ? "bg-[rgba(0,163,255,0.1)] border border-[#00A3FF]/30 text-[#00A3FF] hover:bg-[rgba(0,163,255,0.2)] px-6 py-3 h-auto"
              : "bg-gradient-to-r from-[#00A3FF] to-[#0066FF] hover:opacity-90 text-white px-6 md:px-8 py-3 md:py-4 h-auto text-base md:text-lg"
          )}
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Crear Nuevo Portafolio</span>
          <span className="sm:hidden">Crear Portafolio</span>
        </Button>
      </div>

      {/* Empty state illustration */}
      {!hasPortfolios && (
        <div className="relative z-10 mt-12 md:mt-16 opacity-30 animate-fade-slide-up" style={{ animationDelay: '400ms' }}>
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl border border-dashed border-[#8892b0]/50 flex items-center justify-center">
              <Briefcase className="w-6 h-6 md:w-8 md:h-8 text-[#8892b0]/50" />
            </div>
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl border border-dashed border-[#8892b0]/50 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-[#8892b0]/50" />
            </div>
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl border border-dashed border-[#8892b0]/50 flex items-center justify-center">
              <Calendar className="w-6 h-6 md:w-8 md:h-8 text-[#8892b0]/50" />
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center md:p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowCreateModal(false)}
          />
          <div className="relative glass-card p-6 md:p-8 w-full md:max-w-md rounded-t-2xl md:rounded-xl animate-fade-slide-up max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 p-2 text-[#8892b0] hover:text-white hover:bg-[rgba(255,255,255,0.05)] rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br from-[#00A3FF]/20 to-[#0066FF]/20 border border-[#00A3FF]/30 flex items-center justify-center mb-4 md:mb-6">
              <Briefcase className="w-6 h-6 md:w-7 md:h-7 text-[#00A3FF]" />
            </div>
            
            <h2 className="text-xl md:text-2xl font-bold font-[family-name:var(--font-space-grotesk)] text-white mb-2">
              Nuevo Portafolio
            </h2>
            <p className="text-sm md:text-base text-[#8892b0] mb-4 md:mb-6">
              Ingresa un nombre para identificar este portafolio.
            </p>
            
            <div className="mb-4 md:mb-6">
              <label className="block text-sm font-medium text-[#8892b0] mb-2">
                Nombre del portafolio
              </label>
              <input
                type="text"
                value={newPortfolioName}
                onChange={(e) => setNewPortfolioName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreatePortfolio()}
                placeholder="Ej: Portafolio Principal..."
                className="w-full h-12 px-4 bg-[rgba(255,255,255,0.03)] border border-[rgba(0,163,255,0.15)] rounded-lg text-white placeholder:text-[#8892b0] focus:outline-none focus:border-[#00A3FF] focus:ring-1 focus:ring-[#00A3FF] transition-all text-base"
                autoFocus
              />
            </div>
            
            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
              <Button
                variant="outline"
                onClick={() => setShowCreateModal(false)}
                className="flex-1 border-[rgba(0,163,255,0.15)] text-[#8892b0] hover:bg-[rgba(0,163,255,0.1)] hover:text-white min-h-[44px]"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreatePortfolio}
                disabled={!newPortfolioName.trim()}
                className="flex-1 bg-gradient-to-r from-[#00A3FF] to-[#0066FF] hover:opacity-90 text-white disabled:opacity-50 min-h-[44px]"
              >
                Crear y Entrar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
