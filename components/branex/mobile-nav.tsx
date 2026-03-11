"use client"

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Briefcase,
  TrendingUp,
  Factory,
  History,
  BarChart3,
  AlertTriangle,
  Star,
  Newspaper,
  Target,
  Settings,
  Menu,
  X,
  ChevronRight
} from 'lucide-react'

// Primary nav items for bottom bar
const primaryItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Briefcase, label: 'Portafolio', href: '/portafolio' },
  { icon: History, label: 'Historial', href: '/historial' },
  { icon: TrendingUp, label: 'Mercados', href: '/mercados' },
]

// All items for drawer
const allItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Briefcase, label: 'Portafolio', href: '/portafolio' },
  { icon: TrendingUp, label: 'Mercados', href: '/mercados' },
  { icon: Factory, label: 'Sectores', href: '/sectores' },
  { icon: History, label: 'Historial', href: '/historial' },
  { icon: BarChart3, label: 'Analisis', href: '/analisis' },
  { icon: AlertTriangle, label: 'Riesgo', href: '/riesgo' },
  { icon: Star, label: 'Watchlist', href: '/watchlist' },
  { icon: Newspaper, label: 'Noticias', href: '/noticias' },
  { icon: Target, label: 'Resumen', href: '/ia-insights' },
  { icon: Settings, label: 'Configuracion', href: '/configuracion' },
]

export function MobileNav() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      {/* Bottom Navigation Bar - Only visible on mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[#080820]/95 backdrop-blur-xl border-t border-[rgba(0,163,255,0.15)] safe-area-bottom">
        <div className="flex items-center justify-around h-16 px-2">
          {primaryItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={cn(
                  "relative flex flex-col items-center justify-center min-w-[64px] min-h-[44px] py-1 rounded-lg transition-colors",
                  isActive 
                    ? "text-[#00A3FF]" 
                    : "text-[#8892b0]"
                )}
              >
                {isActive && (
                  <div className="absolute -top-px left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-[#00A3FF] shadow-[0_0_8px_rgba(0,163,255,0.6)]" />
                )}
                <Icon className={cn(
                  "w-5 h-5 mb-0.5",
                  isActive && "text-[#00A3FF]"
                )} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            )
          })}
          
          {/* Menu Button */}
          <button
            onClick={() => setIsDrawerOpen(true)}
            className={cn(
              "flex flex-col items-center justify-center min-w-[64px] min-h-[44px] py-1 rounded-lg transition-colors",
              isDrawerOpen ? "text-[#00A3FF]" : "text-[#8892b0]"
            )}
          >
            <Menu className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-medium">Menu</span>
          </button>
        </div>
      </nav>

      {/* Full Screen Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsDrawerOpen(false)}
          />
          
          {/* Drawer Panel - Slides up from bottom */}
          <div className="absolute inset-x-0 bottom-0 top-16 bg-[#080820] rounded-t-2xl animate-in slide-in-from-bottom duration-300">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(0,163,255,0.15)]">
              <h2 className="text-lg font-semibold font-[family-name:var(--font-space-grotesk)] text-white">
                Navegacion
              </h2>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-2 rounded-lg text-[#8892b0] hover:text-white hover:bg-[rgba(0,163,255,0.1)] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Navigation Items */}
            <div className="overflow-y-auto h-full pb-20">
              <nav className="p-4 space-y-1">
                {allItems.map((item) => {
                  const isActive = pathname === item.href
                  const Icon = item.icon

                  return (
                    <Link 
                      key={item.href} 
                      href={item.href}
                      onClick={() => setIsDrawerOpen(false)}
                    >
                      <div className={cn(
                        "flex items-center justify-between px-4 py-3.5 rounded-xl transition-all min-h-[52px]",
                        isActive
                          ? "bg-gradient-to-r from-[rgba(0,163,255,0.2)] to-transparent text-white"
                          : "text-[#8892b0] active:bg-[rgba(0,163,255,0.1)]"
                      )}>
                        <div className="flex items-center gap-4">
                          <Icon className={cn(
                            "w-5 h-5",
                            isActive && "text-[#00A3FF]"
                          )} />
                          <span className="text-base font-medium">{item.label}</span>
                        </div>
                        <ChevronRight className={cn(
                          "w-4 h-4",
                          isActive ? "text-[#00A3FF]" : "text-[#8892b0]/50"
                        )} />
                      </div>
                    </Link>
                  )
                })}
              </nav>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
