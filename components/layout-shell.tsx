"use client"

import { useState, useCallback, useEffect, type ReactNode } from "react"
import { AnimatePresence, motion } from "framer-motion"
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
