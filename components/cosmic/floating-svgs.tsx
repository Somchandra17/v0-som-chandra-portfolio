"use client"

import { motion, useScroll, useTransform, useSpring, useMotionValue, useReducedMotion } from "framer-motion"
import { useEffect, useState } from "react"

type Side = "nerdy" | "creative" | null

// V2 Orchestrated Scene Data.
// `asset` is the base name of the pre-rasterized image in /public/cosmic (AVIF+WebP);
// `tone` drives the hover "awakening" logic. nebula-glow is a pure CSS gradient (no image).
const sceneData = [
  // === 1. The Atmospheric Nebula: Deep Glow (pure gradient — no heavy image/blur) ===
  {
    tone: "pink", asset: null, type: "nebula-glow", zIndex: -2, parallax: 0.1, depth: 0.15,
    width: "250vw", height: "250vw", top: "calc(20vh - 125vw)", left: "-45vw", rotate: 20, floatDuration: 90, delay: 0
  },
  // === 2. The Galaxy: The Gravitational Center ===
  {
    tone: "pink", asset: "galaxy-2000", type: "galaxy", zIndex: 0, parallax: 0.2, depth: 0.08,
    width: "200vw", height: "200vw", top: "calc(30vh - 100vw)", left: "-35vw", rotate: -15, floatDuration: 60, delay: 0
  },
  // === 3. The Black River: Navigational Current ===
  {
    tone: "pink", asset: "dust-wave-1400", type: "river", zIndex: 1, parallax: 0.5, depth: 0.08,
    width: "150vw", height: "150vw", top: "calc(40vh - 75vw)", left: "10vw", rotate: 35, floatDuration: 50, delay: 0.2
  },
  // === 4. The Pink River: Orbital Ring ===
  {
    tone: "pink", asset: "river-1000", type: "orbital", zIndex: 0, parallax: 0.4, depth: 0.06,
    width: "200vw", height: "200vw", top: "calc(70% - 100vw)", left: "calc(60% - 100vw)", rotate: -20, floatDuration: 75, delay: 0.4
  },
  // === 5. Large Sakura Branch: Organic Framing ===
  {
    tone: "pink", asset: "branch-a-1100", type: "branch", zIndex: 3, parallax: 1.2, depth: 0.04,
    width: "100vw", height: "100vw", top: "-60vw", left: "60vw", rotate: 20, floatDuration: 40, delay: 0.1
  },
  // === 6. Small Branch: The Bridge ===
  {
    tone: "pink", asset: "petals-1000", type: "branch-small", zIndex: 3, parallax: 1.2, depth: 0.04,
    width: "60vw", height: "60vw", top: "20vh", left: "-20vw", rotate: -10, floatDuration: 35, delay: 0.3
  },
  // === 7. The Trail: Scroll Energy ===
  {
    tone: "pink", asset: "trail-1400", type: "trail", zIndex: 4, parallax: 1.5, depth: 0.02,
    width: "80vw", height: "80vw", top: "40%", left: "10%", rotate: 5, floatDuration: 45, delay: 0.5
  },
  // === 8. The Purple Flower: Ambient Depth ===
  {
    tone: "pink", asset: "lotus-900", type: "flower-deep", zIndex: -1, parallax: 0.15, depth: 0.1,
    width: "80vw", height: "80vw", top: "-30vw", left: "-30vw", rotate: 45, floatDuration: 30, delay: 0.7
  },
  // === 9. Pink Flower: Finale ===
  {
    tone: "pink", asset: "peony-1200", type: "footer-bloom", zIndex: 5, parallax: 0, depth: 0.02,
    width: "90vw", height: "90vw", top: "calc(100vh - 45vw)", left: "calc(75vw - 45vw)", rotate: -25, floatDuration: 25, delay: 0.2
  },
  // === 10. Green Ecosystem 1: Core Code (upper-left) ===
  {
    tone: "green", asset: "stream-b-1400", type: "interactive-green-ecosystem", zIndex: 0, parallax: 1.5, depth: 0.02,
    width: "70vw", height: "70vw", top: "calc(14vh - 35vw)", left: "calc(16vw - 35vw)", rotate: 10, floatDuration: 28, delay: 0
  },
  // === 11. Green Ecosystem 2: Terminal Depth (mid-left) ===
  {
    tone: "green", asset: "stream-a-1400", type: "interactive-green-ecosystem", zIndex: 0, parallax: 0.5, depth: 0.05,
    width: "70vw", height: "70vw", top: "calc(44vh - 35vw)", left: "calc(6vw - 35vw)", rotate: -15, floatDuration: 32, delay: 0.2
  },
  // === 12. Pink Particles: Unhinged Sparks ===
  {
    tone: "pink", asset: "sparkle-1200", type: "interactive-pink-particles", zIndex: 5, parallax: 1.5, depth: 0.01,
    width: "70vw", height: "70vw", top: "calc(40vh - 35vw)", left: "calc(75vw - 35vw)", rotate: 30, floatDuration: 20, delay: 0
  },
]

// Soft atmospheric wash that replaces the 3.99MB galaxy SVG blurred at 120px.
const NEBULA_GRADIENT =
  "radial-gradient(circle at center, rgba(244,200,214,0.7) 0%, rgba(150,120,200,0.36) 38%, rgba(120,90,170,0.13) 56%, transparent 70%)"

// Base opacities. NOTE: these layers render with NORMAL compositing (no mix-blend-mode).
// Animating opacity on a blended layer forced full re-rasterization every frame (the jitter);
// over the near-black void `screen` ≈ src anyway, so we drop the blend and bump alpha a touch.
// Base opacities — retuned into FAR (dim, distant haze) and MID (lifted, reachable) planes.
// FOREGROUND depth is carried by the BlossomField canvas (z-40), not these layers.
// FAR: nebula, galaxy, flower-deep  ·  MID: river, orbital, branch, branch-small, green-ecosystem
const baseOpacities: Record<string, number> = {
  "nebula-glow": 0.28,                        // FAR  (was 0.4)  ×0.7
  "galaxy": 0.30,                             // FAR  (was 0.42) ×0.7
  "river": 0.30,                              // MID  (was 0.26) ×1.15
  "orbital": 0.35,                            // MID  (was 0.3)  ×1.15
  "branch": 0.28,                             // MID  (was 0.24) ×1.15
  "branch-small": 0.23,                       // MID  (was 0.2)  ×1.15
  "trail": 0,                                 // Driven by scroll
  "flower-deep": 0.10,                        // FAR  (was 0.14) ×0.7
  "interactive-pink-particles": 0,            // Only visible on hover
  "interactive-green-ecosystem": 0.14,        // MID  (was 0.12) ×1.15
}

function FloatingSvgItem({
  item,
  idx,
  scrollYSpring,
  scrollYProgress,
  mouseX,
  mouseY,
  hoverSide,
  windowWidth,
  motionEnabled,
  intro,
  exiting,
}: {
  item: any,
  idx: number,
  scrollYSpring: any,
  scrollYProgress: any,
  mouseX: any,
  mouseY: any,
  hoverSide: Side,
  windowWidth: number,
  motionEnabled: boolean,
  intro: boolean,
  exiting: Side,
}) {
  // --- Depth tiers: subtle, weighted, "feel depth rather than see movement" ---
  // bg = large/deep backdrop (moves least) · mid = mid florals · fg = small fragments (most).
  // Spread widened so the differential between planes reads as depth (was 0.06/0.13/0.22).
  const tier =
    item.type === "branch" || item.type === "branch-small" || item.type === "interactive-green-ecosystem"
      ? "mid"
      : item.type === "trail" || item.type === "footer-bloom" || item.type === "interactive-pink-particles"
        ? "fg"
        : "bg"
  const SCROLL_MULT = { bg: 0.06, mid: 0.14, fg: 0.28 } as const   // was 0.06/0.13/0.22
  const MOUSE_PX = { bg: 8, mid: 16, fg: 26 } as const              // was 7/14/22

  // Extremely subtle scroll parallax (Scroll × 0.04–0.14).
  const scrollOffset = useTransform(scrollYSpring, (val: number) => val * SCROLL_MULT[tier] * -1)

  // Soft cursor DEPTH (not cursor-following): a few px per tier, heavily smoothed/weighted.
  const mouseDriven = motionEnabled
  const dir = idx % 2 === 0 ? -1 : 1
  const mX = useTransform(mouseX, (val: number) => val * MOUSE_PX[tier] * 2 * dir)
  const mY = useTransform(mouseY, (val: number) => val * MOUSE_PX[tier] * 2 * dir)
  const springMX = useSpring(mX, { damping: 60, stiffness: 90 })
  const springMY = useSpring(mY, { damping: 60, stiffness: 90 })

  // Footer bloom scroll transforms
  const footerScale = useTransform(scrollYProgress, [0.8, 1], [0.5, 1.2])
  const footerOpacityScroll = useTransform(scrollYProgress, [0.8, 1], [0, 0.9])
  const footerRotate = useTransform(scrollYProgress, [0.7, 1], [item.rotate - 30, item.rotate + 10])

  // Trail scroll energy translation
  const trailTranslateY = useTransform(scrollYProgress, [0, 1], ["-20%", "20%"])
  const trailOpacityScroll = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 0.2, 0.2, 0])

  let targetOpacity = item.type === "footer-bloom" ? 0 : (baseOpacities[item.type] || 0.15)

  // Hover "awakening" (background layer): the ForegroundFlow overlay now owns each side's hero
  // asset, so here we DIM the backdrop — recede the duplicated bg copy (×0.4), keep the galaxy lit
  // as a neutral anchor, dim the rest (×0.22). Opacity only (no glow/scale) — the glow lives in
  // the foreground overlay, and this stays jank-free.
  if (hoverSide === "creative") {
    if (item.type === "river") {
      // Foreground flow owns the water now — recede the bg copy so it doesn't duplicate.
      targetOpacity = targetOpacity * 0.4
    } else if (item.type === "galaxy") {
      // Keep the cosmic centre lit as a neutral anchor (mirrors the nerdy side).
      targetOpacity = Math.min(1, targetOpacity * 1.1)
    } else if (item.type === "interactive-pink-particles") {
      // A small unhinged-spark accent — no longer the busy bloom (water is the hero now).
      targetOpacity = 0.3
    } else if (item.type !== "nebula-glow") {
      // Everything else recedes so the foreground water current reads as the hero.
      targetOpacity = targetOpacity * 0.22
    }
  } else if (hoverSide === "nerdy") {
    if (item.type === "interactive-green-ecosystem") {
      // Foreground flow owns the green stream now — recede the bg copy (was 0.9).
      targetOpacity = targetOpacity * 0.4
    } else if (item.tone === "green") {
      targetOpacity = Math.min(1, targetOpacity * 2.6 + 0.14)
    } else if (item.type === "galaxy") {
      // The solar system stays lit (acknowledges the nerdy side) rather than dimming out.
      targetOpacity = Math.min(1, targetOpacity * 1.1)
    } else if (item.type !== "nebula-glow") {
      targetOpacity = targetOpacity * 0.22
    }
  }

  // Static-frame fallbacks (reduced motion / pre-mount).
  if (!motionEnabled) {
    if (item.type === "footer-bloom") targetOpacity = 0.85
    if (item.type === "trail") targetOpacity = 0.18
  }

  let continuousAnimate: any = {}
  let continuousTransition: any = {}

  // Continuous loops are intentionally TRANSFORM-ONLY (no opacity) — see MOTION_SYSTEM.md.
  // Each layer gets a SIGNATURE motion suited to what it is — so the planes read as distinct
  // living depths, not one uniform wobble. All transform-only (no opacity/filter) per MOTION_SYSTEM.
  switch (item.type) {
    case "nebula-glow":
      // Atmospheric haze: slow breathe + a slow positional drift so the wash quietly moves.
      continuousAnimate = {
        scale: [1, 1.09, 0.97, 1],
        x: ["0%", "2%", "-1.5%", "0%"],
        y: ["0%", "-2%", "1%", "0%"],
      }
      continuousTransition = { duration: 120, repeat: Infinity, ease: "easeInOut", times: [0, 0.35, 0.7, 1], delay: idx * 1.7 }
      break
    case "galaxy":
      // The gravitational anchor — it actually TURNS (full slow spin) with a faint breathe.
      continuousAnimate = { rotate: [item.rotate, item.rotate + 360], scale: [1, 1.04, 0.99, 1] }
      continuousTransition = {
        rotate: { duration: 200, repeat: Infinity, ease: "linear" },
        scale: { duration: 48, repeat: Infinity, ease: "easeInOut", times: [0, 0.4, 0.8, 1] },
      }
      break
    case "flower-deep":
      // Dreamy deep flower: bloom-breathe + a slow rotation drift.
      continuousAnimate = { scale: [0.95, 1.05, 0.98, 0.95], rotate: [item.rotate, item.rotate + 6, item.rotate - 2, item.rotate] }
      continuousTransition = { duration: 58, repeat: Infinity, ease: "easeInOut", times: [0, 0.4, 0.8, 1], delay: idx * 1.4 }
      break
    case "branch":
      // Wind sway — hinged at the attach corner (transformOrigin set below), not pivoting in place.
      continuousAnimate = { rotate: [item.rotate, item.rotate + 4, item.rotate - 2.5, item.rotate], y: ["0%", "1.5%", "-0.5%", "0%"] }
      continuousTransition = { duration: 44, repeat: Infinity, ease: [0.45, 0.05, 0.55, 0.95], times: [0, 0.4, 0.75, 1], delay: idx * 3.2 }
      break
    case "branch-small":
      // Petals catching wind — lighter, quicker flutter.
      continuousAnimate = { rotate: [item.rotate, item.rotate - 5, item.rotate + 3.5, item.rotate], x: ["0%", "-2.5%", "1%", "0%"] }
      continuousTransition = { duration: 27, repeat: Infinity, ease: [0.45, 0.05, 0.55, 0.95], times: [0, 0.4, 0.75, 1], delay: idx * 1.5 }
      break
    case "river":
      // A current flowing along its axis: sustained drift + gentle undulation.
      continuousAnimate = { x: ["0%", "-6%", "0%"], y: ["0%", "3%", "0%"], scale: [1, 1.04, 1] }
      continuousTransition = { duration: 46, repeat: Infinity, ease: [0.37, 0, 0.63, 1], times: [0, 0.5, 1], delay: idx * 2.7 }
      break
    case "orbital":
      // The pink ring orbits — counter to the galaxy, so the two rotations read as separate depths.
      continuousAnimate = { rotate: [item.rotate, item.rotate - 360] }
      continuousTransition = { rotate: { duration: 150, repeat: Infinity, ease: "linear" } }
      break
    case "interactive-green-ecosystem":
      // Streaming data flow: drift along axis + slow rotate + micro scale (distinct from the florals).
      continuousAnimate = {
        x: ["0%", "4%", "-2%", "0%"],
        y: ["0%", "-3%", "1.5%", "0%"],
        rotate: [item.rotate, item.rotate - 4, item.rotate + 2, item.rotate],
        scale: [1, 1.03, 0.99, 1],
      }
      continuousTransition = { duration: 40, repeat: Infinity, ease: "easeInOut", times: [0, 0.35, 0.7, 1], delay: idx * 0.8 }
      break
    default:
      continuousAnimate = { rotate: [item.rotate, item.rotate + (idx % 2 === 0 ? 5 : -5), item.rotate], y: ["0%", "2%", "0%"] }
      continuousTransition = { duration: item.floatDuration, repeat: Infinity, ease: "easeInOut", delay: idx * 1.3 }
  }

  // Pivot per layer: branches sway hinged at the corner they enter from; everything else
  // spins / breathes / flows around its center.
  const transformOrigin =
    item.type === "branch" ? "top right" : item.type === "branch-small" ? "top left" : "center"

  // Radial masks feather rectangular images into soft cosmic forms.
  // MID tiers tightened (larger solid core) so silhouettes hold and read as a distinct plane.
  let maskImage: string | undefined = "radial-gradient(circle at center, black 15%, transparent 60%)"
  if (item.type === "nebula-glow") {
    maskImage = undefined
  } else if (item.type === "galaxy") {
    maskImage = "radial-gradient(circle at center, black 25%, transparent 65%)"   // FAR (unchanged)
  } else if (item.type === "river" || item.type === "orbital") {
    maskImage = "radial-gradient(circle at center, black 28%, transparent 62%)"   // MID tightened (was 20%)
  } else if (item.type === "flower-deep") {
    maskImage = "radial-gradient(circle at center, black 20%, transparent 70%)"   // FAR (unchanged)
  } else if (item.type === "branch" || item.type === "branch-small") {
    maskImage = "radial-gradient(circle at center, black 20%, transparent 62%)"   // MID tightened (was 10%)
  }

  const isScrollDrivenTrail = item.type === "trail"

  // Exit: when a side is chosen, the whole scene zooms + blooms outward and fades, then routes.
  const exitTarget = exiting ? { opacity: 0, scale: 1.7 } : null
  const revealTarget = (item.type !== "footer-bloom" && !isScrollDrivenTrail) || hoverSide
    ? { opacity: targetOpacity, scale: 1, rotate: item.rotate, y: "0%" }
    : undefined
  const animateProp = exitTarget ?? revealTarget

  const transitionProp = exiting
    ? { duration: 0.7, ease: [0.4, 0, 0.9, 0.5] }
    : motionEnabled
      ? {
          opacity: { duration: 0.55, delay: intro ? 0.18 + idx * 0.17 : 0, ease: [0.16, 1, 0.3, 1] },
          scale: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
          rotate: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
          y: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
        }
      : { duration: 0 }

  return (
    <motion.div
      className="absolute pointer-events-none gpu-layer"
      style={{
        top: item.top,
        left: item.left,
        width: item.width,
        height: item.height,
        x: mouseDriven ? springMX : 0,
        y: !motionEnabled ? 0 : isScrollDrivenTrail ? trailTranslateY : scrollOffset,
        zIndex: item.zIndex,
        opacity: exiting || !motionEnabled
          ? undefined
          : item.type === "footer-bloom" && !hoverSide
            ? footerOpacityScroll
            : isScrollDrivenTrail && !hoverSide
              ? trailOpacityScroll
              : undefined,
        scale: motionEnabled && !exiting && item.type === "footer-bloom" && !hoverSide ? footerScale : undefined,
        rotate: motionEnabled && !exiting && item.type === "footer-bloom" && !hoverSide ? footerRotate : undefined,
      }}
    >
      <motion.div style={{ y: mouseDriven ? springMY : 0 }} className="w-full h-full">
        {/* Reveal / hover / exit wrapper — opacity animates here (NO blend mode → cheap). */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={animateProp}
          transition={transitionProp}
          className="w-full h-full relative mix-blend-screen gpu-layer blend-isolate"
        >
          {/* Continuous float (transform-only) + radial mask. */}
          <motion.div
            animate={motionEnabled && !exiting ? continuousAnimate : undefined}
            transition={motionEnabled && !exiting ? continuousTransition : { duration: 0 }}
            className="w-full h-full relative gpu-layer"
            style={{ WebkitMaskImage: maskImage, maskImage, transformOrigin }}
          >
            {item.type === "nebula-glow" ? (
              <div className="w-full h-full" style={{ background: NEBULA_GRADIENT }} />
            ) : (
              <picture className="block w-full h-full">
                <source srcSet={`/cosmic/${item.asset}.avif`} type="image/avif" />
                <source srcSet={`/cosmic/${item.asset}.webp`} type="image/webp" />
                <img
                  src={`/cosmic/${item.asset}.webp`}
                  alt=""
                  aria-hidden="true"
                  className="w-full h-full object-contain"
                  loading={item.type === "galaxy" ? "eager" : "lazy"}
                  decoding="async"
                  draggable={false}
                />
              </picture>
            )}
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

export function FloatingSvgs({
  hoverSide,
  intro = false,
  exiting = null,
}: {
  hoverSide: Side
  intro?: boolean
  exiting?: Side
}) {
  const [mounted, setMounted] = useState(false)
  const [windowWidth, setWindowWidth] = useState(1000)
  const prefersReduced = useReducedMotion()
  const { scrollY, scrollYProgress } = useScroll()

  const scrollYSpring = useSpring(scrollY, { damping: 50, stiffness: 300 })
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const motionEnabled = mounted && !prefersReduced

  useEffect(() => {
    setMounted(true)
    setWindowWidth(window.innerWidth)
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener("resize", handleResize)

    const finePointer = window.matchMedia("(pointer: fine)").matches
    let rafId = 0
    let pending = false
    let lastX = 0
    let lastY = 0
    const flush = () => {
      pending = false
      mouseX.set(lastX)
      mouseY.set(lastY)
    }
    const handleMouseMove = (e: MouseEvent) => {
      lastX = e.clientX / window.innerWidth - 0.5
      lastY = e.clientY / window.innerHeight - 0.5
      if (!pending) {
        pending = true
        rafId = requestAnimationFrame(flush)
      }
    }

    const trackPointer = !prefersReduced && finePointer
    if (trackPointer) window.addEventListener("mousemove", handleMouseMove)

    return () => {
      window.removeEventListener("resize", handleResize)
      if (trackPointer) window.removeEventListener("mousemove", handleMouseMove)
      cancelAnimationFrame(rafId)
    }
  }, [mouseX, mouseY, prefersReduced])

  if (!mounted) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" style={{ isolation: "isolate" }} aria-hidden="true">
      {/* Background Deep Wash */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(25,15,35,0.4),_transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_rgba(15,25,25,0.3),_transparent_60%)]" />

      {sceneData.map((item, idx) => (
        <FloatingSvgItem
          key={`scene-${idx}`}
          item={item}
          idx={idx}
          scrollYSpring={scrollYSpring}
          scrollYProgress={scrollYProgress}
          mouseX={mouseX}
          mouseY={mouseY}
          hoverSide={hoverSide}
          windowWidth={windowWidth}
          motionEnabled={motionEnabled}
          intro={intro}
          exiting={exiting}
        />
      ))}
    </div>
  )
}
