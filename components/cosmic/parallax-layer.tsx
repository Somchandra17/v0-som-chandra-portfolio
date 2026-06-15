"use client"

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react"
import { useReducedMotion } from "framer-motion"

type Props = {
  children: ReactNode
  /** Scroll parallax travel in px across the viewport pass (outer transform). */
  speed?: number
  /** Mouse parallax strength in px (inner transform). 0 disables. */
  mouse?: number
  className?: string
  style?: CSSProperties
  "aria-hidden"?: boolean
}

/**
 * Depth wrapper for a decorative cosmic layer.
 *   - outer element  → scroll parallax (GSAP ScrollTrigger scrub, transform-only)
 *   - inner element  → cursor parallax (gsap.quickTo, cheap interpolation)
 * Separating the two transforms avoids them fighting over `y`.
 *
 * Under prefers-reduced-motion this is a plain passthrough — no transforms,
 * no listeners, no ScrollTriggers created.
 */
export function ParallaxLayer({
  children,
  speed = 80,
  mouse = 0,
  className,
  style,
  "aria-hidden": ariaHidden,
}: Props) {
  const outer = useRef<HTMLDivElement>(null)
  const inner = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced) return
    let revert: (() => void) | undefined
    let removeMouse: (() => void) | undefined

    void (async () => {
      const [gsapMod, stMod] = await Promise.all([import("gsap"), import("gsap/ScrollTrigger")])
      const gsap = gsapMod.gsap ?? gsapMod.default
      const ScrollTrigger = stMod.ScrollTrigger ?? stMod.default
      gsap.registerPlugin(ScrollTrigger)

      const el = outer.current
      if (!el) return

      const ctx = gsap.context(() => {
        gsap.fromTo(
          el,
          { y: speed },
          {
            y: -speed,
            ease: "none",
            scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 1 },
          },
        )
      })
      revert = () => ctx.revert()

      if (mouse && inner.current) {
        const qx = gsap.quickTo(inner.current, "x", { duration: 0.7, ease: "power3.out" })
        const qy = gsap.quickTo(inner.current, "y", { duration: 0.7, ease: "power3.out" })
        const onMove = (e: PointerEvent) => {
          const nx = (e.clientX / window.innerWidth - 0.5) * 2
          const ny = (e.clientY / window.innerHeight - 0.5) * 2
          qx(nx * mouse)
          qy(ny * mouse)
        }
        window.addEventListener("pointermove", onMove, { passive: true })
        removeMouse = () => window.removeEventListener("pointermove", onMove)
      }
    })()

    return () => {
      revert?.()
      removeMouse?.()
    }
  }, [reduced, speed, mouse])

  return (
    <div ref={outer} className={className} style={{ willChange: "transform", ...style }} aria-hidden={ariaHidden}>
      <div ref={inner} style={mouse ? { willChange: "transform" } : undefined}>
        {children}
      </div>
    </div>
  )
}
