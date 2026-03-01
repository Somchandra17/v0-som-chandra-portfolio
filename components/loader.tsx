"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

const doodles = [
  "( . Y . )",
  "~(^-^)~",
  "*scribbles furiously*",
  "loading my mess...",
  "hold on, spilled coffee",
  "where did I put that page...",
]

export function Loader({ onComplete }: { onComplete: () => void }) {
  const [doodle, setDoodle] = useState(doodles[0])
  const [phase, setPhase] = useState<"loading" | "exit">("loading")

  useEffect(() => {
    let i = 0
    const interval = setInterval(() => {
      i = (i + 1) % doodles.length
      setDoodle(doodles[i])
    }, 400)

    setTimeout(() => {
      clearInterval(interval)
      setPhase("exit")
    }, 2000)

    setTimeout(() => onComplete(), 2600)

    return () => clearInterval(interval)
  }, [onComplete])

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[10000] flex flex-col items-center justify-center"
        style={{ background: '#f9f5d7' }}
        initial={{ opacity: 1 }}
        animate={phase === "exit" ? { opacity: 0, y: -40 } : { opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
      >
        {/* Coffee stain in corner */}
        <div className="absolute top-20 right-20 w-40 h-40 rounded-full opacity-10"
          style={{ background: 'radial-gradient(ellipse, #a08450 0%, transparent 70%)' }} />
        
        {/* Scribble animation */}
        <motion.div
          animate={{ rotate: [-2, 2, -1, 1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        >
          <svg width="120" height="40" viewBox="0 0 120 40" className="mb-6">
            <motion.path
              d="M5,20 Q15,5 30,20 T60,20 T90,20 T120,20"
              fill="none"
              stroke="#cc241d"
              strokeWidth="2"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            />
          </svg>
        </motion.div>

        <motion.p
          className="text-2xl"
          style={{ fontFamily: "'Caveat', cursive", color: '#7c6f64' }}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 0.8, repeat: Infinity }}
        >
          {doodle}
        </motion.p>
      </motion.div>
    </AnimatePresence>
  )
}
