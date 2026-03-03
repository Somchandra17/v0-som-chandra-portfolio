"use client"

import { useState, useCallback, useEffect, type ReactNode } from "react"
import { usePathname } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { PaperOverlay } from "@/components/grain-overlay"
import { Loader } from "@/components/loader"

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
    // Detect hard refresh (reload) vs soft navigation
    const navEntries = performance.getEntriesByType("navigation") as PerformanceNavigationTiming[]
    const navType = navEntries[0]?.type
    
    // Show animation on hard refresh (reload) or first visit
    // Skip animation only on soft navigations (back/forward, navigate within app)
    if (navType === "reload") {
      // Hard refresh - always show animation
      sessionStorage.removeItem("som-loaded")
      setChecked(true)
    } else {
      // Check if we've seen the animation this session
      const seen = sessionStorage.getItem("som-loaded")
      if (seen) {
        setLoading(false)
      }
      setChecked(true)
    }
  }, [])

  useEffect(() => {
    if (!checked || loading) return
    window.scrollTo({ top: 0, left: 0, behavior: "auto" })
  }, [pathname, checked, loading])

  const handleLoadComplete = useCallback(() => {
    sessionStorage.setItem("som-loaded", "1")
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
          <motion.div
            className="float-content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
