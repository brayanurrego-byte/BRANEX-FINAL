"use client"

import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  z: number
  vx: number
  vy: number
  pulsePhase: number
  connections: number[]
}

export function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number
    let particles: Particle[] = []
    let time = 0
    const isMobile = window.innerWidth < 768
    const particleCount = isMobile ? 50 : 150
    const connectionDistance = isMobile ? 150 : 220
    const mouseInfluence = 150

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    const initParticles = () => {
      particles = []
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          z: Math.random() * 1000,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          pulsePhase: Math.random() * Math.PI * 2,
          connections: []
        })
      }
    }

    const animate = () => {
      time += 0.016
      
      // Clear with depth fog gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
      gradient.addColorStop(0, 'rgba(3, 3, 12, 0.15)')
      gradient.addColorStop(0.5, 'rgba(5, 8, 25, 0.12)')
      gradient.addColorStop(1, 'rgba(8, 12, 35, 0.1)')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw depth fog layers
      for (let layer = 0; layer < 3; layer++) {
        const fogY = canvas.height * (0.4 + layer * 0.2)
        const fogGradient = ctx.createRadialGradient(
          canvas.width / 2, fogY, 0,
          canvas.width / 2, fogY, canvas.width * 0.8
        )
        fogGradient.addColorStop(0, `rgba(0, 80, 180, ${0.015 - layer * 0.004})`)
        fogGradient.addColorStop(0.5, `rgba(0, 40, 120, ${0.008 - layer * 0.002})`)
        fogGradient.addColorStop(1, 'rgba(0, 20, 60, 0)')
        ctx.fillStyle = fogGradient
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }

      // Sort particles by z for depth rendering
      const sortedParticles = [...particles].sort((a, b) => b.z - a.z)

      // Draw connections first (behind particles)
      sortedParticles.forEach((particle, i) => {
        const scale = 1 - particle.z / 1000
        const depthFog = Math.pow(scale, 0.5) // Depth fog factor
        
        for (let j = i + 1; j < sortedParticles.length; j++) {
          const other = sortedParticles[j]
          const cdx = particle.x - other.x
          const cdy = particle.y - other.y
          const cdist = Math.sqrt(cdx * cdx + cdy * cdy)

          if (cdist < connectionDistance) {
            const otherScale = 1 - other.z / 1000
            const avgDepth = (depthFog + Math.pow(otherScale, 0.5)) / 2
            const lineAlpha = (1 - cdist / connectionDistance) * 0.35 * avgDepth
            
            // Create gradient line for connections
            const lineGradient = ctx.createLinearGradient(
              particle.x, particle.y, other.x, other.y
            )
            lineGradient.addColorStop(0, `rgba(0, 150, 255, ${lineAlpha})`)
            lineGradient.addColorStop(0.5, `rgba(0, 200, 255, ${lineAlpha * 1.2})`)
            lineGradient.addColorStop(1, `rgba(0, 150, 255, ${lineAlpha})`)
            
            ctx.beginPath()
            ctx.moveTo(particle.x, particle.y)
            ctx.lineTo(other.x, other.y)
            ctx.strokeStyle = lineGradient
            ctx.lineWidth = 1 + avgDepth * 0.8
            ctx.stroke()
          }
        }
      })

      // Update and draw particles
      particles.forEach((particle) => {
        // Mouse influence
        const dx = mouseRef.current.x - particle.x
        const dy = mouseRef.current.y - particle.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        
        if (dist < mouseInfluence) {
          const force = (mouseInfluence - dist) / mouseInfluence * 0.03
          particle.vx += dx * force * 0.015
          particle.vy += dy * force * 0.015
        }

        // Update position
        particle.x += particle.vx
        particle.y += particle.vy
        particle.z += 0.3

        // Damping
        particle.vx *= 0.985
        particle.vy *= 0.985

        // Wrap around
        if (particle.x < -50) particle.x = canvas.width + 50
        if (particle.x > canvas.width + 50) particle.x = -50
        if (particle.y < -50) particle.y = canvas.height + 50
        if (particle.y > canvas.height + 50) particle.y = -50
        if (particle.z > 1000) particle.z = 0

        // Calculate size based on z (depth) - LARGER particles
        const scale = 1 - particle.z / 1000
        const depthFog = Math.pow(scale, 0.6)
        const pulseIntensity = 0.3 + Math.sin(time * 2 + particle.pulsePhase) * 0.15
        const baseSize = 4 + scale * 6 // Larger base size
        const size = baseSize * (1 + pulseIntensity * 0.3)

        // Draw outer glow (fewer layers on mobile)
        const glowLayers = isMobile ? 2 : 4
        for (let g = glowLayers; g >= 0; g--) {
          const glowSize = size * (1 + g * 0.8)
          const glowAlpha = (0.15 - g * 0.03) * depthFog * pulseIntensity
          
          const glowGradient = ctx.createRadialGradient(
            particle.x, particle.y, 0,
            particle.x, particle.y, glowSize
          )
          glowGradient.addColorStop(0, `rgba(0, 180, 255, ${glowAlpha * 2})`)
          glowGradient.addColorStop(0.3, `rgba(0, 140, 255, ${glowAlpha})`)
          glowGradient.addColorStop(0.7, `rgba(0, 100, 255, ${glowAlpha * 0.5})`)
          glowGradient.addColorStop(1, 'rgba(0, 60, 200, 0)')
          
          ctx.beginPath()
          ctx.arc(particle.x, particle.y, glowSize, 0, Math.PI * 2)
          ctx.fillStyle = glowGradient
          ctx.fill()
        }

        // Draw core particle with bright blue glow
        const coreAlpha = (0.7 + scale * 0.3) * depthFog
        const coreGradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, size
        )
        coreGradient.addColorStop(0, `rgba(200, 240, 255, ${coreAlpha})`)
        coreGradient.addColorStop(0.3, `rgba(80, 200, 255, ${coreAlpha * 0.9})`)
        coreGradient.addColorStop(0.7, `rgba(0, 150, 255, ${coreAlpha * 0.6})`)
        coreGradient.addColorStop(1, `rgba(0, 100, 255, ${coreAlpha * 0.2})`)
        
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2)
        ctx.fillStyle = coreGradient
        ctx.fill()

        // Bright center point
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, size * 0.3, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${coreAlpha * 0.8})`
        ctx.fill()
      })

      // Draw enhanced grid floor with depth fog (desktop only)
      if (!isMobile) {
      ctx.save()
      const gridLines = 30
      const gridSpacing = canvas.width / gridLines
      const horizon = canvas.height * 0.65

      // Horizontal depth fog overlay
      const horizonFog = ctx.createLinearGradient(0, horizon, 0, canvas.height)
      horizonFog.addColorStop(0, 'rgba(0, 40, 100, 0.1)')
      horizonFog.addColorStop(0.5, 'rgba(0, 30, 80, 0.05)')
      horizonFog.addColorStop(1, 'rgba(0, 20, 60, 0)')
      ctx.fillStyle = horizonFog
      ctx.fillRect(0, horizon, canvas.width, canvas.height - horizon)

      // Vertical perspective lines
      for (let i = 0; i <= gridLines; i++) {
        const x = i * gridSpacing
        const centerDist = Math.abs(i - gridLines / 2) / (gridLines / 2)
        const alpha = 0.08 * (1 - centerDist * 0.7)
        
        ctx.beginPath()
        ctx.moveTo(x, horizon)
        ctx.lineTo(canvas.width / 2 + (x - canvas.width / 2) * 0.05, canvas.height)
        const lineGrad = ctx.createLinearGradient(x, horizon, canvas.width / 2 + (x - canvas.width / 2) * 0.05, canvas.height)
        lineGrad.addColorStop(0, `rgba(0, 150, 255, ${alpha})`)
        lineGrad.addColorStop(1, `rgba(0, 80, 200, ${alpha * 0.3})`)
        ctx.strokeStyle = lineGrad
        ctx.lineWidth = 1
        ctx.stroke()
      }

      // Horizontal lines with depth fade
      for (let i = 0; i < 15; i++) {
        const progress = i / 15
        const y = horizon + (canvas.height - horizon) * progress
        const alpha = 0.06 * (1 - progress)
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.width, y)
        ctx.strokeStyle = `rgba(0, 140, 255, ${alpha})`
        ctx.lineWidth = 1.5 - progress
        ctx.stroke()
      }
      ctx.restore()
      } // end grid floor (desktop only)

      animationId = requestAnimationFrame(animate)
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }

    resize()
    initParticles()
    animate()

    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', handleMouseMove)

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ background: 'linear-gradient(180deg, #020208 0%, #050515 30%, #080825 60%, #0a0a30 100%)' }}
    />
  )
}
