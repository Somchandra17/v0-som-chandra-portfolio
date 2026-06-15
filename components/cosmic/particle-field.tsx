"use client"

import { useEffect, useRef } from "react"
import { useReducedMotion } from "framer-motion"

type Props = {
  className?: string
  /** Global multiplier on particle counts (1 = default budget). */
  density?: number
  /** Draw the cursor-reactive constellation layer (hero). Default true. */
  constellations?: boolean
}

const PETAL_COLORS = ["#ffe6f0", "#f0c6cf", "#e89bb6", "#d9779b"]
const DUST_COLORS = ["#f0c6cf", "#8b6fc4", "#e6c79a"]
const LINK_DIST = 150 // px: max distance for a node-to-node line
const CURSOR_DIST = 230 // px: cursor "reach" for live constellation lines

type Star = { x: number; y: number; r: number; a: number; tw: number; ts: number; dx: number }
type Dust = { x: number; y: number; r: number; a: number; vx: number; vy: number; c: string }
type Node = { x: number; y: number; r: number; vx: number; vy: number; tw: number; ts: number }
type Petal = {
  x: number; y: number; s: number; vy: number; rot: number; vr: number
  sway: number; swaySpeed: number; swayAmp: number; a: number; c: string
}

function rand(min: number, max: number) {
  return min + Math.random() * (max - min)
}
function pick<T>(arr: T[]) {
  return arr[(Math.random() * arr.length) | 0]
}

/**
 * Fixed full-viewport ambient canvas: drifting sakura petals, twinkling stars,
 * slow cosmic dust, and a cursor-reactive constellation layer (bright nodes that
 * link to each other and reach toward the pointer). One canvas, one rAF.
 *
 * The constellation lines are the signature motion: the field is alive and
 * responds to the visitor — it does not read as a static starfield in a screenshot.
 *
 * Performance contract:
 *   - DPR capped at 2 (Retina fill-rate guard)
 *   - counts scale with viewport area, reduced on small screens
 *   - paused while the tab is hidden (visibilitychange)
 *   - init deferred to requestIdleCallback so it never blocks first paint / LCP
 *   - prefers-reduced-motion → one static frame, then stop (no loop)
 *   - transform/opacity-equivalent canvas ops only; never touches layout
 */
export function ParticleField({ className, density = 1, constellations = true }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d", { alpha: true })
    if (!ctx) return

    const mqMobile = window.matchMedia("(max-width: 767px)")
    let w = 0
    let h = 0
    let dpr = 1
    let stars: Star[] = []
    let dust: Dust[] = []
    let petals: Petal[] = []
    let nodes: Node[] = []
    let raf = 0
    let last = performance.now()
    let running = false
    // pointer in viewport space; -1 = absent (no lit constellation)
    const pointer = { x: -1, y: -1, active: false }

    const build = () => {
      const area = w * h
      const mobile = mqMobile.matches
      const scale = (mobile ? 0.45 : 1) * density
      const nStars = Math.min(140, Math.round((area / 11000) * scale))
      const nDust = Math.min(180, Math.round((area / 9000) * scale))
      const nPetals = Math.min(34, Math.round((area / 48000) * scale))
      const nNodes = constellations ? Math.min(mobile ? 14 : 30, Math.round((area / 60000) * scale)) : 0

      stars = Array.from({ length: nStars }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: rand(0.4, 1.6),
        a: rand(0.25, 0.9),
        tw: Math.random() * Math.PI * 2,
        ts: rand(0.6, 2.2),
        dx: rand(-3, 3),
      }))
      dust = Array.from({ length: nDust }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: rand(0.5, 1.5),
        a: rand(0.05, 0.26),
        vx: rand(-6, 6),
        vy: rand(-4, 4),
        c: pick(DUST_COLORS),
      }))
      petals = Array.from({ length: nPetals }, () => makePetal(true))
      nodes = Array.from({ length: nNodes }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: rand(1, 2),
        vx: rand(-8, 8),
        vy: rand(-8, 8),
        tw: Math.random() * Math.PI * 2,
        ts: rand(0.5, 1.4),
      }))
    }

    const makePetal = (anywhere: boolean): Petal => ({
      x: Math.random() * w,
      y: anywhere ? Math.random() * h : -20,
      s: rand(5, 12),
      vy: rand(14, 34),
      rot: Math.random() * Math.PI * 2,
      vr: rand(-0.8, 0.8),
      sway: Math.random() * Math.PI * 2,
      swaySpeed: rand(0.4, 1.1),
      swayAmp: rand(12, 34),
      a: rand(0.4, 0.85),
      c: pick(PETAL_COLORS),
    })

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      canvas.style.width = w + "px"
      canvas.style.height = h + "px"
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      build()
    }

    const drawPetal = (p: Petal) => {
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rot)
      ctx.globalAlpha = p.a
      ctx.fillStyle = p.c
      const s = p.s
      ctx.beginPath()
      ctx.moveTo(0, -s)
      ctx.quadraticCurveTo(s * 0.7, -s * 0.25, s * 0.18, s * 0.55)
      ctx.quadraticCurveTo(0, s * 0.35, -s * 0.18, s * 0.55)
      ctx.quadraticCurveTo(-s * 0.7, -s * 0.25, 0, -s)
      ctx.fill()
      ctx.restore()
    }

    // node-to-node + node-to-cursor lines. Lines near the pointer brighten —
    // the constellation "wakes up" around the cursor.
    const drawConstellations = (dt: number) => {
      if (!nodes.length) return
      ctx.lineWidth = 0.7
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i]
        a.x += a.vx * dt
        a.y += a.vy * dt
        a.tw += a.ts * dt
        if (a.x < 0) a.x += w; else if (a.x > w) a.x -= w
        if (a.y < 0) a.y += h; else if (a.y > h) a.y -= h

        // links to other nodes
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const d = Math.hypot(dx, dy)
          if (d > LINK_DIST) continue
          let alpha = (1 - d / LINK_DIST) * 0.14
          if (pointer.active) {
            const mid = Math.hypot((a.x + b.x) / 2 - pointer.x, (a.y + b.y) / 2 - pointer.y)
            if (mid < CURSOR_DIST) alpha += (1 - mid / CURSOR_DIST) * 0.5
          }
          ctx.strokeStyle = `rgba(201, 184, 236, ${alpha.toFixed(3)})`
          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(b.x, b.y)
          ctx.stroke()
        }

        // line + glow toward the cursor
        if (pointer.active) {
          const cd = Math.hypot(a.x - pointer.x, a.y - pointer.y)
          if (cd < CURSOR_DIST) {
            const alpha = (1 - cd / CURSOR_DIST) * 0.6
            ctx.strokeStyle = `rgba(240, 198, 207, ${alpha.toFixed(3)})`
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(pointer.x, pointer.y)
            ctx.stroke()
          }
        }

        // the node itself
        const near = pointer.active ? Math.max(0, 1 - Math.hypot(a.x - pointer.x, a.y - pointer.y) / CURSOR_DIST) : 0
        ctx.globalAlpha = 0.5 + 0.3 * Math.sin(a.tw) + near * 0.5
        ctx.fillStyle = "#f3e6f2"
        ctx.beginPath()
        ctx.arc(a.x, a.y, a.r + near * 1.2, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
    }

    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      ctx.clearRect(0, 0, w, h)

      for (const st of stars) {
        st.tw += st.ts * dt
        st.x += st.dx * dt
        if (st.x < 0) st.x += w
        else if (st.x > w) st.x -= w
        ctx.globalAlpha = st.a * (0.55 + 0.45 * Math.sin(st.tw))
        ctx.fillStyle = st.r > 1.1 ? "#ffe6f0" : st.r > 0.8 ? "#efe6ff" : "#ffffff"
        ctx.beginPath()
        ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2)
        ctx.fill()
      }

      for (const d of dust) {
        d.x += d.vx * dt
        d.y += d.vy * dt
        if (d.x < -5) d.x = w + 5
        else if (d.x > w + 5) d.x = -5
        if (d.y < -5) d.y = h + 5
        else if (d.y > h + 5) d.y = -5
        ctx.globalAlpha = d.a
        ctx.fillStyle = d.c
        ctx.beginPath()
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.globalAlpha = 1
      drawConstellations(dt)

      for (const p of petals) {
        p.y += p.vy * dt
        p.sway += p.swaySpeed * dt
        p.rot += p.vr * dt
        const orig = p.x
        p.x = p.x + Math.sin(p.sway) * p.swayAmp
        drawPetal(p)
        p.x = orig
        if (p.y > h + 24) Object.assign(p, makePetal(false))
      }

      ctx.globalAlpha = 1
      raf = requestAnimationFrame(frame)
    }

    const start = () => {
      if (running) return
      running = true
      last = performance.now()
      raf = requestAnimationFrame(frame)
    }
    const stop = () => {
      running = false
      cancelAnimationFrame(raf)
    }

    const onVisibility = () => {
      if (document.hidden) stop()
      else start()
    }
    const onResize = () => resize()
    const onPointerMove = (e: PointerEvent) => {
      pointer.x = e.clientX
      pointer.y = e.clientY
      pointer.active = true
    }
    const onPointerLeave = () => { pointer.active = false }

    // ----- reduced motion: paint a single calm frame, no animation loop -----
    if (reduced) {
      resize()
      ctx.clearRect(0, 0, w, h)
      for (const st of stars) {
        ctx.globalAlpha = st.a
        ctx.fillStyle = st.r > 1.1 ? "#ffe6f0" : "#efe6ff"
        ctx.beginPath()
        ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2)
        ctx.fill()
      }
      for (const p of petals.slice(0, 12)) drawPetal(p)
      ctx.globalAlpha = 1
      window.addEventListener("resize", onResize)
      return () => window.removeEventListener("resize", onResize)
    }

    // ----- animated: defer init off the critical path -----
    const idle =
      (window as Window & { requestIdleCallback?: (cb: () => void) => number }).requestIdleCallback ??
      ((cb: () => void) => window.setTimeout(cb, 200))
    let started = false
    const boot = () => {
      started = true
      resize()
      start()
      window.addEventListener("resize", onResize)
      document.addEventListener("visibilitychange", onVisibility)
      window.addEventListener("pointermove", onPointerMove, { passive: true })
      window.addEventListener("pointerout", onPointerLeave, { passive: true })
    }
    const idleId = idle(boot)

    return () => {
      stop()
      if (started) {
        window.removeEventListener("resize", onResize)
        document.removeEventListener("visibilitychange", onVisibility)
        window.removeEventListener("pointermove", onPointerMove)
        window.removeEventListener("pointerout", onPointerLeave)
      }
      const cancelIdle = (window as Window & { cancelIdleCallback?: (id: number) => void }).cancelIdleCallback
      if (typeof cancelIdle === "function") cancelIdle(idleId as number)
    }
  }, [reduced, density, constellations])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={className}
      style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 5 }}
    />
  )
}
