"use client"

import { useState, useCallback, useEffect, type ReactNode } from "react"
import { usePathname } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { PaperOverlay } from "@/components/grain-overlay"
import { Loader } from "@/components/loader"
import { SmoothScrollProvider, getLenis } from "@/components/motion/smooth-scroll-provider"

export function LayoutShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [loading, setLoading] = useState(true)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual"
    }
  }, [])

  useEffect(() => {
    try {
      const navEntries = typeof performance !== "undefined"
        ? (performance.getEntriesByType("navigation") as PerformanceNavigationTiming[])
        : []
      const navType = navEntries[0]?.type

      if (navType === "reload") {
        sessionStorage.removeItem("som-loaded")
        setChecked(true)
        return
      }

      const seen = sessionStorage.getItem("som-loaded")
      if (seen) {
        setLoading(false)
      }
      setChecked(true)
    } catch {
      setChecked(true)
    }
  }, [])

  useEffect(() => {
    if (!checked || loading) return
    // Lenis owns scroll when active; native scrollTo fights it.
    const lenis = getLenis()
    if (lenis) {
      lenis.scrollTo(0, { immediate: true })
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" })
    }
  }, [pathname, checked, loading])

  const handleLoadComplete = useCallback(() => {
    try {
      sessionStorage.setItem("som-loaded", "1")
    } catch {
      // Storage can be unavailable in hardened browser contexts.
    }
    setLoading(false)
  }, [])

  if (!checked) return null

  return (
    <>
      <PaperOverlay />
      <div className="curved-paper-bg" aria-hidden />

      <AnimatePresence mode="wait">
        {loading && <Loader key="loader" onComplete={handleLoadComplete} />}
      </AnimatePresence>

      <AnimatePresence>
        {!loading && (
          <SmoothScrollProvider>
            <motion.div
              className="float-content"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {children}
            </motion.div>
          </SmoothScrollProvider>
        )}
      </AnimatePresence>
    </>
  )
}
