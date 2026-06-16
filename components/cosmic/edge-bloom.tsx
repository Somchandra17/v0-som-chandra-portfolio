"use client"

import { motion, useScroll, useTransform, useReducedMotion, type MotionValue } from "framer-motion"

type Edge = "top" | "bottom"

// Flowers that bloom in from an edge as you reach it. Reused cosmic assets; NORMAL compositing
// (no mix-blend / no live filter on a moving element) so scrolling never re-composites a blend
// surface → no jitter. A soft radial mask + brightness bake keeps them luminous without screen.
const TOP_FLOWERS = [
  { asset: "petals-1000", left: "2%", size: "24vw", rotate: -12 },
  { asset: "sparkle-1200", left: "73%", size: "22vw", rotate: 15 },
]
const BOTTOM_FLOWERS = [
  { asset: "petals-1000", left: "74%", size: "26vw", rotate: -6 },
]

const MASK = "radial-gradient(circle at center, black 18%, transparent 70%)"

function Bloom({
  flower,
  bloom,
  edge,
  delay,
}: {
  flower: { asset: string; left: string; size: string; rotate: number }
  bloom: MotionValue<number>
  edge: Edge
  delay: number
}) {
  // Staggered, eased ranges give each flower its own organic "opening" as the edge is reached.
  const start = delay
  const opacity = useTransform(bloom, [start, start + 0.5, 1], [0, 0.55, 0.92])
  const scale = useTransform(bloom, [start, 1], [0.4, 1])
  const rotate = useTransform(bloom, [start, 1], [flower.rotate - 16, flower.rotate])
  const y = useTransform(bloom, [start, 1], [edge === "top" ? "-26%" : "26%", "0%"])

  return (
    <motion.div
      className="absolute"
      style={{
        left: flower.left,
        [edge]: "-7vw",
        width: flower.size,
        height: flower.size,
        opacity,
        scale,
        rotate,
        y,
        transformOrigin: edge === "top" ? "center top" : "center bottom",
        WebkitMaskImage: MASK,
        maskImage: MASK,
        filter: "brightness(1.18) saturate(1.05)",
        willChange: "transform, opacity",
      }}
    >
      <picture className="block w-full h-full">
        <source srcSet={`/cosmic/${flower.asset}.avif`} type="image/avif" />
        <source srcSet={`/cosmic/${flower.asset}.webp`} type="image/webp" />
        <img
          src={`/cosmic/${flower.asset}.webp`}
          alt=""
          aria-hidden="true"
          className="w-full h-full object-contain"
          loading="lazy"
          decoding="async"
          draggable={false}
        />
      </picture>
    </motion.div>
  )
}

export function EdgeBloom() {
  const prefersReduced = useReducedMotion()
  const { scrollYProgress } = useScroll()

  // Top edge blooms at the very start (and again when you scroll back up); bottom edge near the end.
  const topBloom = useTransform(scrollYProgress, [0, 0.07], [1, 0])
  const bottomBloom = useTransform(scrollYProgress, [0.92, 1], [0, 1])

  if (prefersReduced) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-[2] overflow-hidden" aria-hidden="true">
      {TOP_FLOWERS.map((f, i) => (
        <Bloom key={`top-${i}`} flower={f} bloom={topBloom} edge="top" delay={i * 0.12} />
      ))}
      {BOTTOM_FLOWERS.map((f, i) => (
        <Bloom key={`bot-${i}`} flower={f} bloom={bottomBloom} edge="bottom" delay={i * 0.12} />
      ))}
    </div>
  )
}
