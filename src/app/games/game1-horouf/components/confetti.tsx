'use client'

import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  rotation: number
  rotationSpeed: number
  shape: 'square' | 'circle'
  alpha: number
  life: number
  maxLife: number
}

interface ConfettiProps {
  team1Color: string
  team2Color: string
}

export default function Confetti({ team1Color, team2Color }: ConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const colors = [team1Color, team2Color, '#E8A838', '#F0F0F5']
    const particles: Particle[] = []

    for (let i = 0; i < 100; i++) {
      const maxLife = 3000 + Math.random() * 1000
      particles.push({
        x: Math.random() * canvas.width,
        y: -10 - Math.random() * 100,
        vx: (Math.random() - 0.5) * 4,
        vy: 2 + Math.random() * 3,
        size: 4 + Math.random() * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
        shape: Math.random() > 0.5 ? 'square' : 'circle',
        alpha: 1,
        life: 0,
        maxLife,
      })
    }

    let animFrame: number
    let lastTime = performance.now()

    function animate(time: number): void {
      const dt = time - lastTime
      lastTime = time
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height)

      let alive = false
      for (const p of particles) {
        p.life += dt
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.05
        p.vx += Math.sin(p.life * 0.002) * 0.05
        p.rotation += p.rotationSpeed
        p.alpha = Math.max(0, 1 - p.life / p.maxLife)

        if (p.alpha > 0) {
          alive = true
          ctx!.save()
          ctx!.globalAlpha = p.alpha
          ctx!.fillStyle = p.color
          ctx!.translate(p.x, p.y)
          ctx!.rotate(p.rotation)
          if (p.shape === 'circle') {
            ctx!.beginPath()
            ctx!.arc(0, 0, p.size / 2, 0, Math.PI * 2)
            ctx!.fill()
          } else {
            ctx!.fillRect(-p.size / 2, -p.size / 2, p.size, p.size)
          }
          ctx!.restore()
        }
      }

      if (alive) {
        animFrame = requestAnimationFrame(animate)
      }
    }

    animFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animFrame)
  }, [team1Color, team2Color])

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-50" />
}
