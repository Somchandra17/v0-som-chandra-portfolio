"use client"

import { useEffect, useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"

const messages = [
  "hold on, looking for my other sock...",
  "almost there, untangling headphones...",
  "oops, wrong folder...",
  "okay found it, one sec...",
]

export function Loader({ onComplete }: { onComplete: () => void }) {
  const [msgIndex, setMsgIndex] = useState(0)
  const [phase, setPhase] = useState<"messages" | "name" | "done">("messages")

  const stableComplete = useCallback(onComplete, [onComplete])

  useEffect(() => {
    const timers: NodeJS.Timeout[] = []

    // Cycle through messages
    messages.forEach((_, i) => {
      if (i > 0) {
        timers.push(setTimeout(() => setMsgIndex(i), i * 1000))
      }
    })

    // Show name after messages
    timers.push(setTimeout(() => setPhase("name"), messages.length * 1000))

    // Complete after name
    timers.push(setTimeout(() => {
      setPhase("done")
      stableComplete()
    }, messages.length * 1000 + 1000))

    return () => timers.forEach(clearTimeout)
  }, [stableComplete])

  return (
    <motion.div
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#080a0e]"
      animate={phase === "done" ? { opacity: 0, y: -30 } : { opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    >
      <div className="pointer-events-none absolute inset-0 opacity-50">
        <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.18),transparent)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),transparent_32%)]" />
      </div>

      <AnimatePresence mode="wait">
        {phase === "messages" && (
          <motion.div
            key="messages"
            className="note-frame flex min-w-[min(30rem,calc(100vw-3rem))] flex-col items-center px-7 py-8"
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {/* Pulsing dot */}
            <motion.div
              className="mb-8 h-3 w-3 bg-[#f0c6cf]"
              animate={{
                scale: [1, 1.32, 1],
                opacity: [0.6, 1, 0.6],
              }}
              transition={{ duration: 1.4, repeat: Infinity, ease: [0.45, 0, 0.55, 1] }}
              style={{ boxShadow: "0 0 14px rgba(240, 198, 207, 0.35)" }}
            />

            {/* Message */}
            <AnimatePresence mode="wait">
              <motion.p
                key={msgIndex}
                initial={{ opacity: 0, y: 10, filter: "blur(6px)", scale: 0.98 }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }}
                exit={{ opacity: 0, y: -8, filter: "blur(4px)", scale: 0.98 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="text-center font-mono text-sm text-[#e8e8e8]"
              >
                {messages[msgIndex]}
              </motion.p>
            </AnimatePresence>

            {/* Dots progress */}
            <div className="mt-6 flex gap-2">
              {messages.map((_, i) => (
                <motion.div
                  key={i}
                  className="h-1"
                  animate={{
                    width: i <= msgIndex ? 22 : 8,
                    backgroundColor: i <= msgIndex ? "#f0c6cf" : "#333",
                  }}
                  transition={{ duration: 0.3 }}
                />
              ))}
            </div>
          </motion.div>
        )}

        {phase === "name" && (
          <motion.div
            key="name"
            className="note-frame flex min-w-[min(30rem,calc(100vw-3rem))] flex-col items-center px-7 py-9"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Name reveal */}
            <motion.h1
              className="text-5xl md:text-7xl font-bold text-[#e8e8e8] tracking-tight"
              initial={{ opacity: 0, letterSpacing: "0.4em", filter: "blur(8px)" }}
              animate={{ opacity: 1, letterSpacing: "-0.02em", filter: "blur(0px)" }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              {"som"}
              <motion.span
                className="text-[#f0c6cf]"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.35, duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
              >
                .
              </motion.span>
            </motion.h1>

            <motion.p
              className="mt-3 font-mono text-xs text-[#6a7280]"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
            >
              hacker / photographer / overthinker
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
