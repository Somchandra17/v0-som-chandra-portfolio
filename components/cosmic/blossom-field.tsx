"use client"

import { useEffect, useRef } from "react"
import { useReducedMotion } from "framer-motion"

type Side = "nerdy" | "creative" | null

// Soft luminous motes — pink sakura petals on the creative side, green leaves on the nerdy side.
// Hover-gated: the loop only runs while a side is hovered (plus a short fade-out), so idle cost is zero.
const COLORS: Record<"nerdy" | "creative", string[]> = {
  creative: ["244,200,214", "248,180,205", "205,175,235", "232,201,156"],
  nerdy: ["159,232,112", "127,176,127", "183,226,140"],
}

// Petals are rounder; leaves are more elongated.
const FLATTEN: Record<"nerdy" | "creative", number> = { creative: 0.6, nerdy: 0.4 }
const CAP = 30

interface Mote {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  angle: number
  spin: number
  swaySeed: number
  sway: number
  color: string
  life: number
  fade: number
}

export function BlossomField({ hoverSide, exiting = null }: { hoverSide: Side; exiting?: Side }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sideRef = useRef<Side>(null)
  const exitingRef = useRef<Side>(null)
  const startRef = useRef<() => void>(() => {})
  const burstRef = useRef<(side: "nerdy" | "creative") => void>(() => {})
  const prefersReduced = useReducedMotion()

  useEffect(() => {
    sideRef.current = hoverSide
    if (hoverSide) startRef.current()
  }, [hoverSide])

  // On the 2nd click the chosen side "blooms out" — fire a radial burst, then the route changes.
  useEffect(() => {
    const was = exitingRef.current
    exitingRef.current = exiting
    if (exiting && !was) {
      burstRef.current(exiting)
      startRef.current()
    }
  }, [exiting])

  useEffect(() => {
    if (prefersReduced) return
    if (typeof window === "undefined" || !window.matchMedia("(pointer: fine)").matches) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let w = (canvas.width = window.innerWidth)
    let h = (canvas.height = window.innerHeight)
    const onResize = () => {
      w = canvas.width = window.innerWidth
      h = canvas.height = window.innerHeight
    }
    window.addEventListener("resize", onResize)

    // Pre-rendered soft blob sprite per color (cheap to draw rotated/scaled).
    const sprites = new Map<string, HTMLCanvasElement>()
    const sprite = (color: string) => {
      let s = sprites.get(color)
      if (!s) {
        const R = 24
        s = document.createElement("canvas")
        s.width = s.height = R * 2
        const sc = s.getContext("2d")!
        const g = sc.createRadialGradient(R, R, 0, R, R, R)
        g.addColorStop(0, `rgba(${color},0.95)`)
        g.addColorStop(0.5, `rgba(${color},0.4)`)
        g.addColorStop(1, `rgba(${color},0)`)
        sc.fillStyle = g
        sc.beginPath()
        sc.arc(R, R, R, 0, Math.PI * 2)
        sc.fill()
        sprites.set(color, s)
      }
      return s
    }

    const motes: Mote[] = []
    let running = false
    let rafId = 0
    let lastSpawn = 0
    let last = 0
    let phase = 0
    const FRAME_MS = 1000 / 60

    const spawn = (side: "nerdy" | "creative") => {
      const colors = COLORS[side]
      motes.push({
        x: Math.random() * w,
        y: h * 0.55 + Math.random() * h * 0.5, // start lower, drift up
        vx: (Math.random() - 0.5) * 0.25,
        vy: -(0.25 + Math.random() * 0.5), // rise
        size: 6 + Math.random() * 10,
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.02,
        swaySeed: Math.random() * 6.28,
        sway: 0.3 + Math.random() * 0.6,
        color: colors[(Math.random() * colors.length) | 0],
        life: 0, // ramps 0 -> 1 (fade in), then back to 0
        fade: 0.004 + Math.random() * 0.004,
      })
    }

    // Exit burst: a spray of large motes flying outward from centre (the "bloom out").
    const burst = (side: "nerdy" | "creative") => {
      const colors = COLORS[side]
      const cx = w / 2
      const cy = h * 0.46
      for (let i = 0; i < 30; i++) {
        const ang = Math.random() * Math.PI * 2
        const spd = 1.6 + Math.random() * 4.2
        motes.push({
          x: cx + (Math.random() - 0.5) * w * 0.5,
          y: cy + (Math.random() - 0.5) * h * 0.45,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd - 1.2, // gentle upward lift — petals blooming, not spraying
          size: 16 + Math.random() * 30,
          angle: Math.random() * 6.28,
          spin: (Math.random() - 0.5) * 0.08,
          swaySeed: Math.random() * 6.28,
          sway: 0.4 + Math.random() * 0.5,
          color: colors[(Math.random() * colors.length) | 0],
          life: 1,
          fade: 0.01 + Math.random() * 0.01,
        })
      }
    }
    burstRef.current = burst

    const render = (now: number) => {
      if (!running) return
      rafId = requestAnimationFrame(render)
      if (now - last < FRAME_MS) return
      last = now

      ctx.clearRect(0, 0, w, h)
      const side = sideRef.current
      const exitingNow = exitingRef.current
      phase += 0.02
      const flatten = exitingNow ? 0.85 : side ? FLATTEN[side] : 0.5

      ctx.globalCompositeOperation = "lighter"

      if (!exitingNow && (side === "nerdy" || side === "creative")) {
        if (now - lastSpawn > 70 && motes.length < CAP) {
          spawn(side)
          lastSpawn = now
        }
      }

      for (let i = motes.length - 1; i >= 0; i--) {
        const p = motes[i]
        // Fade in while spawning; ease out near top, when hover ends, or during the exit burst.
        const dying = side === null || p.y < h * 0.08 || !!exitingNow
        p.life += dying ? -p.fade * 3 : p.fade * 2
        if (p.life >= 1) p.life = 1
        if (p.life <= 0) {
          motes.splice(i, 1)
          continue
        }

        if (exitingNow) p.size += 0.45 // gentle bloom outward
        p.x += p.vx + Math.sin(phase + p.swaySeed) * p.sway
        p.y += p.vy
        p.angle += p.spin

        const sp = sprite(p.color)
        const d = p.size * 2
        ctx.globalAlpha = p.life * 0.85
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.angle)
        ctx.scale(1, flatten) // flatten the round sprite into a petal / leaf
        ctx.drawImage(sp, -d / 2, -d / 2, d, d)
        ctx.restore()
      }

      ctx.globalAlpha = 1
      ctx.globalCompositeOperation = "source-over"

      if (side === null && motes.length === 0) {
        running = false
        ctx.clearRect(0, 0, w, h)
      }
    }

    const start = () => {
      if (running) return
      running = true
      last = 0
      lastSpawn = 0
      rafId = requestAnimationFrame(render)
    }
    startRef.current = start
    if (sideRef.current) start()

    return () => {
      window.removeEventListener("resize", onResize)
      running = false
      cancelAnimationFrame(rafId)
    }
  }, [prefersReduced])

  if (prefersReduced) return null

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[1] h-screen w-full"
      aria-hidden="true"
    />
  )
}
