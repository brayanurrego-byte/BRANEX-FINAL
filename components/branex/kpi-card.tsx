"use client"

import { useEffect, useState, useRef } from 'react'
import { cn, parseDecimal, formatDollar } from '@/lib/utils'

interface KPICardProps {
  title: string
  value: string
  rawValue?: number // Raw numeric value for animation (avoids locale parsing bugs)
  change?: string
  changePercent?: string
  isPositive?: boolean
  icon: React.ReactNode
  iconGradient?: string
  badge?: string
  delay?: number
}

function useCountUp(end: number, duration: number = 1500, delay: number = 0) {
  const [count, setCount] = useState(0)
  const countRef = useRef(0)

  useEffect(() => {
    const timeout = setTimeout(() => {
      const startTime = Date.now()
      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        // Easing function
        const easeOut = 1 - Math.pow(1 - progress, 3)
        countRef.current = end * easeOut
        setCount(countRef.current)
        
        if (progress < 1) {
          requestAnimationFrame(animate)
        }
      }
      requestAnimationFrame(animate)
    }, delay)

    return () => clearTimeout(timeout)
  }, [end, duration, delay])

  return count
}

export function KPICard({
  title,
  value,
  rawValue,
  change,
  changePercent,
  isPositive = true,
  icon,
  iconGradient = 'from-[#00A3FF] to-[#0066FF]',
  badge,
  delay = 0
}: KPICardProps) {
  const [isVisible, setIsVisible] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (cardRef.current) {
      observer.observe(cardRef.current)
    }

    return () => observer.disconnect()
  }, [])

  // Parse numeric value for animation
  // Use rawValue if provided (most reliable), fall back to parseDecimal for string values
  const numericValue = rawValue !== undefined 
    ? rawValue 
    : parseDecimal(value)
  const animatedValue = useCountUp(isVisible ? numericValue : 0, 1500, delay)
  
  // Format value using es-ES locale with 2 decimal places for dollar values
  const formatValue = (num: number) => {
    if (value.includes('$')) {
      return `$${formatDollar(num)}`
    }
    if (value.includes('%')) {
      return `${num.toFixed(2)}%`
    }
    // For other numeric values (like Diversification Score), use 2 decimal places
    return num.toFixed(2)
  }

  return (
    <div
      ref={cardRef}
      className={cn(
        "glass-card p-3 md:p-5 transition-all duration-500",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between mb-2 md:mb-4">
        <div className={cn(
          "w-8 h-8 md:w-10 md:h-10 rounded-lg bg-gradient-to-br flex items-center justify-center [&>svg]:w-4 [&>svg]:h-4 md:[&>svg]:w-5 md:[&>svg]:h-5",
          iconGradient
        )}>
          {icon}
        </div>
        {badge && (
          <span className="px-1.5 md:px-2 py-0.5 md:py-1 text-[10px] md:text-xs font-medium rounded-full bg-[rgba(0,163,255,0.1)] text-[#00A3FF] border border-[rgba(0,163,255,0.2)]">
            {badge}
          </span>
        )}
      </div>

      <p className="text-xs md:text-sm text-[#8892b0] mb-1 truncate">{title}</p>
      
      <div className="flex items-baseline gap-2 mb-1 md:mb-2">
        <span className="text-lg md:text-2xl font-bold font-[family-name:var(--font-jetbrains-mono)] text-white truncate">
          {formatValue(animatedValue)}
        </span>
      </div>

      {(change || changePercent) && (
        <div className="flex items-center gap-1 md:gap-2 flex-wrap">
          {changePercent && (
            <span className={cn(
              "text-xs md:text-sm font-medium font-[family-name:var(--font-jetbrains-mono)]",
              isPositive ? "text-[#00FF88]" : "text-[#FF3366]"
            )}>
              {isPositive ? '+' : ''}{changePercent}
            </span>
          )}
          {change && (
            <span className="text-[10px] md:text-xs text-[#8892b0] hidden sm:inline">{change}</span>
          )}
        </div>
      )}
    </div>
  )
}
