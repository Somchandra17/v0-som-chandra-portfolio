"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

const messages = [
  "looking for my other sock...",
  "untangling the headphones...",
  "oops, wrong folder...",
  "brewing questionable coffee...",
  "found it, hold on...",
]

export function Loader({ onComplete }: { onComplete: () => void }) {
  const [msgIndex, setMsgIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => {
        if (prev >= messages.length - 1) {
          clearInterval(interval)
          setTimeout(onComplete, 500)
          return prev
        }
        return prev + 1
      })
    }, 420)
    return () => clearInterval(interval)
  }, [onComplete])

  return (
    <motion.div
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#0a0a0a]"
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
    >
      <motion.p
        className="text-lg md:text-xl font-bold text-[#e8e8e8] mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {"one sec..."}
      </motion.p>

      <motion.p
        key={msgIndex}
        className="font-mono text-sm text-[#777]"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        {messages[msgIndex]}
      </motion.p>

      <div className="mt-8 flex gap-2">
        {messages.map((_, i) => (
          <motion.div
            key={i}
            className="h-1.5 w-1.5"
            animate={{
              background: i <= msgIndex ? "#e8e8e8" : "#333",
              scale: i === msgIndex ? 1.4 : 1,
            }}
            transition={{ duration: 0.2 }}
            style={{ borderRadius: "50%" }}
          />
        ))}
      </div>
    </motion.div>
  )
}
