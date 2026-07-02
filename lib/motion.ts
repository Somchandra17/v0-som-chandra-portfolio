/**
 * The motion vocabulary. Four named moves instead of one generic fadeUp:
 *
 *  - rise:    prose/sections drifting up into place (shared)
 *  - settle:  cards landing with a slight overshoot (shared, paper-card feel)
 *  - type:    nerdy headers "typing" in (per-character, see <TypeIn/>)
 *  - develop: creative images exposing from dark (see <DevelopIn/>)
 *
 * Per-world timing lives here so pages stop hand-rolling `{opacity:0,y:20}`.
 */
import type { Variants } from "framer-motion"
import type { World } from "@/lib/tokens"

type Ease = [number, number, number, number]

export const EASE = {
  out: [0.22, 1, 0.36, 1] as Ease,
  snap: [0.16, 1, 0.3, 1] as Ease,
  soft: [0.33, 1, 0.68, 1] as Ease,
  spring: [0.34, 1.56, 0.64, 1] as Ease,
}

/** World temperament: nerdy is quick and mechanical, creative is slow and soft. */
export const WORLD_TIMING: Record<World, { duration: number; ease: Ease }> = {
  nerdy: { duration: 0.38, ease: EASE.snap },
  creative: { duration: 0.65, ease: EASE.soft },
}

export function riseVariants(world: World | null): Variants {
  const t = world ? WORLD_TIMING[world] : { duration: 0.5, ease: EASE.out }
  return {
    hidden: { opacity: 0, y: world === "creative" ? 24 : 14 },
    shown: {
      opacity: 1,
      y: 0,
      transition: { duration: t.duration, ease: t.ease },
    },
  }
}

export function settleVariants(world: World | null, index = 0): Variants {
  const t = world ? WORLD_TIMING[world] : { duration: 0.5, ease: EASE.out }
  return {
    hidden: { opacity: 0, y: 20, rotate: world === "creative" ? -0.6 : 0 },
    shown: {
      opacity: 1,
      y: 0,
      rotate: 0,
      transition: {
        duration: t.duration,
        ease: t.ease,
        delay: Math.min(index, 6) * (world === "nerdy" ? 0.05 : 0.08),
      },
    },
  }
}

export const inViewProps = {
  initial: "hidden" as const,
  whileInView: "shown" as const,
  viewport: { once: true, margin: "-60px" } as const,
}
