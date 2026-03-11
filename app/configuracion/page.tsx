"use client"

import { useState, useRef } from 'react'
import { User, Building2, DollarSign, Calendar, BarChart3, Download, Upload, RotateCcw, Check, AlertTriangle, Key, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProtectedRoute } from '@/components/branex/protected-route'
import { useBranex } from '@/components/branex/branex-provider'
import { cn, formatNumber, parseDecimal } from '@/lib/utils'

export default function ConfiguracionPage() {
  const { profile, updateProfile, exportToCSV, importFromCSV, resetData} = useBranex()
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [importSuccess, setImportSuccess] = useState(false)
  const [localProfile, setLocalProfile] = useState(profile)
  const [hasChanges, setHasChanges] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Sync local profile when data loads
  useState(() => {
    setLocalProfile(profile)
  })

  const handleProfileChange = (field: keyof typeof profile, value: string | number) => {
    setLocalProfile(prev => ({ ...prev, [field]: value }))
    setHasChanges(true)
  }

  const handleSaveProfile = () => {
    updateProfile(localProfile)
    setHasChanges(false)
  }

  const handleExport = () => {
    const csvContent = exportToCSV()
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `branex_transacciones_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      importFromCSV(content)
      setImportSuccess(true)
      setTimeout(() => setImportSuccess(false), 3000)
    }
    reader.readAsText(file)
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleReset = () => {
    resetData()
    setShowResetConfirm(false)
    setLocalProfile(profile)
  }

  return (
    <ProtectedRoute>
        <div className="p-4 md:p-6 lg:p-8 max-w-4xl">
          {/* Page Header */}
          <div className="mb-6 md:mb-8 animate-fade-slide-up">
            <h1 className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-space-grotesk)] text-white mb-2">
              Configuracion
            </h1>
            <p className="text-sm md:text-base text-[#8892b0]">
              Administra tu perfil, preferencias y datos del portafolio.
            </p>
          </div>

          {/* Profile Section */}
          <div className="glass-card p-6 mb-6 animate-fade-slide-up" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#00A3FF] to-[#0066FF] flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Perfil</h2>
                <p className="text-sm text-[#8892b0]">Información personal y de la empresa</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-[#8892b0] mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Nombre
                </label>
                <input
                  type="text"
                  value={localProfile.name}
                  onChange={(e) => handleProfileChange('name', e.target.value)}
                  className="w-full h-10 px-3 bg-[rgba(255,255,255,0.03)] border border-[rgba(0,163,255,0.15)] rounded-lg text-white focus:outline-none focus:border-[#00A3FF]"
                />
              </div>
              <div>
                <label className="block text-sm text-[#8892b0] mb-2">
                  <Building2 className="w-4 h-4 inline mr-2" />
                  Empresa
                </label>
                <input
                  type="text"
                  value={localProfile.company}
                  onChange={(e) => handleProfileChange('company', e.target.value)}
                  className="w-full h-10 px-3 bg-[rgba(255,255,255,0.03)] border border-[rgba(0,163,255,0.15)] rounded-lg text-white focus:outline-none focus:border-[#00A3FF]"
                />
              </div>
              <div>
                <label className="block text-sm text-[#8892b0] mb-2">
                  <DollarSign className="w-4 h-4 inline mr-2" />
                  Moneda Base
                </label>
                <select
                  value={localProfile.currency}
                  onChange={(e) => handleProfileChange('currency', e.target.value)}
                  className="w-full h-10 px-3 bg-[rgba(255,255,255,0.03)] border border-[rgba(0,163,255,0.15)] rounded-lg text-white focus:outline-none focus:border-[#00A3FF]"
                >
                  <option value="USD" className="bg-[#0D0D2B]">USD - Dólar estadounidense</option>
                  <option value="EUR" className="bg-[#0D0D2B]">EUR - Euro</option>
                  <option value="GBP" className="bg-[#0D0D2B]">GBP - Libra esterlina</option>
                  <option value="MXN" className="bg-[#0D0D2B]">MXN - Peso mexicano</option>
                </select>
              </div>
            </div>

            {hasChanges && (
              <div className="mt-4 flex justify-end">
                <Button
                  onClick={handleSaveProfile}
                  className="bg-gradient-to-r from-[#00A3FF] to-[#0066FF] hover:opacity-90 text-white"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Guardar Cambios
                </Button>
              </div>
            )}
          </div>

          {/* Portfolio Data Section */}
          <div className="glass-card p-6 mb-6 animate-fade-slide-up" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#7B61FF] to-[#5B41DF] flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Datos del Portafolio</h2>
                <p className="text-sm text-[#8892b0]">Configuración inicial y benchmark</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-[#8892b0] mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Fecha de Inicio del Portafolio
                </label>
                <input
                  type="date"
                  value={localProfile.portfolioStartDate}
                  onChange={(e) => handleProfileChange('portfolioStartDate', e.target.value)}
                  className="w-full h-10 px-3 bg-[rgba(255,255,255,0.03)] border border-[rgba(0,163,255,0.15)] rounded-lg text-white focus:outline-none focus:border-[#00A3FF]"
                />
              </div>
              <div>
                <label className="block text-sm text-[#8892b0] mb-2">
                  <DollarSign className="w-4 h-4 inline mr-2" />
                  Capital Inicial Invertido
                </label>
                <input
                  type="number"
                  value={localProfile.initialCapital}
                  onChange={(e) => handleProfileChange('initialCapital', parseDecimal(e.target.value))}
                  className="w-full h-10 px-3 bg-[rgba(255,255,255,0.03)] border border-[rgba(0,163,255,0.15)] rounded-lg text-white focus:outline-none focus:border-[#00A3FF]"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-[#8892b0] mb-2">
                  <BarChart3 className="w-4 h-4 inline mr-2" />
                  Benchmark de Referencia
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'SP500', label: 'S&P 500', desc: 'Índice de 500 empresas' },
                    { value: 'NASDAQ', label: 'NASDAQ', desc: 'Índice tecnológico' },
                    { value: 'CUSTOM', label: 'Personalizado', desc: 'Sin benchmark' },
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => handleProfileChange('benchmark', option.value)}
                      className={cn(
                        "p-4 rounded-lg border text-left transition-all",
                        localProfile.benchmark === option.value
                          ? "border-[#00A3FF] bg-[rgba(0,163,255,0.1)]"
                          : "border-[rgba(0,163,255,0.15)] hover:border-[rgba(0,163,255,0.3)] bg-[rgba(255,255,255,0.02)]"
                      )}
                    >
                      <p className="font-medium text-white">{option.label}</p>
                      <p className="text-xs text-[#8892b0] mt-1">{option.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {hasChanges && (
              <div className="mt-4 flex justify-end">
                <Button
                  onClick={handleSaveProfile}
                  className="bg-gradient-to-r from-[#00A3FF] to-[#0066FF] hover:opacity-90 text-white"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Guardar Cambios
                </Button>
              </div>
            )}
          </div>

          {/* API Keys Section */}
          <div className="glass-card p-6 mb-6 animate-fade-slide-up" style={{ animationDelay: '300ms' }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#FFB800] to-[#FF8C00] flex items-center justify-center">
                <Key className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">API Keys</h2>
                <p className="text-sm text-[#8892b0]">Configura tus claves de API para datos en tiempo real</p>
              </div>
            </div>

            <div className="p-4 rounded-lg border border-[rgba(0,163,255,0.15)] bg-[rgba(255,255,255,0.02)]">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h3 className="font-medium text-white mb-1">Finnhub API Key</h3>
                  <p className="text-sm text-[#8892b0]">
                    Necesaria para ver noticias financieras y estado del mercado en tiempo real.
                  </p>
                </div>
                <a
                  href="https://finnhub.io/register"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-[#00A3FF] hover:underline whitespace-nowrap"
                >
                  Obtener clave gratuita
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <input
                type="password"
                value={localProfile.finnhubApiKey || ''}
                onChange={(e) => handleProfileChange('finnhubApiKey', e.target.value)}
                placeholder="Ingresa tu API key de Finnhub"
                className="w-full h-10 px-3 bg-[rgba(255,255,255,0.03)] border border-[rgba(0,163,255,0.15)] rounded-lg text-white placeholder:text-[#8892b0] focus:outline-none focus:border-[#00A3FF] font-mono"
              />
              <p className="text-xs text-[#8892b0] mt-2">
                Tu clave se guarda localmente y nunca se comparte con terceros.
              </p>
            </div>

            {hasChanges && (
              <div className="mt-4 flex justify-end">
                <Button
                  onClick={handleSaveProfile}
                  className="bg-gradient-to-r from-[#00A3FF] to-[#0066FF] hover:opacity-90 text-white"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Guardar Cambios
                </Button>
              </div>
            )}
          </div>

          {/* Export/Import Section */}
          <div className="glass-card p-6 mb-6 animate-fade-slide-up" style={{ animationDelay: '400ms' }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#00FF88] to-[#00CC6A] flex items-center justify-center">
                <Download className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Exportar / Importar Datos</h2>
                <p className="text-sm text-[#8892b0]">Descarga o sube tus transacciones en formato CSV</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border border-[rgba(0,163,255,0.15)] bg-[rgba(255,255,255,0.02)]">
                <h3 className="font-medium text-white mb-2">Exportar Transacciones</h3>
                <p className="text-sm text-[#8892b0] mb-4">
                  Descarga todas tus transacciones en un archivo CSV compatible con Excel.
                </p>
                <Button
                  onClick={handleExport}
                  className="w-full bg-[#00FF88] hover:bg-[#00CC6A] text-[#050510] font-medium"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Descargar CSV
                </Button>
              </div>

              <div className="p-4 rounded-lg border border-[rgba(0,163,255,0.15)] bg-[rgba(255,255,255,0.02)]">
                <h3 className="font-medium text-white mb-2">Importar Transacciones</h3>
                <p className="text-sm text-[#8892b0] mb-4">
                  Sube un archivo CSV con transacciones para añadirlas a tu historial.
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Button
                  onClick={handleImportClick}
                  variant="outline"
                  className={cn(
                    "w-full border-[rgba(0,163,255,0.3)] text-white hover:bg-[rgba(0,163,255,0.1)]",
                    importSuccess && "border-[#00FF88] bg-[rgba(0,255,136,0.1)]"
                  )}
                >
                  {importSuccess ? (
                    <>
                      <Check className="w-4 h-4 mr-2 text-[#00FF88]" />
                      Importado con éxito
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Subir CSV
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Reset Section */}
          <div className="glass-card p-6 animate-fade-slide-up border border-[rgba(255,51,102,0.2)]" style={{ animationDelay: '500ms' }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#FF3366] to-[#CC2952] flex items-center justify-center">
                <RotateCcw className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Restablecer Datos</h2>
                <p className="text-sm text-[#8892b0]">Eliminar todos los datos y volver a los valores iniciales</p>
              </div>
            </div>

            <div className="p-4 rounded-lg border border-[rgba(255,51,102,0.2)] bg-[rgba(255,51,102,0.05)]">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-[#FF3366] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-white mb-2">
                    Esta acción eliminará permanentemente todas tus posiciones, transacciones y configuración.
                    El portafolio quedará completamente vacío.
                  </p>
                  <p className="text-xs text-[#8892b0]">
                    Esta acción no se puede deshacer. Considera exportar tus datos antes de continuar.
                  </p>
                </div>
              </div>
            </div>

            {showResetConfirm ? (
              <div className="mt-4 flex items-center gap-3">
                <p className="text-sm text-[#FF3366]">¿Estás seguro?</p>
                <Button
                  onClick={handleReset}
                  className="bg-[#FF3366] hover:bg-[#CC2952] text-white"
                >
                  Sí, restablecer todo
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setShowResetConfirm(false)}
                  className="text-[#8892b0] hover:text-white"
                >
                  Cancelar
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => setShowResetConfirm(true)}
                variant="outline"
                className="mt-4 border-[#FF3366] text-[#FF3366] hover:bg-[rgba(255,51,102,0.1)]"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Restablecer Datos
              </Button>
            )}
          </div>
        </div>
    </ProtectedRoute>
  )
}
