"use client"

import { useEffect, useRef } from "react"

/* ============================================================
   EnergyField — hover-gated route travelers.

   A second, transparent, full-viewport canvas mounted beside
   ParticleField. It reads `hoverSide` and, ONLY while a side is
   hovered (or fading out), runs a capped rAF loop that sends
   "travelers" along predefined normalized poly-line routes:

   - nerdy   → green data-packets node→node, with thin pulsing
               connector lines (constellation + a river diagonal).
   - creative→ pink / lavender / gold petals & pollen drifting
               upward and along a branch curve (bloom feel).

   Idle (`hoverSide === null`): once travelers finish fading the
   rAF loop STOPS entirely → zero idle cost. Reduced-motion or a
   coarse pointer disables it completely (no-op).
   ============================================================ */

type Side = "nerdy" | "creative" | null

// Normalized routes (0..1 of viewport). Travelers walk node→node.
const NERDY_ROUTES: Array<Array<[number, number]>> = [
  // constellation near the nerdy card (lower-left choice grid)
  [
    [0.16, 0.62],
    [0.26, 0.56],
    [0.34, 0.64],
    [0.29, 0.74],
    [0.18, 0.72],
    [0.16, 0.62],
  ],
  // a diagonal "data stream" down the river
  [
    [0.62, 0.12],
    [0.5, 0.32],
    [0.4, 0.52],
    [0.3, 0.74],
    [0.22, 0.92],
  ],
]

// Pink side: petal/pollen drift routes (rise + sway along a branch curve).
const CREATIVE_ROUTES: Array<Array<[number, number]>> = [
  [
    [0.78, 0.5],
    [0.7, 0.4],
    [0.66, 0.28],
    [0.72, 0.16],
    [0.82, 0.08],
  ],
  [
    [0.5, 0.62],
    [0.46, 0.48],
    [0.52, 0.34],
    [0.46, 0.2],
    [0.5, 0.06],
  ],
]

const NERDY_COLOR = "127, 176, 127" // terminal green
const CREATIVE_COLORS = [
  "240, 198, 207", // sakura pink
  "200, 170, 230", // lavender
  "230, 199, 154", // gold
]

interface Traveler {
  route: number
  seg: number // current segment index along the route
  t: number // 0..1 progress along current segment
  speed: number // segments-per-second-ish
  size: number
  colorIdx: number // index into CREATIVE_COLORS (creative only)
  life: number // 0..1 fade-in/out envelope
  dir: number // +1 forward
  sway: number // phase for lateral drift (creative)
  swayAmp: number
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

export function EnergyField({ hoverSide }: { hoverSide: Side }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  // Latest hoverSide kept in a ref so the rAF loop reads it without re-subscribing.
  const sideRef = useRef<Side>(hoverSide)

  useEffect(() => {
    sideRef.current = hoverSide
  }, [hoverSide])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Hard gates: reduced motion or coarse pointer → permanent no-op.
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const coarsePointer = window.matchMedia("(pointer: coarse)").matches
    if (prefersReduced || coarsePointer) return

    const ctx = canvas.getContext("2d", { alpha: true })
    if (!ctx) return

    let dpr = Math.min(window.devicePixelRatio || 1, 2)
    let w = window.innerWidth
    let h = window.innerHeight

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener("resize", resize)

    const travelers: Traveler[] = []
    let running = false
    let rafId = 0
    let last = 0
    // Master energy envelope (0 idle → 1 fully awake), eases between states.
    let energy = 0

    const FRAME_MS = 1000 / 45

    const routesFor = (side: Side) =>
      side === "nerdy" ? NERDY_ROUTES : side === "creative" ? CREATIVE_ROUTES : []

    const capFor = (side: Side) => (side === "nerdy" ? 24 : side === "creative" ? 32 : 0)

    const spawn = (side: Side) => {
      const routes = routesFor(side)
      if (routes.length === 0) return
      const route = Math.floor(Math.random() * routes.length)
      travelers.push({
        route,
        seg: 0,
        t: Math.random() * 0.4,
        speed: side === "nerdy" ? 0.55 + Math.random() * 0.5 : 0.28 + Math.random() * 0.3,
        size: side === "nerdy" ? 1.3 + Math.random() * 1.4 : 2 + Math.random() * 2.6,
        colorIdx: Math.floor(Math.random() * CREATIVE_COLORS.length),
        life: 0,
        dir: 1,
        sway: Math.random() * Math.PI * 2,
        swayAmp: side === "creative" ? 6 + Math.random() * 14 : 0,
      })
    }

    const drawConnectors = (routes: Array<Array<[number, number]>>, pulse: number) => {
      ctx.lineWidth = 1
      for (const route of routes) {
        ctx.beginPath()
        for (let i = 0; i < route.length; i++) {
          const [nx, ny] = route[i]
          const px = nx * w
          const py = ny * h
          if (i === 0) ctx.moveTo(px, py)
          else ctx.lineTo(px, py)
        }
        ctx.strokeStyle = `rgba(${NERDY_COLOR}, ${0.05 + pulse * 0.08})`
        ctx.stroke()

        // nodes
        for (const [nx, ny] of route) {
          ctx.beginPath()
          ctx.arc(nx * w, ny * h, 1.6 + pulse * 1.4, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(${NERDY_COLOR}, ${0.18 + pulse * 0.22})`
          ctx.fill()
        }
      }
    }

    const render = (now: number) => {
      if (!running) return
      rafId = requestAnimationFrame(render)
      if (now - last < FRAME_MS) return
      const dt = Math.min((now - last) / 1000, 0.05) || 0.016
      last = now

      const side = sideRef.current
      const routes = routesFor(side)
      const cap = capFor(side)

      // Ease the master energy envelope toward 1 (hovered) or 0 (idle).
      const targetEnergy = side ? 1 : 0
      energy += (targetEnergy - energy) * Math.min(1, dt * 4)

      // Spawn up to cap while hovered.
      if (side && travelers.length < cap && Math.random() < 0.6) {
        spawn(side)
      }

      ctx.clearRect(0, 0, w, h)

      // Pulsing connector lattice (nerdy only) scaled by energy.
      if (side === "nerdy" && energy > 0.02) {
        const pulse = (Math.sin(now / 380) * 0.5 + 0.5) * energy
        ctx.save()
        ctx.globalCompositeOperation = "lighter"
        drawConnectors(NERDY_ROUTES, pulse)
        ctx.restore()
      }

      ctx.save()
      ctx.globalCompositeOperation = "lighter"

      for (let i = travelers.length - 1; i >= 0; i--) {
        const tr = travelers[i]
        // While the matching side is active, life rises; otherwise it fades.
        const matchActive = side !== null
        tr.life += (matchActive ? 1 : -1) * dt * (matchActive ? 1.6 : 1.1)
        tr.life = Math.max(0, Math.min(1, tr.life))

        // Advance along the route.
        const route = (side ? routes : tr.route < CREATIVE_ROUTES.length ? CREATIVE_ROUTES : NERDY_ROUTES)[tr.route]
        // Guard: route may not exist if side cleared mid-flight; fade & drift in place.
        if (route) {
          tr.t += tr.speed * dt
          while (tr.t >= 1) {
            tr.t -= 1
            tr.seg += 1
            if (tr.seg >= route.length - 1) tr.seg = 0
          }
          const a = route[tr.seg]
          const b = route[(tr.seg + 1) % route.length]
          let x = lerp(a[0], b[0], tr.t) * w
          let y = lerp(a[1], b[1], tr.t) * h

          // lateral sway for petals (creative)
          if (tr.swayAmp) {
            tr.sway += dt * 1.4
            x += Math.sin(tr.sway) * tr.swayAmp
          }

          const isGreen = side === "nerdy" || (side === null && tr.swayAmp === 0)
          const color = isGreen ? NERDY_COLOR : CREATIVE_COLORS[tr.colorIdx]
          const alpha = tr.life * 0.85 * Math.max(energy, tr.life * 0.4)

          // glow halo
          ctx.beginPath()
          ctx.arc(x, y, tr.size * 3, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(${color}, ${alpha * 0.18})`
          ctx.fill()
          // core
          ctx.beginPath()
          ctx.arc(x, y, tr.size, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(${color}, ${alpha})`
          ctx.fill()
        } else {
          tr.life -= dt * 1.4
        }

        // Cull fully-faded travelers when idle.
        if (!matchActive && tr.life <= 0.001) {
          travelers.splice(i, 1)
        }
      }

      ctx.restore()

      // Stop the loop entirely once idle AND nothing left to fade → zero idle cost.
      if (!side && travelers.length === 0 && energy < 0.01) {
        stop()
        ctx.clearRect(0, 0, w, h)
      }
    }

    const start = () => {
      if (running || document.hidden) return
      running = true
      last = 0
      rafId = requestAnimationFrame(render)
    }
    const stop = () => {
      running = false
      cancelAnimationFrame(rafId)
    }

    // Kick the loop whenever a side becomes active. We poll the ref via a tiny
    // observer effect below; here we expose start through a custom event.
    const onWake = () => start()
    window.addEventListener("energyfield:wake", onWake)

    const handleVisibility = () => {
      if (document.hidden) stop()
      else if (sideRef.current) start()
    }
    document.addEventListener("visibilitychange", handleVisibility)

    // Expose a starter on the canvas node so the prop-effect can trigger it.
    ;(canvas as any).__startEnergy = start

    return () => {
      window.removeEventListener("resize", resize)
      window.removeEventListener("energyfield:wake", onWake)
      document.removeEventListener("visibilitychange", handleVisibility)
      stop()
    }
  }, [])

  // When hoverSide transitions to a non-null value, wake the loop.
  useEffect(() => {
    if (!hoverSide) return
    const canvas = canvasRef.current as any
    if (canvas && typeof canvas.__startEnergy === "function") {
      canvas.__startEnergy()
    } else {
      window.dispatchEvent(new Event("energyfield:wake"))
    }
  }, [hoverSide])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[1] h-full w-full"
      aria-hidden="true"
    />
  )
}
