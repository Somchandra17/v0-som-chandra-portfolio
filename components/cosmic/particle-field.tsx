"use client"

import { useEffect, useRef } from "react"
import { useScroll, useTransform, motion, useReducedMotion } from "framer-motion"
import { COSMIC_VOID } from "@/lib/tokens"

export function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const prefersReduced = useReducedMotion()
  const { scrollY } = useScroll()
  const yShift = useTransform(scrollY, (val: number) => (prefersReduced ? 0 : val * -0.2))

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d", { alpha: false })
    if (!ctx) return

    let w = canvas.width = window.innerWidth
    let h = canvas.height = window.innerHeight

    const handleResize = () => {
      w = canvas.width = window.innerWidth
      h = canvas.height = window.innerHeight
    }
    window.addEventListener("resize", handleResize)

    // Fewer stars on phones; the field is purely atmospheric.
    const isMobile = window.matchMedia("(max-width: 767px)").matches
    const maxParticles = isMobile ? 80 : 200
    const particles = Array.from({ length: maxParticles }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.5,
      vx: (Math.random() - 0.5) * 0.05,
      vy: (Math.random() - 0.5) * 0.05 - 0.02, // Slight upward drift
      baseOpacity: Math.random() * 0.5 + 0.1,
      twinkleSpeed: Math.random() * 0.02 + 0.005,
      color: Math.random() > 0.8 ? "240, 198, 207" : "200, 200, 220", // Occasional pink hue
    }))

    const paint = (advance: boolean) => {
      ctx.fillStyle = COSMIC_VOID // Same as bg
      ctx.fillRect(0, 0, w, h)

      const time = Date.now()
      particles.forEach((p, i) => {
        if (advance) {
          p.x += p.vx
          p.y += p.vy
          if (p.x < 0) p.x = w
          if (p.x > w) p.x = 0
          if (p.y < 0) p.y = h
          if (p.y > h) p.y = 0
        }

        const currentOpacity = p.baseOpacity + Math.sin(time * p.twinkleSpeed + i) * 0.2
        const safeOpacity = Math.max(0.05, Math.min(0.8, currentOpacity))

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${p.color}, ${safeOpacity})`
        ctx.fill()
      })
    }

    // Reduced motion: a single static starfield, no animation loop.
    if (prefersReduced) {
      paint(false)
      return () => window.removeEventListener("resize", handleResize)
    }

    // Cap to ~30fps and pause entirely when the tab is hidden.
    const FRAME_MS = 1000 / 30
    let animationFrameId = 0
    let running = false
    let last = 0

    const render = (now: number) => {
      if (!running) return
      animationFrameId = requestAnimationFrame(render)
      if (now - last < FRAME_MS) return
      last = now
      paint(true)
    }

    const start = () => {
      if (running || document.hidden) return
      running = true
      last = 0
      animationFrameId = requestAnimationFrame(render)
    }
    const stop = () => {
      running = false
      cancelAnimationFrame(animationFrameId)
    }

    const handleVisibility = () => {
      if (document.hidden) stop()
      else start()
    }
    document.addEventListener("visibilitychange", handleVisibility)
    start()

    return () => {
      window.removeEventListener("resize", handleResize)
      document.removeEventListener("visibilitychange", handleVisibility)
      stop()
    }
  }, [prefersReduced])

  return (
    <motion.canvas
      ref={canvasRef}
      style={{ y: yShift }}
      className="fixed inset-0 pointer-events-none -z-10 h-[150vh] w-full"
      aria-hidden="true"
    />
  )
}
