"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { ACCENT, INK } from "@/lib/tokens"

/* The full ritual (~4s): both status lines + progress dots → name reveal → hand-off.
   Skippable anywhere; the veil never lets the cosmic build-up wash the intro out. */
const messages = [
  "hold on, looking for my other sock...",
  "okay found it, one sec...",
]

const MSG_MS = 1000
const NAME_MS = 1350
const HANDOFF_MS = 560

// A few faint sakura motes that drift up during the load — a preview of the layered world
// being assembled behind the veil. Fixed values (no Math.random) to stay deterministic.
const LOADER_MOTES = [
  { left: "31%", size: 5, delay: 0, dur: 7.0, drift: 16 },
  { left: "44%", size: 3, delay: 1.6, dur: 8.4, drift: -12 },
  { left: "57%", size: 6, delay: 0.8, dur: 6.6, drift: 12 },
  { left: "67%", size: 4, delay: 2.4, dur: 9.0, drift: -18 },
  { left: "38%", size: 3, delay: 3.2, dur: 7.8, drift: 9 },
  { left: "62%", size: 5, delay: 1.1, dur: 8.8, drift: -9 },
]

type Phase = "messages" | "name" | "handoff"

type MorphTarget = { x: number; y: number; scale: number } | null

export function Loader({ onComplete }: { onComplete: () => void }) {
  const [msgIndex, setMsgIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>("messages")
  const [morph, setMorph] = useState<MorphTarget>(null)
  const prefersReducedMotion = useReducedMotion()

  const nameRef = useRef<HTMLHeadingElement>(null)
  const stableComplete = useCallback(onComplete, [onComplete])
  const finished = useRef(false)
  const handedOff = useRef(false)

  // The hand-off: measure the live hero name (always mounted) and morph the loader
  // name onto it, then let the hero fade in underneath. Falls back to a plain fade.
  const finish = useCallback(() => {
    if (handedOff.current) return
    handedOff.current = true

    let target: MorphTarget = null
    const heroName = document.getElementById("hero-name")
    const own = nameRef.current
    if (heroName && own) {
      const h = heroName.getBoundingClientRect()
      const o = own.getBoundingClientRect()
      if (h.width > 0 && o.width > 0) {
        target = {
          x: h.left + h.width / 2 - (o.left + o.width / 2),
          y: h.top + h.height / 2 - (o.top + o.height / 2),
          scale: h.height / o.height,
        }
      }
    }
    setMorph(target)
    setPhase("handoff")

    // Reveal the hero mid-morph so the two names cross-fade in place.
    window.setTimeout(() => {
      if (finished.current) return
      finished.current = true
      stableComplete()
    }, Math.round(HANDOFF_MS * 0.7))
  }, [stableComplete])

  // Reduced motion: skip the whole intro instantly.
  useEffect(() => {
    if (!prefersReducedMotion) return
    if (finished.current) return
    finished.current = true
    handedOff.current = true
    stableComplete()
  }, [prefersReducedMotion, stableComplete])

  // Let the visitor skip with a click or any key.
  useEffect(() => {
    const onKey = () => finish()
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [finish])

  useEffect(() => {
    if (prefersReducedMotion) return
    const timers: ReturnType<typeof setTimeout>[] = []
    messages.forEach((_, i) => {
      if (i > 0) timers.push(setTimeout(() => setMsgIndex(i), i * MSG_MS))
    })
    timers.push(setTimeout(() => setPhase((p) => (p === "messages" ? "name" : p)), messages.length * MSG_MS))
    timers.push(setTimeout(finish, messages.length * MSG_MS + NAME_MS))
    return () => timers.forEach(clearTimeout)
  }, [prefersReducedMotion, finish])

  if (prefersReducedMotion) return null

  const inHandoff = phase === "handoff"

  return (
    <motion.div
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center cursor-pointer"
      initial={{ opacity: 1, backgroundColor: "rgba(0,0,0,1)" }}
      animate={
        inHandoff
          ? { opacity: 1, backgroundColor: "rgba(0,0,0,0)" }
          : // Brightness floor: the cosmic build-up stays visible but can never wash the
            // intro out into a full-bright flower wall.
            { opacity: 1, backgroundColor: "rgba(0,0,0,0.45)" }
      }
      exit={{ opacity: 0, transition: { duration: 0.2 } }}
      transition={
        inHandoff
          ? { backgroundColor: { duration: HANDOFF_MS / 1000, ease: [0.4, 0, 0.2, 1] } }
          : { backgroundColor: { duration: 1.4, ease: "easeOut" } }
      }
      onClick={finish}
      role="button"
      tabIndex={0}
      aria-label="Skip intro"
    >
      {/* Soft breathing aura — atmospheric light behind the intro (gradient, no blur). */}
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
        animate={inHandoff ? { opacity: 0, scale: 1.1 } : { opacity: [0.5, 0.85, 0.5], scale: [0.85, 1.06, 0.85] }}
        transition={inHandoff ? { duration: 0.4 } : { duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Drifting sakura motes — the layered world materialising behind the veil. */}
      {!inHandoff && (
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          {LOADER_MOTES.map((m, i) => (
            <motion.span
              key={i}
              className="absolute rounded-full"
              style={{
                left: m.left,
                bottom: "30%",
                width: m.size,
                height: m.size,
                background: "rgba(240,198,207,0.9)",
                boxShadow: "0 0 8px rgba(240,198,207,0.5)",
              }}
              initial={{ opacity: 0, y: 20, x: 0 }}
              animate={{ opacity: [0, 0.55, 0], y: [20, -170], x: [0, m.drift, 0] }}
              transition={{ duration: m.dur, delay: m.delay, repeat: Infinity, ease: "easeInOut" }}
            />
          ))}
        </div>
      )}

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
              className="w-3 h-3 rounded-full bg-accent-creative mb-8"
              animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: [0.45, 0, 0.55, 1] }}
              style={{ boxShadow: "0 0 20px rgba(240, 198, 207, 0.6)" }}
            />

            {/* Message */}
            <div aria-live="polite" aria-atomic="true">
              <AnimatePresence mode="wait">
                <motion.p
                  key={msgIndex}
                  initial={{ opacity: 0, y: 10, filter: "blur(6px)", scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }}
                  exit={{ opacity: 0, y: -8, filter: "blur(4px)", scale: 0.98 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="font-mono text-sm text-ink-100"
                >
                  {messages[msgIndex]}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Dots progress */}
            <div className="mt-6 flex gap-2">
              {messages.map((_, i) => (
                <motion.div
                  key={i}
                  className="h-1 rounded-full"
                  animate={{
                    width: i <= msgIndex ? 16 : 6,
                    backgroundColor: i <= msgIndex ? ACCENT.creative : INK[600],
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
      </AnimatePresence>

      {/* Name reveal → hand-off morph. Kept mounted through "handoff" so it can travel. */}
      {(phase === "name" || inHandoff) && (
        <motion.div
          key="name"
          className="absolute flex flex-col items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {/* Soft glow blooming behind the name; lets go during the hand-off. */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              width: "26rem",
              height: "26rem",
              background:
                "radial-gradient(circle, rgba(240,198,207,0.18) 0%, rgba(240,198,207,0.06) 40%, transparent 68%)",
            }}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={inHandoff ? { opacity: 0, scale: 1.15 } : { opacity: 1, scale: 1 }}
            transition={inHandoff ? { duration: 0.45 } : { duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          />

          <motion.h1
            ref={nameRef}
            className="text-5xl md:text-7xl font-bold text-ink-100 tracking-tight"
            initial={{ opacity: 0, letterSpacing: "0.4em", filter: "blur(8px)" }}
            animate={
              inHandoff
                ? morph
                  ? {
                      opacity: [1, 1, 0],
                      letterSpacing: "-0.02em",
                      filter: "blur(0px)",
                      x: morph.x,
                      y: morph.y,
                      scale: morph.scale,
                    }
                  : { opacity: 0, letterSpacing: "-0.02em", filter: "blur(2px)", scale: 1.04 }
                : { opacity: 1, letterSpacing: "-0.02em", filter: "blur(0px)" }
            }
            transition={
              inHandoff
                ? { duration: HANDOFF_MS / 1000, ease: [0.4, 0, 0.2, 1], opacity: { times: [0, 0.75, 1], duration: HANDOFF_MS / 1000 } }
                : { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
            }
            style={{ transformOrigin: "center center" }}
          >
            {"som"}
            <motion.span
              className="text-accent-creative"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
            >
              .
            </motion.span>
          </motion.h1>

          <motion.p
            className="font-mono text-xs text-ink-400 mt-3"
            initial={{ opacity: 0, y: 8 }}
            animate={inHandoff ? { opacity: 0, y: -4 } : { opacity: 1, y: 0 }}
            transition={inHandoff ? { duration: 0.25 } : { delay: 0.4, duration: 0.4 }}
          >
            hacker / photographer / overthinker
          </motion.p>
        </motion.div>
      )}

      {/* Visible skip affordance */}
      {!inHandoff && (
        <motion.p
          className="absolute bottom-8 border border-ink-500 bg-ink-900/70 px-3 py-1.5 font-mono text-[0.65rem] tracking-widest text-ink-300"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
        >
          {"skip ↵"}
        </motion.p>
      )}
    </motion.div>
  )
}
