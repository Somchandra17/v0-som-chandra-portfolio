"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import { usePathname } from "next/navigation"
import { AnimatePresence } from "framer-motion"
import { PaperOverlay } from "@/components/grain-overlay"
import { Loader } from "@/components/loader"

const LoadingContext = createContext<{ loading: boolean }>({ loading: false })
export function useLoading() {
  return useContext(LoadingContext)
}

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
    window.scrollTo({ top: 0, left: 0, behavior: "auto" })
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
    <LoadingContext.Provider value={{ loading }}>
      <PaperOverlay />
      <div className="curved-paper-bg" aria-hidden />

      {/* Content is always mounted so the homepage's cosmic SVGs can build up *during* the
          loader and continue seamlessly into the page. The loader overlay sits on top (z-200)
          and fades to reveal them; page.tsx gates its own hero/sections on `loading`. */}
      <div className="float-content">{children}</div>

      <AnimatePresence mode="wait">
        {loading && <Loader key="loader" onComplete={handleLoadComplete} />}
      </AnimatePresence>
    </LoadingContext.Provider>
  )
}
