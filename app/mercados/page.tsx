"use client"

import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, AlertCircle, Settings, RefreshCw, Clock, Bitcoin, Coins } from 'lucide-react'
import { ProtectedRoute } from '@/components/branex/protected-route'
import { useBranex } from '@/components/branex/branex-provider'
import { Button } from '@/components/ui/button'
import { cn, formatNumber, formatCurrency } from '@/lib/utils'

interface CryptoPrice {
  id: string
  name: string
  symbol: string
  price: number
  change24h: number
}

interface MarketStatus {
  isOpen: boolean
  exchange: string
  timestamp: string
}

export default function MercadosPage() {
  const { profile } = useBranex()
  const [cryptoPrices, setCryptoPrices] = useState<CryptoPrice[]>([])
  const [marketStatus, setMarketStatus] = useState<MarketStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const finnhubKey = profile.finnhubApiKey || ''

  // Fetch crypto prices from CoinGecko (free, no API key needed)
  const fetchCryptoPrices = async () => {
    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true'
      )
      
      if (!response.ok) throw new Error('Error fetching crypto prices')
      
      const data = await response.json()
      
      const prices: CryptoPrice[] = [
        {
          id: 'bitcoin',
          name: 'Bitcoin',
          symbol: 'BTC',
          price: data.bitcoin?.usd || 0,
          change24h: data.bitcoin?.usd_24h_change || 0,
        },
        {
          id: 'ethereum',
          name: 'Ethereum',
          symbol: 'ETH',
          price: data.ethereum?.usd || 0,
          change24h: data.ethereum?.usd_24h_change || 0,
        },
        {
          id: 'solana',
          name: 'Solana',
          symbol: 'SOL',
          price: data.solana?.usd || 0,
          change24h: data.solana?.usd_24h_change || 0,
        },
      ]
      
      setCryptoPrices(prices)
      setLastUpdate(new Date())
    } catch (err) {
      console.error('Error fetching crypto:', err)
    }
  }

  // Fetch market status from Finnhub (requires API key)
  const fetchMarketStatus = async () => {
    if (!finnhubKey) {
      setMarketStatus(null)
      return
    }
    
    try {
      const response = await fetch(
        `https://finnhub.io/api/v1/stock/market-status?exchange=US&token=${finnhubKey}`
      )
      
      if (!response.ok) throw new Error('Error fetching market status')
      
      const data = await response.json()
      
      setMarketStatus({
        isOpen: data.isOpen,
        exchange: data.exchange || 'US',
        timestamp: data.t ? new Date(data.t * 1000).toLocaleTimeString('es-ES') : '',
      })
    } catch (err) {
      console.error('Error fetching market status:', err)
      setMarketStatus(null)
    }
  }

  // Initial fetch and refresh
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      await Promise.all([fetchCryptoPrices(), fetchMarketStatus()])
      setLoading(false)
    }
    
    fetchData()
    
    // Refresh every 60 seconds
    const interval = setInterval(fetchData, 60000)
    return () => clearInterval(interval)
  }, [])

  const handleRefresh = async () => {
    setLoading(true)
    await Promise.all([fetchCryptoPrices(), fetchMarketStatus()])
    setLoading(false)
  }

  return (
    <ProtectedRoute>
        <div className="p-4 md:p-6 lg:p-8">
          <div className="flex flex-col gap-4 mb-6 md:mb-8">
            <div className="animate-fade-slide-up">
              <h1 className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-space-grotesk)] text-white mb-2">
                Mercados
              </h1>
              <p className="text-sm md:text-base text-[#8892b0]">
                Datos en tiempo real de criptomonedas y estado del mercado.
              </p>
            </div>
            <div className="flex items-center gap-3 animate-fade-slide-up" style={{ animationDelay: '100ms' }}>
              {lastUpdate && (
                <span className="text-xs text-[#8892b0] flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Actualizado: {lastUpdate.toLocaleTimeString('es-ES')}
                </span>
              )}
              <Button
                onClick={handleRefresh}
                disabled={loading}
                variant="outline"
                className="border-[rgba(0,163,255,0.3)] text-[#00A3FF] hover:bg-[rgba(0,163,255,0.1)]"
              >
                <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
                Actualizar
              </Button>
            </div>
          </div>

          {/* API Key Warning Banner */}
          {!finnhubKey && (
            <div className="glass-card p-4 mb-6 border-[rgba(255,184,0,0.3)] bg-[rgba(255,184,0,0.05)] animate-fade-slide-up">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-[#FFB800] flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-medium text-white mb-1">Configura tu API Key de Finnhub</h3>
                  <p className="text-sm text-[#8892b0] mb-3">
                    Para ver el estado del mercado en tiempo real, necesitas configurar tu API key gratuita de Finnhub.
                  </p>
                  <div className="flex items-center gap-3">
                    <a
                      href="https://finnhub.io/register"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-[#00A3FF] hover:underline"
                    >
                      Obtener clave gratuita
                    </a>
                    <a
                      href="/configuracion"
                      className="inline-flex items-center gap-1 text-sm text-[#FFB800] hover:underline"
                    >
                      <Settings className="w-3 h-3" />
                      Ir a Configuracion
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Market Status */}
          {marketStatus && (
            <div className="glass-card p-6 mb-6 animate-fade-slide-up" style={{ animationDelay: '100ms' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-3 h-3 rounded-full animate-pulse",
                    marketStatus.isOpen ? "bg-[#00FF88]" : "bg-[#FF3366]"
                  )} />
                  <div>
                    <h2 className="text-lg font-semibold text-white">
                      Mercado {marketStatus.exchange}
                    </h2>
                    <p className="text-sm text-[#8892b0]">
                      {marketStatus.timestamp && `Ultima actualizacion: ${marketStatus.timestamp}`}
                    </p>
                  </div>
                </div>
                <span className={cn(
                  "px-4 py-2 text-sm font-medium rounded-full",
                  marketStatus.isOpen 
                    ? "bg-[rgba(0,255,136,0.1)] text-[#00FF88] border border-[rgba(0,255,136,0.3)]" 
                    : "bg-[rgba(255,51,102,0.1)] text-[#FF3366] border border-[rgba(255,51,102,0.3)]"
                )}>
                  {marketStatus.isOpen ? 'MERCADO ABIERTO' : 'MERCADO CERRADO'}
                </span>
              </div>
            </div>
          )}

          {/* Crypto Prices */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Bitcoin className="w-5 h-5 text-[#FFB800]" />
              <h2 className="text-lg font-semibold font-[family-name:var(--font-space-grotesk)] text-white">
                Criptomonedas en Tiempo Real
              </h2>
              <span className="text-xs text-[#8892b0] ml-2">(CoinGecko API)</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {loading && cryptoPrices.length === 0 ? (
                // Loading skeleton
                [1, 2, 3].map((i) => (
                  <div key={i} className="glass-card p-5 animate-pulse">
                    <div className="h-4 bg-[rgba(255,255,255,0.05)] rounded w-1/3 mb-3" />
                    <div className="h-8 bg-[rgba(255,255,255,0.05)] rounded w-2/3 mb-2" />
                    <div className="h-4 bg-[rgba(255,255,255,0.05)] rounded w-1/4" />
                  </div>
                ))
              ) : (
                cryptoPrices.map((crypto, i) => {
                  const isPositive = crypto.change24h > 0
                  return (
                    <div 
                      key={crypto.id} 
                      className="glass-card p-5 hover:border-[rgba(0,163,255,0.3)] transition-all animate-fade-slide-up"
                      style={{ animationDelay: `${(i + 2) * 100}ms` }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Coins className="w-5 h-5" style={{ color: crypto.id === 'bitcoin' ? '#F7931A' : crypto.id === 'ethereum' ? '#627EEA' : '#14F195' }} />
                          <span className="font-medium text-white">{crypto.name}</span>
                        </div>
                        <span className="text-xs font-mono text-[#8892b0]">{crypto.symbol}</span>
                      </div>
                      <p className="text-2xl font-bold font-mono text-white mb-2">
                        ${formatCurrency(crypto.price)}
                      </p>
                      <div className={cn(
                        "flex items-center gap-1 text-sm font-mono",
                        isPositive ? "text-[#00FF88]" : "text-[#FF3366]"
                      )}>
                        {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        {isPositive ? '+' : ''}{crypto.change24h.toFixed(2)}%
                        <span className="text-[#8892b0] text-xs ml-1">24h</span>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Premium Data Notice */}
          <div className="glass-card p-6 animate-fade-slide-up" style={{ animationDelay: '500ms' }}>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-[rgba(0,163,255,0.1)] flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-6 h-6 text-[#00A3FF]" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Datos de Indices en Tiempo Real
                </h3>
                <p className="text-[#8892b0] mb-4">
                  Los datos de indices como S&P 500, NASDAQ, y DOW JONES requieren una suscripcion premium a proveedores de datos financieros. 
                  Activa tu clave de API premium en Configuracion para acceder a precios en tiempo real de indices y acciones.
                </p>
                <div className="flex flex-wrap gap-3">
                  <span className="px-3 py-1.5 text-xs font-medium rounded-full bg-[rgba(255,255,255,0.05)] text-[#8892b0] border border-[rgba(255,255,255,0.1)]">
                    S&P 500
                  </span>
                  <span className="px-3 py-1.5 text-xs font-medium rounded-full bg-[rgba(255,255,255,0.05)] text-[#8892b0] border border-[rgba(255,255,255,0.1)]">
                    NASDAQ
                  </span>
                  <span className="px-3 py-1.5 text-xs font-medium rounded-full bg-[rgba(255,255,255,0.05)] text-[#8892b0] border border-[rgba(255,255,255,0.1)]">
                    DOW JONES
                  </span>
                  <span className="px-3 py-1.5 text-xs font-medium rounded-full bg-[rgba(255,255,255,0.05)] text-[#8892b0] border border-[rgba(255,255,255,0.1)]">
                    Russell 2000
                  </span>
                  <span className="px-3 py-1.5 text-xs font-medium rounded-full bg-[rgba(255,255,255,0.05)] text-[#8892b0] border border-[rgba(255,255,255,0.1)]">
                    VIX
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
    </ProtectedRoute>
  )
}
