"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

const messages = [
  "flipping through pages...",
  "spilled ink on the desk...",
  "looking for a pen...",
  "found a coffee stain...",
  "almost there...",
]

export function Loader({ onComplete }: { onComplete: () => void }) {
  const [msgIndex, setMsgIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => {
        if (prev >= messages.length - 1) {
          clearInterval(interval)
          setTimeout(onComplete, 600)
          return prev
        }
        return prev + 1
      })
    }, 450)
    return () => clearInterval(interval)
  }, [onComplete])

  return (
    <motion.div
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#f5f5f0]"
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    >
      <motion.div
        className="mb-8 h-px bg-[#111]"
        initial={{ width: 0 }}
        animate={{ width: 120 }}
        transition={{ duration: 2.2, ease: "easeOut" }}
      />

      <p className="font-mono text-sm tracking-wide text-[#666]">
        {messages[msgIndex]}
      </p>

      <div className="mt-6 flex gap-2">
        {messages.map((_, i) => (
          <div
            key={i}
            className="h-1.5 w-1.5 transition-colors duration-300"
            style={{ background: i <= msgIndex ? "#111" : "#ccc" }}
          />
        ))}
      </div>
    </motion.div>
  )
}
