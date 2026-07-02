"use client"

import { motion, useReducedMotion } from "framer-motion"
import type { ReactNode } from "react"
import { EASE } from "@/lib/motion"

/**
 * Darkroom reveal for the creative world: the child "develops" — exposing from dark
 * with a blur/brightness ramp and a slight settle rotation, like a print in a tray.
 * Wrap images or print-like cards. Reduced motion renders the final state.
 */
export function DevelopIn({
  children,
  className,
  index = 0,
  rotate = -1.2,
  immediate = false,
}: {
  children: ReactNode
  className?: string
  index?: number
  /** resting tilt is 0; this is the entry tilt in degrees */
  rotate?: number
  /** Develop on mount instead of on scroll — for the initial above-the-fold batch. */
  immediate?: boolean
}) {
  const prefersReduced = useReducedMotion()

  if (prefersReduced) {
    return <div className={className}>{children}</div>
  }

  const developed = {
    opacity: 1,
    scale: 1,
    rotate: 0,
    filter: "brightness(1) blur(0px) saturate(1)",
  }

  return (
    <motion.div
      className={className}
      initial={{
        opacity: 0,
        scale: 0.985,
        rotate,
        filter: "brightness(0.35) blur(6px) saturate(0.7)",
      }}
      // First-pixel trigger (no negative margin): a card peeking at the fold must never
      // sit in the dark develop state looking like a stuck load.
      {...(immediate
        ? { animate: developed }
        : { whileInView: developed, viewport: { once: true as const, amount: 0.01 } })}
      transition={{
        duration: 0.85,
        delay: Math.min(index, 5) * 0.09,
        ease: EASE.soft,
        filter: { duration: 1.05, delay: Math.min(index, 5) * 0.09 },
      }}
    >
      {children}
    </motion.div>
  )
}
