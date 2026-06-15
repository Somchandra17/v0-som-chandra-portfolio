"use client"

import { useEffect, useRef, type ReactNode } from "react"
import { usePathname } from "next/navigation"
import { useReducedMotion } from "framer-motion"
import type Lenis from "lenis"

// Module-scoped singleton so non-React callers (LayoutShell's route-change scroll
// reset) can route through Lenis instead of fighting it with native scrollTo.
let lenisInstance: Lenis | null = null
export function getLenis(): Lenis | null {
  return lenisInstance
}

/**
 * Owns the single scroll authority for the app:
 *   - Lenis virtualizes the real window scroll (smooth).
 *   - GSAP's ticker drives Lenis's rAF (one loop, no double-stepping).
 *   - `lenis.on('scroll', ScrollTrigger.update)` keeps every scrubbed
 *     ScrollTrigger in sync within the same frame (no parallax jitter).
 *
 * Under `prefers-reduced-motion` it never initializes — native scroll is used,
 * and ParallaxLayer / ParticleField independently fall back to static.
 *
 * Mounted inside LayoutShell's post-loader branch, so it only starts once the
 * intro loader has finished (protects LCP, avoids scrolling under the overlay).
 */
export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const reduced = useReducedMotion()
  const refreshRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    if (reduced) return

    let disposed = false
    let cleanup: (() => void) | null = null

    void (async () => {
      const [lenisMod, gsapMod, stMod] = await Promise.all([
        import("lenis"),
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ])
      if (disposed) return

      const Lenis = lenisMod.default
      const gsap = gsapMod.gsap ?? gsapMod.default
      const ScrollTrigger = stMod.ScrollTrigger ?? stMod.default
      gsap.registerPlugin(ScrollTrigger)

      const lenis = new Lenis({
        lerp: 0.085,
        smoothWheel: true,
        wheelMultiplier: 1,
      })
      lenisInstance = lenis
      ;(window as Window & { __lenis?: Lenis }).__lenis = lenis

      const onScroll = () => ScrollTrigger.update()
      lenis.on("scroll", onScroll)

      const tick = (time: number) => lenis.raf(time * 1000)
      gsap.ticker.add(tick)
      gsap.ticker.lagSmoothing(0)

      // Recompute trigger positions now that Lenis owns scroll.
      refreshRef.current = () => ScrollTrigger.refresh()
      ScrollTrigger.refresh()

      cleanup = () => {
        gsap.ticker.remove(tick)
        lenis.off("scroll", onScroll)
        ScrollTrigger.getAll().forEach((t) => t.kill())
        lenis.destroy()
        if (lenisInstance === lenis) lenisInstance = null
        refreshRef.current = null
      }
    })()

    return () => {
      disposed = true
      cleanup?.()
    }
  }, [reduced])

  // On route change, content height changes — ScrollTrigger must recompute.
  // (The actual scroll-to-top is owned by LayoutShell, Lenis-aware.)
  useEffect(() => {
    if (reduced) return
    const id = window.setTimeout(() => refreshRef.current?.(), 120)
    return () => window.clearTimeout(id)
  }, [pathname, reduced])

  return <>{children}</>
}
