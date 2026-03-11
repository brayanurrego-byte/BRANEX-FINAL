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
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const menuItems = [
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

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        // Hidden on mobile, visible on md+
        "hidden md:flex fixed left-0 top-16 bottom-0 z-40 flex-col",
        "bg-[#080820]/80 backdrop-blur-xl border-r border-[rgba(0,163,255,0.15)] transition-all duration-300",
        // On tablet (md), always show icons only. On lg+, respect collapsed state
        "md:w-16 lg:w-56",
        collapsed && "lg:w-16"
      )}
    >
      <div className="flex-1 py-4 overflow-y-auto">
        <nav className="space-y-1 px-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group cursor-pointer",
                    isActive
                      ? "bg-gradient-to-r from-[rgba(0,163,255,0.2)] to-transparent border-l-2 border-[#00A3FF] text-white"
                      : "text-[#8892b0] hover:text-white hover:bg-[rgba(0,163,255,0.1)]",
                    // Center icons when collapsed or on tablet
                    "md:justify-center lg:justify-start",
                    collapsed && "lg:justify-center"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-5 h-5 flex-shrink-0 transition-colors",
                      isActive ? "text-[#00A3FF]" : "group-hover:text-[#00A3FF]"
                    )}
                  />
                  {/* Hide labels on tablet, show on lg unless collapsed */}
                  <span className={cn(
                    "text-sm font-medium truncate",
                    "hidden lg:inline",
                    collapsed && "lg:hidden"
                  )}>
                    {item.label}
                  </span>
                  {isActive && (
                    <div className={cn(
                      "ml-auto w-1.5 h-1.5 rounded-full bg-[#00A3FF]",
                      "hidden lg:block",
                      collapsed && "lg:hidden"
                    )} />
                  )}
                </div>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Collapse Button - Only visible on lg screens */}
      <div className="hidden lg:block p-2 border-t border-[rgba(0,163,255,0.15)]">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "w-full text-[#8892b0] hover:text-white hover:bg-[rgba(0,163,255,0.1)]",
            collapsed ? "justify-center" : "justify-center"
          )}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4 mr-2" />
              <span className="text-xs">Colapsar</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  )
}
