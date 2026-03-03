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
        timers.push(setTimeout(() => setMsgIndex(i), i * 600))
      }
    })

    // Show name after messages
    timers.push(setTimeout(() => setPhase("name"), messages.length * 600))

    // Complete after name
    timers.push(setTimeout(() => {
      setPhase("done")
      stableComplete()
    }, messages.length * 600 + 1200))

    return () => timers.forEach(clearTimeout)
  }, [stableComplete])

  return (
    <motion.div
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#000000]"
      animate={phase === "done" ? { opacity: 0, y: -30 } : { opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    >
      <AnimatePresence mode="wait">
        {phase === "messages" && (
          <motion.div
            key="messages"
            className="flex flex-col items-center"
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {/* Pulsing dot */}
            <motion.div
              className="w-3 h-3 rounded-full bg-[#f0c6cf] mb-8"
              animate={{
                scale: [1, 1.4, 1],
                opacity: [0.6, 1, 0.6],
              }}
              transition={{ duration: 1.4, repeat: Infinity, ease: [0.45, 0, 0.55, 1] }}
              style={{ boxShadow: "0 0 20px rgba(240, 198, 207, 0.6)" }}
            />

            {/* Message */}
            <AnimatePresence mode="wait">
              <motion.p
                key={msgIndex}
                initial={{ opacity: 0, y: 10, filter: "blur(6px)", scale: 0.98 }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }}
                exit={{ opacity: 0, y: -8, filter: "blur(4px)", scale: 0.98 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="font-mono text-sm text-[#e8e8e8]"
              >
                {messages[msgIndex]}
              </motion.p>
            </AnimatePresence>

            {/* Dots progress */}
            <div className="mt-6 flex gap-2">
              {messages.map((_, i) => (
                <motion.div
                  key={i}
                  className="h-1 rounded-full"
                  animate={{
                    width: i <= msgIndex ? 16 : 6,
                    backgroundColor: i <= msgIndex ? "#f0c6cf" : "#333",
                  }}
                  transition={{ duration: 0.3 }}
                  style={{
                    boxShadow: i <= msgIndex ? "0 0 6px rgba(240, 198, 207, 0.3)" : "none",
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}

        {phase === "name" && (
          <motion.div
            key="name"
            className="flex flex-col items-center"
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
              className="font-mono text-xs text-[#555] mt-3"
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
