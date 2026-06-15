"use client"

import { motion, useScroll, useTransform, useSpring, useMotionValue, useReducedMotion } from "framer-motion"
import { useEffect, useState } from "react"

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
    tone: "green", asset: "dust-wave-1400", type: "river", zIndex: 1, parallax: 0.5, depth: 0.08,
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
  // === 10. Green Ecosystem 1: Core Code ===
  {
    tone: "green", asset: "stream-b-1400", type: "interactive-green-ecosystem", zIndex: 0, parallax: 1.5, depth: 0.02,
    width: "70vw", height: "70vw", top: "calc(40vh - 35vw)", left: "calc(25vw - 35vw)", rotate: 10, floatDuration: 28, delay: 0
  },
  // === 11. Green Ecosystem 2: Terminal Depth ===
  {
    tone: "green", asset: "stream-a-1400", type: "interactive-green-ecosystem", zIndex: 0, parallax: 0.5, depth: 0.05,
    width: "100vw", height: "100vw", top: "calc(70% - 50vw)", left: "-30vw", rotate: -15, floatDuration: 32, delay: 0.2
  },
  // === 12. Pink Particles: Unhinged Sparks ===
  {
    tone: "pink", asset: "sparkle-1200", type: "interactive-pink-particles", zIndex: 5, parallax: 1.5, depth: 0.01,
    width: "70vw", height: "70vw", top: "calc(40vh - 35vw)", left: "calc(75vw - 35vw)", rotate: 30, floatDuration: 20, delay: 0
  },
]

// Soft atmospheric wash that replaces the 3.99MB galaxy SVG blurred at 120px.
const NEBULA_GRADIENT =
  "radial-gradient(circle at center, rgba(244,200,214,0.65) 0%, rgba(150,120,200,0.34) 38%, rgba(120,90,170,0.12) 56%, transparent 70%)"

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
}: {
  item: any,
  idx: number,
  scrollYSpring: any,
  scrollYProgress: any,
  mouseX: any,
  mouseY: any,
  hoverSide: "nerdy" | "creative" | null,
  windowWidth: number,
  motionEnabled: boolean,
}) {
  // Scroll Parallax mapping (only bound when motion is enabled).
  const scrollOffset = useTransform(scrollYSpring, (val: number) => val * item.parallax * -1)

  // Mouse parallax — only the perceptible (deeper) layers are actually mouse-driven,
  // so we run a handful of springs on pointer move instead of all 24.
  const mouseDriven = motionEnabled && item.depth >= 0.08
  const mX = useTransform(mouseX, (val: number) => val * (windowWidth * item.depth) * (idx % 2 === 0 ? -1 : 1))
  const mY = useTransform(mouseY, (val: number) => val * (windowWidth * item.depth) * (idx % 2 === 0 ? -1 : 1))
  const springMX = useSpring(mX, { damping: 50, stiffness: 100 })
  const springMY = useSpring(mY, { damping: 50, stiffness: 100 })

  // Footer bloom scroll transforms
  const footerScale = useTransform(scrollYProgress, [0.8, 1], [0.5, 1.2])
  const footerOpacityScroll = useTransform(scrollYProgress, [0.8, 1], [0, 0.9])
  const footerRotate = useTransform(scrollYProgress, [0.7, 1], [item.rotate - 30, item.rotate + 10])

  // Trail scroll energy translation
  const trailTranslateY = useTransform(scrollYProgress, [0, 1], ["-20%", "20%"])
  const trailOpacityScroll = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 0.2, 0.2, 0])

  const baseOpacities: Record<string, number> = {
    "nebula-glow": 0.35,
    "galaxy": 0.28,
    "river": 0.18,
    "orbital": 0.2,
    "branch": 0.15,
    "branch-small": 0.12,
    "trail": 0, // Driven by scroll
    "flower-deep": 0.08,
    "interactive-pink-particles": 0, // Only visible on hover
    "interactive-green-ecosystem": 0.05,
  }

  let targetOpacity = item.type === "footer-bloom" ? 0 : (baseOpacities[item.type] || 0.15)
  let targetScale = 1
  let targetY = "0%"
  let targetRotate = item.rotate

  // Interaction Hover Logic (V4 - Awakenings)
  if (hoverSide === "creative") {
    if (item.type === "interactive-pink-particles") {
      targetOpacity = 0.5
      targetScale = 1.05
      targetRotate = item.rotate + 30
    } else if (item.tone === "pink" && item.type !== "nebula-glow") {
      targetOpacity = Math.min(1, targetOpacity * 1.5)
      targetScale = 1.02
      targetRotate = item.rotate + 2
    } else if (item.type !== "nebula-glow") {
      targetOpacity = targetOpacity * 0.7
    }
  } else if (hoverSide === "nerdy") {
    if (item.type === "interactive-green-ecosystem") {
       targetOpacity = 0.6
       targetScale = 1.05
    } else if (item.tone === "green") {
      targetOpacity = Math.min(1, targetOpacity * 1.5)
      targetScale = 1.02
    } else if (item.type !== "nebula-glow") {
      targetOpacity = targetOpacity * 0.7
    }
  }

  // Reduced motion / pre-mount: render a static final frame for footer + trail too.
  if (!motionEnabled) {
    if (item.type === "footer-bloom") targetOpacity = 0.85
    if (item.type === "trail") targetOpacity = 0.18
  }

  let continuousAnimate: any = {}
  let continuousTransition: any = {}

  switch (item.type) {
    case "nebula-glow":
      continuousAnimate = { scale: [1, 1.08, 0.95, 1], opacity: [targetOpacity, targetOpacity * 1.2, targetOpacity * 0.9, targetOpacity] }
      continuousTransition = { duration: 87, repeat: Infinity, ease: "easeInOut", times: [0, 0.4, 0.8, 1], delay: idx * 1.7 }
      break
    case "galaxy":
      continuousAnimate = { rotate: [item.rotate, item.rotate + 8, item.rotate - 2, item.rotate], scale: [1, 1.03, 0.98, 1], opacity: [targetOpacity, targetOpacity * 1.15, targetOpacity * 0.9, targetOpacity] }
      continuousTransition = { duration: 63, repeat: Infinity, ease: "easeInOut", times: [0, 0.35, 0.75, 1], delay: idx * 2.1 }
      break
    case "flower-deep":
      continuousAnimate = { scale: [0.95, 1.04, 0.95], opacity: [targetOpacity * 0.8, targetOpacity * 1.5, targetOpacity * 0.8] }
      continuousTransition = { duration: 37, repeat: Infinity, ease: "easeInOut", times: [0, 0.5, 1], delay: idx * 1.4 }
      break
    case "branch":
      continuousAnimate = { rotate: [item.rotate, item.rotate + 4, item.rotate - 1, item.rotate], y: ["0%", "2%", "0%"], opacity: [targetOpacity, targetOpacity * 0.7, targetOpacity] }
      continuousTransition = { duration: 43, repeat: Infinity, ease: "easeInOut", times: [0, 0.45, 0.85, 1], delay: idx * 3.2 }
      break
    case "branch-small":
      continuousAnimate = { rotate: [item.rotate, item.rotate - 3, item.rotate + 2, item.rotate], x: ["0%", "-1.5%", "0%"] }
      continuousTransition = { duration: 29, repeat: Infinity, ease: "easeInOut", times: [0, 0.5, 1], delay: idx * 1.5 }
      break
    case "river":
      continuousAnimate = { y: ["0%", "5%", "0%"], x: ["0%", "-3%", "0%"], scale: [1, 1.03, 1] }
      continuousTransition = { duration: 53, repeat: Infinity, ease: "easeInOut", times: [0, 0.5, 1], delay: idx * 2.7 }
      break
    case "orbital":
      continuousAnimate = { y: ["0%", "3%", "0%"], x: ["0%", "3%", "0%"], rotate: [item.rotate, item.rotate + 3, item.rotate - 1, item.rotate] }
      continuousTransition = { duration: 71, repeat: Infinity, ease: "easeInOut", times: [0, 0.4, 0.8, 1], delay: idx * 4.1 }
      break
    case "interactive-green-ecosystem":
      continuousAnimate = { rotate: [item.rotate, item.rotate - 5, item.rotate + 3, item.rotate], opacity: [targetOpacity, targetOpacity * 1.4, targetOpacity * 0.7, targetOpacity] }
      continuousTransition = { duration: 47, repeat: Infinity, ease: "linear", times: [0, 0.3, 0.7, 1], delay: idx * 0.8 }
      break
    default:
      continuousAnimate = { rotate: [item.rotate, item.rotate + (idx % 2 === 0 ? 5 : -5), item.rotate], y: ["0%", "2%", "0%"] }
      continuousTransition = { duration: item.floatDuration, repeat: Infinity, ease: "easeInOut", delay: idx * 1.3 }
  }

  // Radial masks for cinematic blending (cheap; no live blur filters anymore).
  let maskImage: string | undefined = "radial-gradient(circle at center, black 15%, transparent 60%)"

  if (item.type === "nebula-glow") {
     maskImage = undefined // the gradient already self-fades
  } else if (item.type === "galaxy") {
     maskImage = "radial-gradient(circle at center, black 25%, transparent 65%)"
  } else if (item.type === "river" || item.type === "orbital") {
     maskImage = "radial-gradient(circle at center, black 20%, transparent 65%)"
  } else if (item.type === "flower-deep") {
     maskImage = "radial-gradient(circle at center, black 20%, transparent 70%)"
  } else if (item.type === "branch" || item.type === "branch-small") {
     maskImage = "radial-gradient(circle at center, black 10%, transparent 65%)"
  }

  // Network pulse lines for nerdy ecosystem
  const showNetworkLines = item.type === "interactive-green-ecosystem" && hoverSide === "nerdy"
  const isScrollDrivenTrail = item.type === "trail"

  const revealTarget = item.type !== "footer-bloom" && !isScrollDrivenTrail || hoverSide
    ? { opacity: targetOpacity, scale: targetScale, rotate: targetRotate, y: targetY }
    : undefined

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        top: item.top,
        left: item.left,
        width: item.width,
        height: item.height,
        x: mouseDriven ? springMX : 0,
        y: !motionEnabled ? 0 : isScrollDrivenTrail ? trailTranslateY : scrollOffset,
        zIndex: item.zIndex,
        opacity: !motionEnabled
          ? undefined
          : item.type === "footer-bloom" && !hoverSide
            ? footerOpacityScroll
            : isScrollDrivenTrail && !hoverSide
              ? trailOpacityScroll
              : undefined,
        scale: motionEnabled && item.type === "footer-bloom" && !hoverSide ? footerScale : undefined,
        rotate: motionEnabled && item.type === "footer-bloom" && !hoverSide ? footerRotate : undefined,
      }}
    >
      {showNetworkLines && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.25, scale: 1.15 }}
          transition={{ duration: 3, delay: 0.1, ease: "easeOut" }}
          className="absolute inset-0 border border-[#7fb07f]/20 rounded-full mix-blend-screen shadow-[0_0_50px_rgba(127,176,127,0.15)]"
        />
      )}
      <motion.div style={{ y: mouseDriven ? springMY : 0 }} className="w-full h-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: "2%" }}
          animate={revealTarget}
          transition={motionEnabled ? {
            opacity: { duration: item.type === "nebula-glow" || item.type === "galaxy" ? 8 : item.type === "flower-deep" ? 15 : 4, delay: item.delay || 0, ease: [0.16, 1, 0.3, 1] },
            scale: { duration: 5, ease: [0.16, 1, 0.3, 1], delay: item.delay || 0 },
            y: { duration: 5, ease: [0.16, 1, 0.3, 1], delay: item.delay || 0 },
            rotate: { duration: 5, ease: [0.16, 1, 0.3, 1], delay: item.delay || 0 },
          } : { duration: 0 }}
          className="w-full h-full relative mix-blend-screen"
        >
          <motion.div
            animate={motionEnabled ? continuousAnimate : undefined}
            transition={motionEnabled ? continuousTransition : { duration: 0 }}
            className="w-full h-full relative"
            style={{
               WebkitMaskImage: maskImage,
               maskImage: maskImage,
            }}
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

export function FloatingSvgs({ hoverSide }: { hoverSide: "nerdy" | "creative" | null }) {
  const [mounted, setMounted] = useState(false)
  const [windowWidth, setWindowWidth] = useState(1000)
  const prefersReduced = useReducedMotion()
  const { scrollY, scrollYProgress } = useScroll()

  // Slower, smoother parallax based on scroll
  const scrollYSpring = useSpring(scrollY, { damping: 50, stiffness: 300 })

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const motionEnabled = mounted && !prefersReduced

  useEffect(() => {
    setMounted(true)
    setWindowWidth(window.innerWidth)
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener("resize", handleResize)

    // Only track the pointer when motion is allowed and we have a fine pointer (mouse).
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
        />
      ))}
    </div>
  )
}
