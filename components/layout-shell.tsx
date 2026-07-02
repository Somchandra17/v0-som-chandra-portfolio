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

/**
 * Children are ALWAYS rendered (server HTML carries the real content); the intro is an
 * overlay. The pre-paint inline script in app/layout.tsx sets `<html data-intro="pending">`
 * when the loader should play, and the CSS veil in globals.css hides content until this
 * component takes over: it flips the attribute to "active" (the loader overlay owns the
 * screen, the cosmic scene builds underneath for the hand-off) and removes it on completion.
 */
export function LayoutShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual"
    }
  }, [])

  // Take over from the pre-paint gate. SSR and the first client render both use
  // loading=false (no hydration mismatch); the CSS veil hides that frame when pending.
  useEffect(() => {
    const root = document.documentElement
    if (root.dataset.intro === "pending") {
      setLoading(true)
      root.dataset.intro = "active"
    }
  }, [])

  useEffect(() => {
    if (loading) return
    window.scrollTo({ top: 0, left: 0, behavior: "auto" })
  }, [pathname, loading])

  // If the visitor leaves home before the intro finishes, resolve it so it doesn't
  // linger or replay when they return — the loader is home-only.
  useEffect(() => {
    if (loading && pathname !== "/") {
      setLoading(false)
      delete document.documentElement.dataset.intro
    }
  }, [pathname, loading])

  const handleLoadComplete = useCallback(() => {
    try {
      sessionStorage.setItem("som-loaded", "1")
    } catch {
      // Storage can be unavailable in hardened browser contexts.
    }
    setLoading(false)
    delete document.documentElement.dataset.intro
  }, [])

  return (
    <LoadingContext.Provider value={{ loading }}>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[300] focus:px-4 focus:py-2 focus:bg-ink-900 focus:text-ink-100 focus:border focus:border-ink-600 focus:font-mono focus:text-sm"
      >
        skip to content
      </a>
      <PaperOverlay />
      <div className="curved-paper-bg" aria-hidden />

      {/* Content is always mounted so the homepage's cosmic SVGs can build up *during* the
          loader and continue seamlessly into the page. The loader overlay sits on top (z-200)
          and fades to reveal them; page.tsx gates its entrance animations on `loading`. */}
      <div className="float-content">{children}</div>

      {/* mode="sync": the hero stays mounted while the loader exits, so the name hand-off
          morph can land on the live hero name. */}
      <AnimatePresence mode="sync">
        {loading && pathname === "/" && <Loader key="loader" onComplete={handleLoadComplete} />}
      </AnimatePresence>
    </LoadingContext.Provider>
  )
}
