"use client"

import { useState, useEffect } from 'react'
import { Clock, ExternalLink, AlertCircle, Settings, RefreshCw, Newspaper } from 'lucide-react'
import { ProtectedRoute } from '@/components/branex/protected-route'
import { useBranex } from '@/components/branex/branex-provider'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface NewsItem {
  id: number
  headline: string
  summary: string
  source: string
  url: string
  datetime: number
  category: string
  image?: string
}

// Format time ago
const formatTimeAgo = (timestamp: number): string => {
  const now = Date.now() / 1000
  const diff = now - timestamp
  
  if (diff < 3600) {
    const minutes = Math.floor(diff / 60)
    return `Hace ${minutes} min`
  } else if (diff < 86400) {
    const hours = Math.floor(diff / 3600)
    return `Hace ${hours}h`
  } else {
    const days = Math.floor(diff / 86400)
    return `Hace ${days} dia${days > 1 ? 's' : ''}`
  }
}

// Empty state when no API key
function NoApiKeyState() {
  return (
    <div className="glass-card p-12 text-center animate-fade-slide-up">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#FFB800]/20 to-[#FF8C00]/20 border border-[#FFB800]/30 mb-6">
        <Newspaper className="w-10 h-10 text-[#FFB800]" />
      </div>
      <h2 className="text-2xl font-bold font-[family-name:var(--font-space-grotesk)] text-white mb-3">
        Configura tu API Key de Finnhub
      </h2>
      <p className="text-[#8892b0] max-w-md mx-auto mb-8">
        Para ver noticias financieras en tiempo real, necesitas configurar tu API key gratuita de Finnhub en la seccion de Configuracion.
      </p>
      <div className="flex items-center justify-center gap-4">
        <a
          href="https://finnhub.io/register"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[rgba(255,184,0,0.1)] border border-[#FFB800]/30 text-[#FFB800] rounded-lg font-medium hover:bg-[rgba(255,184,0,0.2)] transition-colors"
        >
          Obtener clave gratuita
          <ExternalLink className="w-4 h-4" />
        </a>
        <a
          href="/configuracion"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#00A3FF] to-[#0066FF] hover:opacity-90 text-white rounded-lg font-medium transition-opacity"
        >
          <Settings className="w-4 h-4" />
          Ir a Configuracion
        </a>
      </div>
    </div>
  )
}

export default function NoticiasPage() {
  const { profile } = useBranex()
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const finnhubKey = profile.finnhubApiKey || ''
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  // Fetch news from Finnhub
  const fetchNews = async () => {
    if (!finnhubKey) {
      setLoading(false)
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(
        `https://finnhub.io/api/v1/news?category=general&token=${finnhubKey}`
      )
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('API key invalida. Verifica tu clave en Configuracion.')
        }
        throw new Error('Error al obtener noticias')
      }
      
      const data = await response.json()
      
      // Filter and format news
      const formattedNews: NewsItem[] = data.slice(0, 20).map((item: NewsItem, index: number) => ({
        id: item.id || index,
        headline: item.headline || 'Sin titulo',
        summary: item.summary || '',
        source: item.source || 'Desconocido',
        url: item.url || '#',
        datetime: item.datetime || Date.now() / 1000,
        category: item.category || 'General',
        image: item.image,
      }))
      
      setNews(formattedNews)
      setLastUpdate(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNews()
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchNews, 300000)
    return () => clearInterval(interval)
  }, [])

  const handleRefresh = () => {
    fetchNews()
  }

  return (
    <ProtectedRoute>
        <div className="p-4 md:p-6 lg:p-8">
          <div className="flex flex-col gap-4 mb-6 md:mb-8">
            <div className="animate-fade-slide-up">
              <h1 className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-space-grotesk)] text-white mb-2">
                Noticias
              </h1>
              <p className="text-sm md:text-base text-[#8892b0]">
                Ultimas noticias del mercado financiero en tiempo real.
              </p>
            </div>
            {finnhubKey && (
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
            )}
          </div>

          {/* No API Key State */}
          {!finnhubKey && !loading && <NoApiKeyState />}

          {/* Error State */}
          {error && (
            <div className="glass-card p-4 mb-6 border-[rgba(255,51,102,0.3)] bg-[rgba(255,51,102,0.05)] animate-fade-slide-up">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-[#FF3366]" />
                <p className="text-[#FF3366]">{error}</p>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && apiKey && (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="glass-card p-5 animate-pulse">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="h-3 bg-[rgba(255,255,255,0.05)] rounded w-24 mb-3" />
                      <div className="h-5 bg-[rgba(255,255,255,0.05)] rounded w-3/4 mb-2" />
                      <div className="h-4 bg-[rgba(255,255,255,0.05)] rounded w-full mb-2" />
                      <div className="h-4 bg-[rgba(255,255,255,0.05)] rounded w-2/3" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* News Feed */}
          {!loading && apiKey && news.length > 0 && (
            <div className="space-y-4">
              {news.map((item, i) => (
                <a
                  key={item.id}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-card p-5 block hover:border-[rgba(0,163,255,0.3)] transition-all animate-fade-slide-up group"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div className="flex items-start gap-4">
                    {item.image && (
                      <div className="w-32 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-[rgba(255,255,255,0.05)]">
                        <img 
                          src={item.image} 
                          alt="" 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none'
                          }}
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <span className="text-sm font-medium text-[#00A3FF]">{item.source}</span>
                        <div className="flex items-center gap-1 text-xs text-[#8892b0]">
                          <Clock className="w-3 h-3" />
                          {formatTimeAgo(item.datetime)}
                        </div>
                        <span className="px-2 py-0.5 text-xs rounded-full bg-[rgba(255,255,255,0.05)] text-[#8892b0]">
                          {item.category}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-[#00A3FF] transition-colors line-clamp-2">
                        {item.headline}
                      </h3>
                      {item.summary && (
                        <p className="text-sm text-[#8892b0] line-clamp-2 mb-3">
                          {item.summary}
                        </p>
                      )}
                      <span className="inline-flex items-center gap-1 text-xs text-[#8892b0] group-hover:text-[#00A3FF] transition-colors">
                        Leer mas
                        <ExternalLink className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}

          {/* Empty State (API key but no news) */}
          {!loading && apiKey && news.length === 0 && !error && (
            <div className="glass-card p-12 text-center animate-fade-slide-up">
              <div className="w-16 h-16 rounded-full bg-[rgba(0,163,255,0.1)] flex items-center justify-center mx-auto mb-4">
                <Newspaper className="w-8 h-8 text-[#00A3FF]" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">No hay noticias disponibles</h3>
              <p className="text-sm text-[#8892b0]">
                Intenta actualizar la pagina o vuelve mas tarde.
              </p>
            </div>
          )}
        </div>
    </ProtectedRoute>
  )
}
