"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Bell, ChevronDown, Command, User, Settings, LogOut, X, Check, AlertTriangle, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { useBranex } from './branex-provider'
import { parseDecimal, formatDollar as formatNavNumber } from '@/lib/utils'

export function Navbar() {
  const router = useRouter()
  const { 
    activePortfolio, 
    profile, 
    updateProfile, 
    updatePortfolioMeta,
    exitPortfolio, 
    deletePortfolio, 
    holdings, 
    metrics 
  } = useBranex()
  
  const [isMarketOpen, setIsMarketOpen] = useState(true)
  const [showProfileSheet, setShowProfileSheet] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  
  // Profile editing state
  const [editName, setEditName] = useState('')
  const [editCompany, setEditCompany] = useState('')
  const [profileSaved, setProfileSaved] = useState(false)
  
  // Portfolio settings state
  const [editPortfolioName, setEditPortfolioName] = useState('')
  const [editStartDate, setEditStartDate] = useState('')
  const [editInitialCapital, setEditInitialCapital] = useState('')
  const [settingsSaved, setSettingsSaved] = useState(false)

  // Get initials from name
  const getInitials = (name: string) => {
    const parts = name.trim().split(' ')
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
  }

  const initials = getInitials(profile.name || 'Usuario')

  // Handle opening profile sheet
  const handleOpenProfile = () => {
    setEditName(profile.name || '')
    setEditCompany(profile.company || '')
    setProfileSaved(false)
    setShowProfileSheet(true)
  }

  // Handle saving profile
  const handleSaveProfile = () => {
    updateProfile({ name: editName, company: editCompany })
    setProfileSaved(true)
    setTimeout(() => setProfileSaved(false), 2000)
  }

  // Handle opening settings modal
  const handleOpenSettings = () => {
    setEditPortfolioName(activePortfolio?.name || '')
    setEditStartDate(profile.portfolioStartDate || '')
    setEditInitialCapital(profile.initialCapital?.toString() || '0')
    setSettingsSaved(false)
    setShowSettingsModal(true)
  }

  // Handle saving settings
  const handleSaveSettings = () => {
    if (editPortfolioName.trim()) {
      updatePortfolioMeta({ name: editPortfolioName.trim() })
    }
    updateProfile({ 
      portfolioStartDate: editStartDate,
      initialCapital: parseDecimal(editInitialCapital)
    })
    setSettingsSaved(true)
    setTimeout(() => setSettingsSaved(false), 2000)
  }

  // Handle exit portfolio
  const handleExitPortfolio = () => {
    exitPortfolio()
    setShowSettingsModal(false)
    router.push('/')
  }

  // Handle delete portfolio
  const handleDeletePortfolio = () => {
    if (activePortfolio) {
      deletePortfolio(activePortfolio.id)
    }
    setShowDeleteConfirm(false)
    setShowSettingsModal(false)
    router.push('/')
  }

  // Handle logout
  const handleLogout = () => {
    exitPortfolio()
    router.push('/')
  }

  // Check market status
  useState(() => {
    const checkMarketStatus = () => {
      const now = new Date()
      const nyHour = parseInt(new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/New_York',
        hour: '2-digit',
        hour12: false
      }).format(now))
      const nyMinute = parseInt(new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/New_York',
        minute: '2-digit'
      }).format(now))
      const dayOfWeek = now.getDay()
      
      const marketOpenMinutes = 9 * 60 + 30
      const marketCloseMinutes = 16 * 60
      const currentMinutes = nyHour * 60 + nyMinute
      
      setIsMarketOpen(
        dayOfWeek >= 1 && dayOfWeek <= 5 &&
        currentMinutes >= marketOpenMinutes && currentMinutes < marketCloseMinutes
      )
    }

    checkMarketStatus()
    const interval = setInterval(checkMarketStatus, 60000) // Check every minute
    return () => clearInterval(interval)
  })


  return (
    <>
      <nav className="fixed top-0 left-0 right-0 h-14 md:h-16 z-50 backdrop-blur-xl bg-[#050510]/80 border-b border-[rgba(0,163,255,0.15)]">
        <div className="flex items-center justify-between h-full px-3 md:px-4 lg:px-6">
          {/* Logo + Portfolio Name */}
          <div className="flex items-center gap-2 md:gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00A3FF] to-[#0066FF] flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-white">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="font-[family-name:var(--font-space-grotesk)] font-bold text-lg md:text-xl tracking-tight text-white">
                BRANEX
              </span>
            </div>
            
            {/* Portfolio Name - Hidden on mobile */}
            {activePortfolio && (
              <div className="hidden sm:flex items-center gap-2 ml-2">
                <span className="text-[#00A3FF]">/</span>
                <span className="text-sm text-[#8892b0]">{activePortfolio.name}</span>
              </div>
            )}
          </div>

          {/* Search Bar - Hidden on mobile and tablet */}
          <div className="hidden lg:flex flex-1 max-w-xl mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8892b0]" />
              <input
                type="text"
                placeholder="Buscar activos, sectores, simbolos..."
                className="w-full h-10 pl-10 pr-20 bg-[rgba(255,255,255,0.03)] border border-[rgba(0,163,255,0.15)] rounded-lg text-sm text-white placeholder:text-[#8892b0] focus:outline-none focus:border-[#00A3FF] focus:ring-1 focus:ring-[#00A3FF] transition-all"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 px-1.5 py-0.5 bg-[rgba(0,163,255,0.1)] rounded text-xs text-[#8892b0]">
                <Command className="w-3 h-3" />
                <span>K</span>
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Market Status - Dot only on mobile, full text on sm+ */}
            <div className="flex items-center gap-2 px-2 md:px-3 py-1.5 rounded-full bg-[rgba(255,255,255,0.03)] border border-[rgba(0,163,255,0.15)]">
              <div className={`w-2 h-2 rounded-full ${isMarketOpen ? 'bg-[#00FF88] animate-pulse' : 'bg-[#FF3366]'}`} />
              <span className="hidden sm:inline text-xs font-medium text-[#8892b0]">
                {isMarketOpen ? 'MERCADO ABIERTO' : 'MERCADO CERRADO'}
              </span>
            </div>

            {/* Notifications - Hidden on mobile */}
            <Button
              variant="ghost"
              size="icon"
              className="hidden sm:flex relative text-[#8892b0] hover:text-white hover:bg-[rgba(0,163,255,0.1)]"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#FF3366] rounded-full" />
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 px-1 md:px-2 hover:bg-[rgba(0,163,255,0.1)] min-h-[44px]"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7B61FF] to-[#00A3FF] flex items-center justify-center text-sm font-medium text-white">
                    {initials}
                  </div>
                  <span className="hidden lg:block text-sm text-white">{profile.name || 'Usuario'}</span>
                  <ChevronDown className="hidden md:block w-4 h-4 text-[#8892b0]" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-[#0D0D2B] border-[rgba(0,163,255,0.15)]">
                <DropdownMenuItem 
                  onClick={handleOpenProfile}
                  className="text-white hover:bg-[rgba(0,163,255,0.1)] cursor-pointer"
                >
                  <User className="w-4 h-4 mr-2" />
                  Mi Perfil
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleOpenSettings}
                  className="text-white hover:bg-[rgba(0,163,255,0.1)] cursor-pointer"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Configuración del Portafolio
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-[rgba(0,163,255,0.15)]" />
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="text-[#FF3366] hover:bg-[rgba(255,51,102,0.1)] cursor-pointer"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>

      {/* Profile Sheet */}
      <Sheet open={showProfileSheet} onOpenChange={setShowProfileSheet}>
        <SheetContent className="bg-[#0D0D2B] border-l border-[rgba(0,163,255,0.15)] w-full sm:max-w-md">
          <SheetHeader className="mb-8">
            <SheetTitle className="text-white text-xl font-[family-name:var(--font-space-grotesk)]">
              Mi Perfil
            </SheetTitle>
          </SheetHeader>
          
          <div className="space-y-6">
            {/* Avatar */}
            <div className="flex justify-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#7B61FF] to-[#00A3FF] flex items-center justify-center text-3xl font-bold text-white">
                {getInitials(editName || 'U')}
              </div>
            </div>
            
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-[#8892b0] mb-2">
                Nombre completo
              </label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full h-11 px-4 bg-[rgba(255,255,255,0.03)] border border-[rgba(0,163,255,0.15)] rounded-lg text-white placeholder:text-[#8892b0] focus:outline-none focus:border-[#00A3FF] transition-all"
              />
            </div>
            
            {/* Company */}
            <div>
              <label className="block text-sm font-medium text-[#8892b0] mb-2">
                Empresa
              </label>
              <input
                type="text"
                value={editCompany}
                onChange={(e) => setEditCompany(e.target.value)}
                placeholder="Opcional"
                className="w-full h-11 px-4 bg-[rgba(255,255,255,0.03)] border border-[rgba(0,163,255,0.15)] rounded-lg text-white placeholder:text-[#8892b0] focus:outline-none focus:border-[#00A3FF] transition-all"
              />
            </div>
            
            {/* Portfolio Info (Read-only) */}
            <div className="pt-4 border-t border-[rgba(0,163,255,0.1)] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#8892b0]">Portafolio activo</span>
                <span className="text-sm text-white">{activePortfolio?.name || '—'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#8892b0]">Fecha de inicio</span>
                <span className="text-sm text-white">{profile.portfolioStartDate || '—'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#8892b0]">Total de posiciones</span>
                <span className="text-sm text-white">{holdings.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#8892b0]">Valor del portafolio</span>
                <span className="text-sm font-mono text-[#00FF88]">${formatNavNumber(metrics.totalValue)}</span>
              </div>
            </div>
            
            {/* Save Button */}
            <Button
              onClick={handleSaveProfile}
              className={`w-full ${profileSaved ? 'bg-[#00FF88] text-[#050510]' : 'bg-gradient-to-r from-[#00A3FF] to-[#0066FF]'} hover:opacity-90 text-white`}
            >
              {profileSaved ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Guardado
                </>
              ) : 'Guardar Cambios'}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center md:p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowSettingsModal(false)}
          />
          <div className="relative glass-card p-6 md:p-8 w-full md:max-w-lg max-h-[90vh] md:max-h-none overflow-y-auto rounded-t-2xl md:rounded-xl">
            <button
              onClick={() => setShowSettingsModal(false)}
              className="absolute top-4 right-4 p-2 text-[#8892b0] hover:text-white hover:bg-[rgba(255,255,255,0.05)] rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h2 className="text-xl md:text-2xl font-bold font-[family-name:var(--font-space-grotesk)] text-white mb-6">
              Configuracion del Portafolio
            </h2>
            
            <div className="space-y-5 mb-6">
              {/* Portfolio Name */}
              <div>
                <label className="block text-sm font-medium text-[#8892b0] mb-2">
                  Nombre del Portafolio
                </label>
                <input
                  type="text"
                  value={editPortfolioName}
                  onChange={(e) => setEditPortfolioName(e.target.value)}
                  className="w-full h-11 px-4 bg-[rgba(255,255,255,0.03)] border border-[rgba(0,163,255,0.15)] rounded-lg text-white placeholder:text-[#8892b0] focus:outline-none focus:border-[#00A3FF] transition-all"
                />
              </div>
              
              {/* Currency (Fixed) */}
              <div>
                <label className="block text-sm font-medium text-[#8892b0] mb-2">
                  Moneda base
                </label>
                <input
                  type="text"
                  value="USD"
                  disabled
                  className="w-full h-11 px-4 bg-[rgba(255,255,255,0.02)] border border-[rgba(0,163,255,0.1)] rounded-lg text-[#8892b0] cursor-not-allowed"
                />
              </div>
              
              {/* Start Date */}
              <div>
                <label className="block text-sm font-medium text-[#8892b0] mb-2">
                  Fecha de inicio
                </label>
                <input
                  type="date"
                  value={editStartDate}
                  onChange={(e) => setEditStartDate(e.target.value)}
                  className="w-full h-11 px-4 bg-[rgba(255,255,255,0.03)] border border-[rgba(0,163,255,0.15)] rounded-lg text-white focus:outline-none focus:border-[#00A3FF] transition-all"
                />
              </div>
              
              {/* Initial Capital */}
              <div>
                <label className="block text-sm font-medium text-[#8892b0] mb-2">
                  Capital inicial
                </label>
                <input
                  type="number"
                  value={editInitialCapital}
                  onChange={(e) => setEditInitialCapital(e.target.value)}
                  className="w-full h-11 px-4 bg-[rgba(255,255,255,0.03)] border border-[rgba(0,163,255,0.15)] rounded-lg text-white focus:outline-none focus:border-[#00A3FF] transition-all"
                />
              </div>
            </div>
            
            {/* Save Button */}
            <Button
              onClick={handleSaveSettings}
              className={`w-full mb-6 ${settingsSaved ? 'bg-[#00FF88] text-[#050510]' : 'bg-gradient-to-r from-[#00A3FF] to-[#0066FF]'} hover:opacity-90 text-white`}
            >
              {settingsSaved ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Guardado
                </>
              ) : 'Guardar Cambios'}
            </Button>
            
            {/* Danger Zone */}
            <div className="pt-6 border-t border-[rgba(255,51,102,0.2)]">
              <p className="text-sm text-[#8892b0] mb-4">Zona de peligro</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  onClick={handleExitPortfolio}
                  className="flex-1 border-[#FF3366]/30 text-[#FF3366] hover:bg-[#FF3366]/10 min-h-[44px]"
                >
                  Salir del Portafolio
                </Button>
                <Button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex-1 bg-[#FF3366] hover:bg-[#FF3366]/80 text-white min-h-[44px]"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Eliminar Portafolio
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center md:p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowDeleteConfirm(false)}
          />
          <div className="relative glass-card p-6 md:p-8 w-full md:max-w-md border border-[#FF3366]/30 rounded-t-2xl md:rounded-xl">
            <div className="flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full bg-[#FF3366]/10 mx-auto mb-4 md:mb-6">
              <AlertTriangle className="w-7 h-7 md:w-8 md:h-8 text-[#FF3366]" />
            </div>
            
            <h3 className="text-lg md:text-xl font-bold text-white text-center mb-2">
              Eliminar este portafolio?
            </h3>
            <p className="text-sm md:text-base text-[#8892b0] text-center mb-6">
              Esta accion no se puede deshacer. Se eliminaran todas las posiciones, transacciones y snapshots de <strong className="text-white">{activePortfolio?.name}</strong>.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 border-[rgba(0,163,255,0.15)] text-[#8892b0] hover:bg-[rgba(0,163,255,0.1)] hover:text-white min-h-[44px]"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleDeletePortfolio}
                className="flex-1 bg-[#FF3366] hover:bg-[#FF3366]/80 text-white min-h-[44px]"
              >
                Si, eliminar
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
