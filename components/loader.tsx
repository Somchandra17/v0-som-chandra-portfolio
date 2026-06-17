"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"

const messages = [
  "hold on, looking for my other sock...",
  "okay found it, one sec...",
]

const MSG_MS = 750
const NAME_MS = 1100

export function Loader({ onComplete }: { onComplete: () => void }) {
  const [msgIndex, setMsgIndex] = useState(0)
  const [phase, setPhase] = useState<"messages" | "name" | "done">("messages")
  const prefersReducedMotion = useReducedMotion()

  const stableComplete = useCallback(onComplete, [onComplete])
  const finished = useRef(false)

  const finish = useCallback(() => {
    if (finished.current) return
    finished.current = true
    setPhase("done")
    stableComplete()
  }, [stableComplete])

  // Reduced motion: skip the whole intro instantly.
  useEffect(() => {
    if (prefersReducedMotion) finish()
  }, [prefersReducedMotion, finish])

  // Let the visitor skip with a click or any key.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter" || e.key === " ") finish()
      else finish()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [finish])

  useEffect(() => {
    if (prefersReducedMotion) return
    const timers: ReturnType<typeof setTimeout>[] = []

    messages.forEach((_, i) => {
      if (i > 0) timers.push(setTimeout(() => setMsgIndex(i), i * MSG_MS))
    })
    timers.push(setTimeout(() => setPhase("name"), messages.length * MSG_MS))
    timers.push(setTimeout(finish, messages.length * MSG_MS + NAME_MS))

    return () => timers.forEach(clearTimeout)
  }, [prefersReducedMotion, finish])

  if (prefersReducedMotion) return null

  return (
    <motion.div
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center cursor-pointer"
      initial={{ opacity: 1, scale: 1, backgroundColor: "rgba(0,0,0,1)" }}
      animate={phase === "done"
        ? { opacity: 0, scale: 1.04 }
        : { opacity: 1, scale: 1, backgroundColor: "rgba(0,0,0,0.06)" }}
      transition={phase === "done"
        ? { duration: 0.7, ease: [0.4, 0, 0.2, 1] }
        : { backgroundColor: { duration: 1.4, ease: "easeOut" }, default: { duration: 0.45, ease: "easeInOut" } }}
      onClick={finish}
      role="button"
      tabIndex={0}
      aria-label="Skip intro"
    >
      {/* Soft breathing aura — atmospheric, soothing light behind the intro (gradient, no blur). */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: "60vmax",
          height: "60vmax",
          background:
            "radial-gradient(circle, rgba(240,198,207,0.10) 0%, rgba(150,120,200,0.06) 38%, transparent 68%)",
        }}
        initial={{ opacity: 0, scale: 0.82 }}
        animate={{ opacity: [0.5, 0.85, 0.5], scale: [0.85, 1.06, 0.85] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

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
              transition={{ duration: 1.2, repeat: Infinity, ease: [0.45, 0, 0.55, 1] }}
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
            className="relative flex flex-col items-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Soft glow blooming behind the name */}
            <motion.div
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                width: "26rem",
                height: "26rem",
                background: "radial-gradient(circle, rgba(240,198,207,0.18) 0%, rgba(240,198,207,0.06) 40%, transparent 68%)",
              }}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
            />
            {/* Name reveal */}
            <motion.h1
              className="text-5xl md:text-7xl font-bold text-[#e8e8e8] tracking-tight"
              initial={{ opacity: 0, letterSpacing: "0.4em", filter: "blur(8px)" }}
              animate={{ opacity: 1, letterSpacing: "-0.02em", filter: "blur(0px)" }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              {"som"}
              <motion.span
                className="text-[#f0c6cf]"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
              >
                .
              </motion.span>
            </motion.h1>

            <motion.p
              className="font-mono text-xs text-[#555] mt-3"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
            >
              hacker / photographer / overthinker
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Skip hint */}
      <motion.p
        className="absolute bottom-8 font-mono text-[0.65rem] text-[#444]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        click or press any key to skip
      </motion.p>
    </motion.div>
  )
}
