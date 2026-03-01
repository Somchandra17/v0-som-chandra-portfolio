"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

export function Loader({ onComplete }: { onComplete: () => void }) {
  const [text, setText] = useState("")
  const [showCursor, setShowCursor] = useState(true)
  const [phase, setPhase] = useState<"typing" | "done" | "exit">("typing")
  const fullName = "Som Chandra"

  useEffect(() => {
    let i = 0
    const typeInterval = setInterval(() => {
      if (i < fullName.length) {
        setText(fullName.slice(0, i + 1))
        i++
      } else {
        clearInterval(typeInterval)
        setTimeout(() => setPhase("done"), 400)
        setTimeout(() => setPhase("exit"), 1000)
        setTimeout(() => onComplete(), 1600)
      }
    }, 100)

    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev)
    }, 500)

    return () => {
      clearInterval(typeInterval)
      clearInterval(cursorInterval)
    }
  }, [onComplete])

  return (
    <AnimatePresence>
      {phase !== "exit" ? null : null}
      <motion.div
        className="fixed inset-0 z-[10000] flex items-center justify-center bg-[#000000]"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        animate={phase === "exit" ? { opacity: 0, scale: 1.1 } : { opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
      >
        <motion.h1
          className="font-sans text-4xl font-bold tracking-tighter text-[#ffffff] sm:text-6xl md:text-8xl"
          animate={phase === "done" ? { scale: [1, 1.05, 1], letterSpacing: ["-.05em", "-.02em", "-.05em"] } : {}}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        >
          {text}
          <span
            className="inline-block w-[3px] h-[1em] bg-[#ffffff] ml-1 align-middle"
            style={{ opacity: showCursor ? 1 : 0 }}
          />
        </motion.h1>
      </motion.div>
    </AnimatePresence>
  )
}
