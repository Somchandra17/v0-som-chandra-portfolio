"use client"

import { useState, useCallback, useEffect, type ReactNode } from "react"
import { AnimatePresence } from "framer-motion"
import { CustomCursor } from "@/components/custom-cursor"
import { PaperOverlay } from "@/components/grain-overlay"
import { Loader } from "@/components/loader"

export function LayoutShell({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    // only show loader once per browser session
    const seen = sessionStorage.getItem("som-loaded")
    if (seen) {
      setLoading(false)
    }
    setChecked(true)
  }, [])

  const handleLoadComplete = useCallback(() => {
    sessionStorage.setItem("som-loaded", "1")
    setLoading(false)
  }, [])

  // don't render anything until we've checked sessionStorage (avoids flash)
  if (!checked) return null

  return (
    <>
      <CustomCursor />
      <PaperOverlay />

      {/* curved ruled-paper background */}
      <div className="curved-paper-bg" aria-hidden />

      <AnimatePresence>
        {loading && <Loader onComplete={handleLoadComplete} />}
      </AnimatePresence>

      {!loading && (
        <div className="float-content">{children}</div>
      )}
    </>
  )
}
