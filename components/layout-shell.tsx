"use client"

import { useState, useCallback, useEffect, type ReactNode } from "react"
import { AnimatePresence } from "framer-motion"
import { CursorProvider } from "@/components/cursor-context"
import { CustomCursor } from "@/components/custom-cursor"
import { PaperOverlay } from "@/components/grain-overlay"
import { Loader } from "@/components/loader"

export function LayoutShell({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
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

  if (!checked) return null

  return (
    <CursorProvider>
      <CustomCursor />
      <PaperOverlay />
      <div className="curved-paper-bg" aria-hidden />

      <AnimatePresence>
        {loading && <Loader onComplete={handleLoadComplete} />}
      </AnimatePresence>

      {!loading && (
        <div className="float-content">{children}</div>
      )}
    </CursorProvider>
  )
}
