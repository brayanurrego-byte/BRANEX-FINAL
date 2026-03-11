"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useBranex } from './branex-provider'
import { ParticleBackground } from './particle-background'
import { Navbar } from './navbar'
import { Sidebar } from './sidebar'
import { MobileNav } from './mobile-nav'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter()
  const { isLoaded, hasActivePortfolio } = useBranex()

  // Protect route - redirect to portfolio selection if no active portfolio
  useEffect(() => {
    if (isLoaded && !hasActivePortfolio) {
      router.replace('/')
    }
  }, [isLoaded, hasActivePortfolio, router])

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

  // Don't render if no active portfolio (will redirect)
  if (!hasActivePortfolio) {
    return (
      <div className="min-h-screen bg-[#050510] flex items-center justify-center">
        <div className="text-white">Redirigiendo...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#050510] relative">
      <ParticleBackground />
      <Navbar />
      <Sidebar />
      <MobileNav />
      <main className="md:pl-16 lg:pl-56 pt-14 md:pt-16 pb-20 md:pb-0 min-h-screen relative z-10">
        {children}
      </main>
    </div>
  )
}
