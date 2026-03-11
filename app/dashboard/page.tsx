"use client"


import { DollarSign, TrendingUp, BarChart3, Activity, Briefcase, Plus, ArrowRight, PieChart, History, Lightbulb } from 'lucide-react'
import Link from 'next/link'
import { KPICard } from '@/components/branex/kpi-card'
import { PerformanceChart } from '@/components/branex/performance-chart'
import { AllocationChart } from '@/components/branex/allocation-chart'
import { HoldingsTable } from '@/components/branex/holdings-table'
import { ProtectedRoute } from '@/components/branex/protected-route'
import { useBranex } from '@/components/branex/branex-provider'
import { Button } from '@/components/ui/button'
import { formatDollar, formatPercent } from '@/lib/utils'

// Empty state onboarding component
function OnboardingCard() {
  return (
    <div className="glass-card p-8 lg:p-12 animate-fade-slide-up">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#00A3FF]/20 to-[#0066FF]/20 border border-[#00A3FF]/30 mb-6">
          <Lightbulb className="w-10 h-10 text-[#00A3FF]" />
        </div>
        <h2 className="text-3xl font-bold font-[family-name:var(--font-space-grotesk)] text-white mb-3">
          Bienvenido a BRANEX
        </h2>
        <p className="text-[#8892b0] max-w-lg mx-auto">
          Tu plataforma de gestión de portafolio de inversiones. Comienza agregando tus posiciones para ver tu dashboard en acción.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="relative group">
          <div className="absolute -inset-px bg-gradient-to-r from-[#00A3FF] to-[#0066FF] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity blur" />
          <div className="relative glass-card-interactive p-6 h-full">
            <div className="w-12 h-12 rounded-lg bg-[#00A3FF]/10 flex items-center justify-center mb-4">
              <span className="text-2xl font-bold text-[#00A3FF]">1</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Agrega tus posiciones</h3>
            <p className="text-sm text-[#8892b0] mb-4">
              Ve a Portafolio y registra tus acciones, ETFs o fondos con su precio de compra.
            </p>
            <Link href="/portafolio">
              <Button className="w-full bg-[#00A3FF]/10 hover:bg-[#00A3FF]/20 text-[#00A3FF] border border-[#00A3FF]/30">
                <Plus className="w-4 h-4 mr-2" />
                Ir a Portafolio
              </Button>
            </Link>
          </div>
        </div>

        <div className="relative group">
          <div className="absolute -inset-px bg-gradient-to-r from-[#7B61FF] to-[#5B41DF] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity blur" />
          <div className="relative glass-card-interactive p-6 h-full">
            <div className="w-12 h-12 rounded-lg bg-[#7B61FF]/10 flex items-center justify-center mb-4">
              <span className="text-2xl font-bold text-[#7B61FF]">2</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Registra transacciones</h3>
            <p className="text-sm text-[#8892b0] mb-4">
              Añade compras, ventas y dividendos en Historial para un seguimiento completo.
            </p>
            <Link href="/historial">
              <Button className="w-full bg-[#7B61FF]/10 hover:bg-[#7B61FF]/20 text-[#7B61FF] border border-[#7B61FF]/30">
                <History className="w-4 h-4 mr-2" />
                Ir a Historial
              </Button>
            </Link>
          </div>
        </div>

        <div className="relative group">
          <div className="absolute -inset-px bg-gradient-to-r from-[#00FF88] to-[#00CC6A] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity blur" />
          <div className="relative glass-card-interactive p-6 h-full">
            <div className="w-12 h-12 rounded-lg bg-[#00FF88]/10 flex items-center justify-center mb-4">
              <span className="text-2xl font-bold text-[#00FF88]">3</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Tu dashboard se llena</h3>
            <p className="text-sm text-[#8892b0] mb-4">
              Automáticamente verás tus KPIs, gráficas de rendimiento y asignación por sector.
            </p>
            <Button disabled className="w-full bg-[#00FF88]/10 text-[#00FF88]/50 border border-[#00FF88]/20 cursor-not-allowed">
              <PieChart className="w-4 h-4 mr-2" />
              Se activa automáticamente
            </Button>
          </div>
        </div>
      </div>

      <div className="text-center">
        <Link href="/portafolio">
          <Button className="bg-gradient-to-r from-[#00A3FF] to-[#0066FF] hover:opacity-90 text-white px-8 py-3 h-auto text-lg">
            Comenzar ahora
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  )
}

// Empty state KPI card
function EmptyKPICard({ 
  title, 
  icon, 
  iconGradient, 
  delay 
}: { 
  title: string
  icon: React.ReactNode
  iconGradient: string
  delay: number
}) {
  return (
    <div 
      className="glass-card p-5 animate-fade-slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${iconGradient} flex items-center justify-center shadow-lg`}>
          {icon}
        </div>
      </div>
      <p className="text-sm text-[#8892b0] mb-1">{title}</p>
      <p className="text-2xl font-bold font-mono text-white/50">—</p>
      <p className="text-xs text-[#8892b0]/70 mt-1">Sin datos</p>
    </div>
  )
}

export default function DashboardPage() {
  const { metrics, profile, holdings } = useBranex()
  const hasData = holdings.length > 0

  // Calculate diversification badge
  const divLabel = metrics.diversificationScore >= 75 ? 'Excelente' : metrics.diversificationScore >= 50 ? 'Buena' : metrics.diversificationScore >= 25 ? 'Moderada' : 'Baja'

  return (
    <ProtectedRoute>
        <div className="p-4 md:p-6 lg:p-8">
          {/* Page Header */}
          <div className="mb-6 md:mb-8 animate-fade-slide-up">
            <h1 className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-space-grotesk)] text-white mb-2">
              Panel de Control
            </h1>
            <p className="text-sm md:text-base text-[#8892b0]">
              {hasData 
                ? `Bienvenido de nuevo, ${profile.name.split(' ')[0]}. Aqui tienes el resumen de tu portafolio.`
                : 'Comienza agregando posiciones para ver tu dashboard completo.'
              }
            </p>
          </div>

          {/* Empty State - Show Onboarding */}
          {!hasData && <OnboardingCard />}

          {/* KPI Cards - Show empty or with data */}
          {hasData ? (
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4 mb-6 md:mb-8">
              <KPICard
                title="Valor Total del Portafolio"
                value={`$${formatDollar(metrics.totalValue)}`}
                rawValue={metrics.totalValue}
                changePercent={formatPercent(metrics.totalReturnPercent)}
                change="retorno total"
                isPositive={metrics.totalReturnPercent >= 0}
                icon={<DollarSign className="w-5 h-5 text-white" />}
                iconGradient="from-[#00A3FF] to-[#0066FF]"
                delay={0}
              />
              <KPICard
                title="P&L Total"
                value={`$${formatDollar(metrics.totalPnL)}`}
                rawValue={metrics.totalPnL}
                changePercent={formatPercent(metrics.totalReturnPercent)}
                change="vs. invertido"
                isPositive={metrics.totalPnL >= 0}
                icon={<TrendingUp className="w-5 h-5 text-white" />}
                iconGradient={metrics.totalPnL >= 0 ? "from-[#00FF88] to-[#00CC6A]" : "from-[#FF3366] to-[#CC2952]"}
                delay={100}
              />
              <KPICard
                title="Capital Invertido"
                value={`$${formatDollar(metrics.totalInvested)}`}
                rawValue={metrics.totalInvested}
                change="coste base"
                isPositive
                icon={<BarChart3 className="w-5 h-5 text-white" />}
                iconGradient="from-[#7B61FF] to-[#5B41DF]"
                delay={200}
              />
              <KPICard
                title="Diversificación"
                value={`${metrics.diversificationScore}%`}
                rawValue={metrics.diversificationScore}
                badge={divLabel}
                isPositive={metrics.diversificationScore >= 50}
                icon={<Activity className="w-5 h-5 text-white" />}
                iconGradient="from-[#00D4FF] to-[#00A3FF]"
                delay={300}
              />
              <KPICard
                title="Posiciones Activas"
                value={metrics.activePositions.toString()}
                rawValue={metrics.activePositions}
                change={`en ${metrics.sectorAllocation.length} sectores`}
                isPositive
                icon={<Briefcase className="w-5 h-5 text-white" />}
                iconGradient="from-[#FFB800] to-[#FF8C00]"
                delay={400}
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4 mb-6 md:mb-8 mt-6 md:mt-8">
              <EmptyKPICard
                title="Valor Total del Portafolio"
                icon={<DollarSign className="w-5 h-5 text-white" />}
                iconGradient="from-[#00A3FF] to-[#0066FF]"
                delay={0}
              />
              <EmptyKPICard
                title="P&L Total"
                icon={<TrendingUp className="w-5 h-5 text-white" />}
                iconGradient="from-[#00FF88] to-[#00CC6A]"
                delay={100}
              />
              <EmptyKPICard
                title="Capital Invertido"
                icon={<BarChart3 className="w-5 h-5 text-white" />}
                iconGradient="from-[#7B61FF] to-[#5B41DF]"
                delay={200}
              />
              <EmptyKPICard
                title="Diversificación"
                icon={<Activity className="w-5 h-5 text-white" />}
                iconGradient="from-[#00D4FF] to-[#00A3FF]"
                delay={300}
              />
              <EmptyKPICard
                title="Posiciones Activas"
                icon={<Briefcase className="w-5 h-5 text-white" />}
                iconGradient="from-[#FFB800] to-[#FF8C00]"
                delay={400}
              />
            </div>
          )}

          {/* Charts Row - Only show if we have data */}
          {hasData && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
              <div className="lg:col-span-2">
                <PerformanceChart />
              </div>
              <div className="lg:col-span-1">
                <AllocationChart />
              </div>
            </div>
          )}

          {/* Holdings Table - Only show if we have data */}
          {hasData && <HoldingsTable />}
        </div>
    </ProtectedRoute>
  )
}
