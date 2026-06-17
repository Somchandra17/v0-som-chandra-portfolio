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

// --- Foreground sub-stream: delicate motes drifting IN FRONT of content (z-40).
// Sparser, slower, brighter than the hover petals. Sells occlusion depth.
const FG_IDLE_CAP = 6        // idle trickle density
const FG_HOVER_CAP = 16      // hover density
const FG_ARMED_CAP = 22      // armed (1st-click) density
const FG_IDLE_FRAME_MS = 1000 / 20  // idle trickle runs at 20fps (half the 60fps petal loop)

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
  fg: boolean      // foreground mote? (rendered brighter, occludes content)
  ripple: boolean  // ARM ripple mote? (short-lived, settles fast)
}

export function BlossomField({ hoverSide, armedSide = null, exiting = null }: { hoverSide: Side; armedSide?: Side; exiting?: Side }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sideRef = useRef<Side>(null)
  const armedRef = useRef<Side>(null)
  const exitingRef = useRef<Side>(null)
  const startRef = useRef<() => void>(() => {})
  const rippleRef = useRef<(side: "nerdy" | "creative") => void>(() => {})
  const burstRef = useRef<(side: "nerdy" | "creative") => void>(() => {})
  const prefersReduced = useReducedMotion()

  useEffect(() => {
    sideRef.current = hoverSide
    if (hoverSide) startRef.current()
  }, [hoverSide])

  // On the 1st click (ARM) a soft ripple acknowledges the commit.
  useEffect(() => {
    const was = armedRef.current
    armedRef.current = armedSide
    if (armedSide && !was) {
      rippleRef.current(armedSide)
      startRef.current()
    }
  }, [armedSide])

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
    let lastFgSpawn = 0
    let last = 0
    let phase = 0
    const FRAME_MS = 1000 / 60

    const spawn = (side: "nerdy" | "creative") => {
      const colors = COLORS[side]
      motes.push({
        x: Math.random() * w,
        y: h * 0.55 + Math.random() * h * 0.5,
        vx: (Math.random() - 0.5) * 0.25,
        vy: -(0.25 + Math.random() * 0.5),
        size: 6 + Math.random() * 10,
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.02,
        swaySeed: Math.random() * 6.28,
        sway: 0.3 + Math.random() * 0.6,
        color: colors[(Math.random() * colors.length) | 0],
        life: 0,
        fade: 0.004 + Math.random() * 0.004,
        fg: false,
        ripple: false,
      })
    }

    // Foreground mote: drifts along viewport edges + section gaps (not parked over text),
    // slower and brighter than hover petals. `biasCardX/biasCardY` pull it toward the
    // active card region when a side is hovered/armed.
    const spawnFg = (side: "nerdy" | "creative", biasCardX: number, biasCardY: number) => {
      const colors = COLORS[side]
      // Bias spawn toward the active card region (±some scatter) when engaged; else spread across width.
      const nearCard = side !== null
      const cx = nearCard ? biasCardX + (Math.random() - 0.5) * w * 0.6 : Math.random() * w
      motes.push({
        x: cx,
        y: nearCard ? biasCardY + (Math.random() - 0.5) * h * 0.5 : h * 0.2 + Math.random() * h * 0.6,
        vx: (Math.random() - 0.5) * 0.18,           // slower horizontal drift
        vy: side === "nerdy" ? (Math.random() - 0.5) * 0.3 : -(0.15 + Math.random() * 0.3), // nerdy: more horizontal; creative: rises
        size: 4 + Math.random() * 8,                // smaller — delicate, never covers a card face
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.012,
        swaySeed: Math.random() * 6.28,
        sway: 0.2 + Math.random() * 0.4,
        color: colors[(Math.random() * colors.length) | 0],
        life: 0,
        fade: 0.0025 + Math.random() * 0.0025,      // slower fade-in (delicate)
        fg: true,
        ripple: false,
      })
    }

    // ARM ripple: on the 1st click, ~10 motes emanate outward from the clicked card and settle.
    const ripple = (side: "nerdy" | "creative") => {
      const colors = COLORS[side]
      const cx = w / 2
      const cy = h * 0.46
      for (let i = 0; i < 10; i++) {
        const ang = Math.random() * Math.PI * 2
        const spd = 0.8 + Math.random() * 1.8
        motes.push({
          x: cx + (Math.random() - 0.5) * 60,
          y: cy + (Math.random() - 0.5) * 60,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd - 0.4,
          size: 8 + Math.random() * 12,
          angle: Math.random() * 6.28,
          spin: (Math.random() - 0.5) * 0.04,
          swaySeed: Math.random() * 6.28,
          sway: 0.3 + Math.random() * 0.3,
          color: colors[(Math.random() * colors.length) | 0],
          life: 1,
          fade: 0.02 + Math.random() * 0.01,        // settles in ~0.6s
          fg: true,
          ripple: true,
        })
      }
    }
    rippleRef.current = ripple

    // Exit burst: a spray of large motes flying outward from centre (the "bloom out").
    // Now rendered in FRONT of content (fg) — the depth inverts: content recedes, foreground surges.
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
          vy: Math.sin(ang) * spd - 1.2,
          size: 16 + Math.random() * 30,
          angle: Math.random() * 6.28,
          spin: (Math.random() - 0.5) * 0.08,
          swaySeed: Math.random() * 6.28,
          sway: 0.4 + Math.random() * 0.5,
          color: colors[(Math.random() * colors.length) | 0],
          life: 1,
          fade: 0.01 + Math.random() * 0.01,
          fg: true,
          ripple: false,
        })
      }
    }
    burstRef.current = burst

    // --- Active-side card centre (for spawn biasing). Computed each frame from refs.
    // The nerdy/creative cards sit in a 2-col grid around mid-page in the hero.
    let biasCardX = w / 2
    let biasCardY = h * 0.46

    // Single scroll-progress reader shared with density (no new listener).
    // Density is REDUCED over dense content (music zone, terminal) and restored in gaps.
    let densityScale = 1

    const render = (now: number) => {
      if (!running) return
      rafId = requestAnimationFrame(render)
      const side = sideRef.current
      const armed = armedRef.current
      const exitingNow = exitingRef.current
      const activeSide: "nerdy" | "creative" | null = exitingNow ?? side ?? armed
      // Active states (hover / armed / exit) run at 60fps for smoothness; the idle trickle
      // runs at 20fps so the resting scene stays cheap.
      if (now - last < (activeSide ? FRAME_MS : FG_IDLE_FRAME_MS)) return
      last = now

      ctx.clearRect(0, 0, w, h)
      phase += 0.02
      const flatten = exitingNow ? 0.85 : side ? FLATTEN[side] : 0.5

      ctx.globalCompositeOperation = "lighter"

      // --- Foreground density by state (the intensity ladder) ---
      let fgCap = FG_IDLE_CAP
      let fgOpacityBoost = 0.3
      if (side === "nerdy" || side === "creative") {
        fgCap = FG_HOVER_CAP
        fgOpacityBoost = 0.45
      }
      if (armed) {
        fgCap = FG_ARMED_CAP
        fgOpacityBoost = 0.55
      }
      if (exitingNow) fgOpacityBoost = 0.85

      // --- Scroll thinning: reduce density over text-dense zones ---
      const scrollProg = window.scrollY / Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
      densityScale = 1
      if (scrollProg > 0.18 && scrollProg < 0.55) densityScale = 0.4   // music zone
      else if (scrollProg > 0.6 && scrollProg < 0.78) densityScale = 0.3 // terminal

      // --- Spawning ---
      const fgCount = motes.filter((m) => m.fg && !m.ripple).length
      if (activeSide) {
        if (now - lastSpawn > 70 && motes.length < CAP) spawn(activeSide)   // hover petals (bg)
        const fgEffectiveCap = Math.round(fgCap * densityScale)
        if (fgCount < fgEffectiveCap && now - lastFgSpawn > 200) {
          spawnFg(activeSide, biasCardX, biasCardY)
          lastFgSpawn = now
        }
      } else if (fgCount < FG_IDLE_CAP && now - lastFgSpawn > 300) {
        // Idle trickle: a few delicate motes drift through the hero — the "living space" baseline.
        spawnFg("creative", biasCardX, biasCardY)
        lastFgSpawn = now
      }

      for (let i = motes.length - 1; i >= 0; i--) {
        const p = motes[i]
        const offscreen =
          p.y < -p.size * 2 || p.y > h + p.size * 2 || p.x < -p.size * 2 || p.x > w + p.size * 2
        const dying = p.ripple
          ? true                                          // ripple motes fade out from spawn (the settle)
          : p.fg
            ? !!exitingNow || offscreen                   // fg motes recycle when they leave the viewport
            : side === null || p.y < h * 0.08 || !!exitingNow  // bg petals: original behaviour
        p.life += dying ? -p.fade * 3 : p.fade * 2
        if (p.life >= 1) p.life = 1
        if (p.life <= 0) {
          motes.splice(i, 1)
          continue
        }

        if (exitingNow && p.fg) p.size += 0.7        // exit surge (was 0.45)
        else if (exitingNow) p.size += 0.45
        p.x += p.vx + Math.sin(phase + p.swaySeed) * p.sway
        p.y += p.vy
        p.angle += p.spin

        const sp = sprite(p.color)
        const d = p.size * 2
        // Foreground motes render brighter (occlusion depth); bg petals keep their ambient alpha.
        const alpha = p.fg ? p.life * fgOpacityBoost : p.life * 0.85
        ctx.globalAlpha = alpha
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.angle)
        ctx.scale(1, flatten)
        ctx.drawImage(sp, -d / 2, -d / 2, d, d)
        ctx.restore()
      }

      ctx.globalAlpha = 1
      ctx.globalCompositeOperation = "source-over"
    }

    const start = () => {
      if (running) return
      running = true
      last = 0
      lastSpawn = 0
      lastFgSpawn = 0
      rafId = requestAnimationFrame(render)
    }
    startRef.current = start

    // The idle trickle is always-on while the tab is visible, so pause it when the tab is
    // hidden (keeps background CPU at zero) and resume on return.
    const onVisibility = () => {
      if (document.hidden) {
        running = false
        cancelAnimationFrame(rafId)
      } else {
        start()
      }
    }
    document.addEventListener("visibilitychange", onVisibility)
    if (!document.hidden) start()

    return () => {
      window.removeEventListener("resize", onResize)
      document.removeEventListener("visibilitychange", onVisibility)
      running = false
      cancelAnimationFrame(rafId)
    }
  }, [prefersReduced])

  if (prefersReduced) return null

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[40] h-screen w-full"
      aria-hidden="true"
    />
  )
}
