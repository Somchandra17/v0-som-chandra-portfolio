"use client"

import { motion, AnimatePresence, useReducedMotion, useMotionValue, useSpring, useTransform } from "framer-motion"
import { useEffect, useState } from "react"

type Side = "nerdy" | "creative" | null

type FlowConfig = {
  asset: string
  flipX?: boolean
  glow: string
  top: string
  left: string
  size: string
  transformOrigin: string
  mask: string
  ribbonOpacity: number
  enterX: string
  enterY: string
  drift: any
  driftTransition: any
  glowPulse: any
  glowPulseTransition: any
}

// Per-side signature. Two personalities: nerdy = precise/linear (terminal);
// creative = loose/undulating (unhinged). Each side pools into a lower corner
// (nerdy bottom-left — mirrored so the foliage faces inward; creative bottom-right)
// and dissolves outward. The radial mask keeps the dense centre on the foliage/current
// and feathers the edges — which also crops stream-b's corner watermark glyph.
const FLOW: Record<"nerdy" | "creative", FlowConfig> = {
  nerdy: {
    asset: "stream-b-1400",
    flipX: true,
    glow:
      "radial-gradient(circle at 32% 54%, rgba(127,176,127,0.52) 0%, rgba(115,165,120,0.18) 24%, transparent 46%)",
    top: "-8vh",
    left: "-22vw",
    size: "122vw",
    transformOrigin: "34% 48%",
    mask: "radial-gradient(circle at 34% 44%, black 8%, rgba(0,0,0,0.55) 30%, transparent 46%)",
    ribbonOpacity: 0.48,
    enterX: "-7%",
    enterY: "7%",
    drift: { x: ["0%", "3%", "0%"], y: ["0%", "-2.5%", "0%"], rotate: [-8, -6.5, -8], scale: [1, 1.03, 1] },
    driftTransition: { duration: 24, repeat: Infinity, ease: [0.37, 0, 0.63, 1], times: [0, 0.5, 1] },
    glowPulse: { scale: [1, 1.06, 1] },
    glowPulseTransition: { duration: 3, repeat: Infinity, ease: "easeInOut" },
  },
  creative: {
    asset: "dust-wave-1400",
    glow:
      "radial-gradient(circle at 62% 54%, rgba(240,170,195,0.4) 0%, rgba(210,120,160,0.15) 22%, transparent 40%)",
    top: "-18vh",
    left: "-6vw",
    size: "128vw",
    transformOrigin: "62% 54%",
    mask: "radial-gradient(circle at 62% 52%, black 8%, rgba(0,0,0,0.55) 38%, transparent 64%)",
    ribbonOpacity: 0.4,
    enterX: "7%",
    enterY: "7%",
    drift: { x: ["0%", "-4%", "1%", "0%"], y: ["0%", "3%", "-1%", "0%"], rotate: [10, 8, 11, 10], scale: [1, 1.05, 1.0, 1] },
    driftTransition: { duration: 34, repeat: Infinity, ease: [0.45, 0.05, 0.55, 0.95], times: [0, 0.4, 0.75, 1] },
    glowPulse: { scale: [1, 1.08, 1.02, 1] },
    glowPulseTransition: { duration: 6, repeat: Infinity, ease: "easeInOut", times: [0, 0.4, 0.75, 1] },
  },
}

function FlowLayer({
  side,
  motionEnabled,
  exiting,
  mouseX,
  mouseY,
}: {
  side: "nerdy" | "creative"
  motionEnabled: boolean
  exiting: boolean
  mouseX: any
  mouseY: any
}) {
  const cfg = FLOW[side]
  // Faint cursor DEPTH (fg-tier weight), mirrored per side — gives the ribbon volume.
  const dir = side === "nerdy" ? -1 : 1
  const mX = useTransform(mouseX, (v: number) => v * 26 * dir)
  const mY = useTransform(mouseY, (v: number) => v * 26 * dir)
  const springMX = useSpring(mX, { damping: 60, stiffness: 90 })
  const springMY = useSpring(mY, { damping: 60, stiffness: 90 })

  return (
    <motion.div
      className="absolute gpu-layer"
      style={{
        top: cfg.top,
        left: cfg.left,
        width: cfg.size,
        height: cfg.size,
        x: motionEnabled ? springMX : 0,
        y: motionEnabled ? springMY : 0,
      }}
    >
      {/* Reveal / exit wrapper — one-shot opacity + scale + entrance sweep (settles). */}
      <motion.div
        className="w-full h-full relative gpu-layer"
        style={{ transformOrigin: cfg.transformOrigin }}
        initial={{ opacity: 0, scale: 0.92, x: cfg.enterX, y: cfg.enterY }}
        animate={exiting ? { opacity: 0, scale: 1.5, x: "0%", y: "0%" } : { opacity: 1, scale: 1, x: "0%", y: "0%" }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={
          exiting
            ? motionEnabled
              ? { duration: 0.7, ease: [0.4, 0, 0.9, 0.5] }
              : { duration: 0 }
            : motionEnabled
              ? {
                  opacity: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
                  scale: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
                  x: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
                  y: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
                }
              : { duration: 0 }
        }
      >
        {/* Glow aura — screen-blended radial light (additive over the dark scene); breathes via scale only. */}
        <motion.div
          aria-hidden
          className="absolute inset-0 gpu-layer"
          style={{ background: cfg.glow, mixBlendMode: "screen", transformOrigin: cfg.transformOrigin }}
          animate={motionEnabled && !exiting ? cfg.glowPulse : { scale: 1 }}
          transition={motionEnabled && !exiting ? cfg.glowPulseTransition : { duration: 0 }}
        />

        {/* Ribbon — static-opacity holder; the flow loop (transform-only) lives on its child. */}
        <div className="absolute inset-0" style={{ opacity: cfg.ribbonOpacity }}>
          <motion.div
            className="w-full h-full gpu-layer"
            style={{ WebkitMaskImage: cfg.mask, maskImage: cfg.mask, transformOrigin: cfg.transformOrigin }}
            animate={motionEnabled && !exiting ? cfg.drift : undefined}
            transition={motionEnabled && !exiting ? cfg.driftTransition : { duration: 0 }}
          >
            <div className="w-full h-full" style={cfg.flipX ? { transform: "scaleX(-1)" } : undefined}>
              <picture className="block w-full h-full">
                <source srcSet={`/cosmic/${cfg.asset}.avif`} type="image/avif" />
                <source srcSet={`/cosmic/${cfg.asset}.webp`} type="image/webp" />
                <img
                  src={`/cosmic/${cfg.asset}.webp`}
                  alt=""
                  aria-hidden="true"
                  className="w-full h-full object-contain"
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                />
              </picture>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export function ForegroundFlow({ hoverSide, exiting }: { hoverSide: Side; exiting: Side }) {
  const [mounted, setMounted] = useState(false)
  const prefersReduced = useReducedMotion()
  const motionEnabled = mounted && !prefersReduced

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  useEffect(() => {
    setMounted(true)
    const finePointer = window.matchMedia("(pointer: fine)").matches
    if (prefersReduced || !finePointer) return
    let rafId = 0
    let pending = false
    let lastX = 0
    let lastY = 0
    const flush = () => {
      pending = false
      mouseX.set(lastX)
      mouseY.set(lastY)
    }
    const onMove = (e: MouseEvent) => {
      lastX = e.clientX / window.innerWidth - 0.5
      lastY = e.clientY / window.innerHeight - 0.5
      if (!pending) {
        pending = true
        rafId = requestAnimationFrame(flush)
      }
    }
    window.addEventListener("mousemove", onMove)
    return () => {
      window.removeEventListener("mousemove", onMove)
      cancelAnimationFrame(rafId)
    }
  }, [mouseX, mouseY, prefersReduced])

  // Keep showing through the exit bloom even after hoverSide is cleared.
  const active: "nerdy" | "creative" | null = exiting ?? hoverSide

  if (!mounted) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-30 overflow-hidden" aria-hidden="true">
      <AnimatePresence>
        {active && (
          <FlowLayer
            key={active}
            side={active}
            motionEnabled={motionEnabled}
            exiting={exiting === active}
            mouseX={mouseX}
            mouseY={mouseY}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
