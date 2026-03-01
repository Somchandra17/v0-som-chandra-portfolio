"use client"

import { useEffect, useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"

const bootSequence = [
  { text: "> initializing som.exe...", delay: 0 },
  { text: "> loading personality modules...", delay: 400 },
  { text: "> [nerdy_side] .......... OK", delay: 800 },
  { text: "> [unhinged_side] ....... OK", delay: 1200 },
  { text: "> compiling bad jokes... 137 found", delay: 1600 },
  { text: "> checking music taste... questionable but valid", delay: 2000 },
  { text: "> hiding secrets in /flag.txt...", delay: 2400 },
  { text: "> coffee_level: dangerously low", delay: 2800 },
  { text: "> ready.", delay: 3200 },
]

const ascii = `
  ___  __  _______ 
 / __|/  \\|       |
 \\__ \\ () | || || |
 |___/\\__/|_|_|_|_|
`

export function Loader({ onComplete }: { onComplete: () => void }) {
  const [visibleLines, setVisibleLines] = useState(0)
  const [phase, setPhase] = useState<"boot" | "name" | "exit">("boot")

  const stableOnComplete = useCallback(onComplete, [onComplete])

  useEffect(() => {
    const timers: NodeJS.Timeout[] = []

    bootSequence.forEach((_, i) => {
      timers.push(
        setTimeout(() => setVisibleLines(i + 1), bootSequence[i].delay)
      )
    })

    // After boot, show name
    timers.push(
      setTimeout(() => setPhase("name"), 3400)
    )

    // After name, exit
    timers.push(
      setTimeout(() => {
        setPhase("exit")
        setTimeout(stableOnComplete, 600)
      }, 4400)
    )

    return () => timers.forEach(clearTimeout)
  }, [stableOnComplete])

  return (
    <AnimatePresence>
      {phase !== "exit" ? (
        <motion.div
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#000000]"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {phase === "boot" && (
            <div className="w-full max-w-md px-6">
              {/* Terminal window chrome */}
              <div className="mb-2 flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-[#333]" />
                <div className="h-2.5 w-2.5 rounded-full bg-[#333]" />
                <div className="h-2.5 w-2.5 rounded-full bg-[#333]" />
                <span className="ml-2 font-mono text-[0.6rem] text-[#555]">som@portfolio:~</span>
              </div>

              <div className="border border-[#222] bg-[#0a0a0a] p-4 font-mono text-xs leading-relaxed">
                {bootSequence.slice(0, visibleLines).map((line, i) => (
                  <motion.p
                    key={i}
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.15 }}
                    className={
                      line.text.includes("OK") ? "text-[#7fb07f]" :
                      line.text.includes("ready") ? "text-[#f0c6cf]" :
                      line.text.includes("questionable") ? "text-[#f0c6cf]" :
                      "text-[#777]"
                    }
                  >
                    {line.text}
                    {i === visibleLines - 1 && (
                      <motion.span
                        animate={{ opacity: [1, 0] }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                        className="ml-0.5 inline-block w-1.5 h-3 bg-[#777] align-middle"
                      />
                    )}
                  </motion.p>
                ))}
              </div>

              {/* Subtle progress */}
              <div className="mt-3 h-px bg-[#1a1a1a] overflow-hidden">
                <motion.div
                  className="h-full bg-[#f0c6cf]"
                  initial={{ width: "0%" }}
                  animate={{ width: `${(visibleLines / bootSequence.length) * 100}%` }}
                  transition={{ duration: 0.3 }}
                  style={{ opacity: 0.6 }}
                />
              </div>
            </div>
          )}

          {phase === "name" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <pre className="font-mono text-[#f0c6cf] text-xs md:text-sm leading-tight whitespace-pre" style={{ textShadow: "0 0 10px rgba(240, 198, 207, 0.3)" }}>
                {ascii}
              </pre>
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="font-mono text-[0.65rem] text-[#555] mt-2"
              >
                hacker / photographer / professional overthinker
              </motion.p>
            </motion.div>
          )}
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
