"use client"

import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { getShrinkWrapWidth, fonts } from "@/lib/pretext"

interface PretextHighlightProps {
  lines: string[]
  currentIndex: number
  className?: string
  fontSize?: number
  bgColor?: string
  textColor?: string
  paddingX?: number
  paddingY?: number
}

/**
 * A cycling text component that uses pretext to measure exact text width,
 * creating a perfectly-fitted highlight background that shrink-wraps to the text.
 */
export function PretextHighlight({
  lines,
  currentIndex,
  className = "",
  fontSize = 24,
  bgColor = "#e8e8e8",
  textColor = "#0a0a0a",
  paddingX = 8,
  paddingY = 2,
}: PretextHighlightProps) {
  const [measurements, setMeasurements] = useState<Map<string, number>>(new Map())
  const [containerWidth, setContainerWidth] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // Pre-measure all lines on mount and when lines change
  useEffect(() => {
    const measureLines = () => {
      const font = fonts.bold(fontSize)
      const newMeasurements = new Map<string, number>()
      
      lines.forEach((line) => {
        const width = getShrinkWrapWidth(line, font, 1000)
        newMeasurements.set(line, width)
      })
      
      setMeasurements(newMeasurements)
    }

    // Wait for fonts to load
    if (typeof document !== "undefined" && document.fonts) {
      document.fonts.ready.then(measureLines)
    } else {
      measureLines()
    }
  }, [lines, fontSize])

  // Track the available width so a long line scales down to fit instead of clipping (mobile).
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    setContainerWidth(el.clientWidth)
    if (typeof ResizeObserver === "undefined") return
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) setContainerWidth(entry.contentRect.width)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  if (lines.length === 0) return null

  const safeIndex = Math.min(Math.max(currentIndex, 0), lines.length - 1)
  const currentLine = lines[safeIndex] ?? ""
  const fallbackWidth = Math.ceil(currentLine.length * fontSize * 0.58)
  const currentWidth = measurements.get(currentLine) || fallbackWidth

  // On narrow viewports the measured line can exceed the container — scale the whole pill down
  // to fit (transform only, GPU-cheap) so it never clips mid-word. Left origin keeps it aligned.
  const lineWidth = currentWidth + paddingX * 2
  const fitScale = containerWidth > 0 && lineWidth > containerWidth ? containerWidth / lineWidth : 1

  return (
    <div ref={containerRef} className="relative overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={safeIndex}
          className={`inline-flex items-center ${className}`}
          style={{ transformOrigin: "left center" }}
          initial={{ opacity: 0, y: 24, filter: "blur(4px)", scale: fitScale }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)", scale: fitScale }}
          exit={{ opacity: 0, y: -20, filter: "blur(2px)", scale: fitScale }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Background highlight - animated to exact width */}
          <motion.span
            className="absolute inset-0"
            style={{ backgroundColor: bgColor }}
            initial={{ width: 0 }}
            animate={{ 
              width: currentWidth > 0 ? currentWidth + paddingX * 2 : "auto",
            }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
          {/* Text */}
          <span
            className="relative font-bold whitespace-nowrap"
            style={{ 
              color: textColor,
              fontSize: `${fontSize}px`,
              paddingLeft: `${paddingX}px`,
              paddingRight: `${paddingX}px`,
              paddingTop: `${paddingY}px`,
              paddingBottom: `${paddingY}px`,
            }}
          >
            {currentLine}
          </span>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

/**
 * Simpler version that just returns the shrink-wrapped width for a text string.
 * Use this for inline measurements without the full component.
 */
export function usePretextWidth(text: string, fontSize: number = 16): number {
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const measure = () => {
      const font = fonts.bold(fontSize)
      setWidth(getShrinkWrapWidth(text, font, 1000))
    }

    if (typeof document !== "undefined" && document.fonts) {
      document.fonts.ready.then(measure)
    } else {
      measure()
    }
  }, [text, fontSize])

  return width
}
