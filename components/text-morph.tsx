"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface TextMorphProps {
  text: string
  className?: string
  style?: React.CSSProperties
}

/**
 * Character-level morphing text animation.
 * Characters individually blur out / in as they transform from one string to another.
 */
export function TextMorph({ text, className, style }: TextMorphProps) {
  const [displayText, setDisplayText] = useState(text)
  const [isAnimating, setIsAnimating] = useState(false)
  const prevText = useRef(text)

  // Build a character map that transitions old -> new with staggered timing
  const morphSteps = useMemo(() => {
    const maxLen = Math.max(prevText.current.length, text.length)
    const steps: { char: string; key: string; delay: number }[] = []
    for (let i = 0; i < maxLen; i++) {
      steps.push({
        char: text[i] || "",
        key: `${text}-${i}`,
        delay: i * 0.04,
      })
    }
    return steps
  }, [text])

  useEffect(() => {
    if (text !== prevText.current) {
      setIsAnimating(true)
      prevText.current = text

      // Brief stagger: set display text after a tiny delay so exit plays first
      const timeout = setTimeout(() => {
        setDisplayText(text)
        setIsAnimating(false)
      }, 80)
      return () => clearTimeout(timeout)
    }
  }, [text])

  // When not animating, just render the characters of the current text
  const chars = displayText.split("")

  return (
    <span className={className} style={style} aria-label={text}>
      <AnimatePresence mode="popLayout">
        {chars.map((char, i) => (
          <motion.span
            key={`${displayText}-${i}`}
            initial={{ opacity: 0, filter: "blur(8px)", y: 4, scale: 0.8 }}
            animate={{ opacity: 1, filter: "blur(0px)", y: 0, scale: 1 }}
            exit={{ opacity: 0, filter: "blur(8px)", y: -4, scale: 0.8 }}
            transition={{
              duration: 0.25,
              delay: i * 0.035,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="inline-block"
            style={{ minWidth: char === " " ? "0.25em" : undefined }}
          >
            {char}
          </motion.span>
        ))}
      </AnimatePresence>
    </span>
  )
}
