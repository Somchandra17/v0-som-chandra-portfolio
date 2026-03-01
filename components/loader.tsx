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
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{ duration: 1.2, repeat: Infinity }}
              style={{ boxShadow: "0 0 15px rgba(240, 198, 207, 0.5)" }}
            />

            {/* Message */}
            <AnimatePresence mode="wait">
              <motion.p
                key={msgIndex}
                initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
                transition={{ duration: 0.25 }}
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Name reveal */}
            <motion.h1
              className="text-5xl md:text-7xl font-bold text-[#e8e8e8] tracking-tight"
              initial={{ opacity: 0, letterSpacing: "0.5em" }}
              animate={{ opacity: 1, letterSpacing: "0em" }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              {"som"}
              <motion.span
                className="text-[#f0c6cf]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                .
              </motion.span>
            </motion.h1>

            <motion.p
              className="font-mono text-xs text-[#555] mt-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              hacker / photographer / overthinker
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
