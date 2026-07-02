"use client"

import { motion } from "framer-motion"
import type { ReactNode } from "react"
import { useWorld } from "@/components/world-context"
import { riseVariants, settleVariants, inViewProps } from "@/lib/motion"

/**
 * The one in-view reveal wrapper. Replaces hand-rolled `{opacity:0,y:20}` fadeUps with
 * the per-world vocabulary: nerdy rises quick + mechanical, creative drifts soft + slow.
 * `move="settle"` adds the card-landing overshoot (slight rotation on creative).
 */
export function SectionReveal({
  children,
  move = "rise",
  index = 0,
  className,
  as = "div",
}: {
  children: ReactNode
  move?: "rise" | "settle"
  index?: number
  className?: string
  as?: "div" | "section" | "li"
}) {
  const world = useWorld()
  const variants = move === "settle" ? settleVariants(world, index) : riseVariants(world)
  const Comp = motion[as]

  return (
    <Comp className={className} variants={variants} {...inViewProps}>
      {children}
    </Comp>
  )
}
