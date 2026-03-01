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
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#000000]"
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
    >
      <motion.p
        className="text-lg md:text-xl font-bold text-[#e8e8e8] mb-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {"one sec..."}
      </motion.p>

      {/* Data stream orb loader */}
      <div className="relative w-20 h-20 mb-8">
        {/* Outer rotating ring */}
        <motion.div
          className="absolute inset-0 border border-transparent border-t-[#7fb07f] border-r-[#7fb07f]"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          style={{ borderRadius: "50%" }}
        />
        
        {/* Middle pulsing ring */}
        <motion.div
          className="absolute inset-2 border border-[#7fb07f]"
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{ borderRadius: "50%" }}
        />
        
        {/* Inner glowing core */}
        <motion.div
          className="absolute inset-4 bg-[#7fb07f]"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.6, 1, 0.6]
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{ 
            borderRadius: "50%",
            boxShadow: "0 0 20px rgba(127, 176, 127, 0.8)"
          }}
        />

        {/* Orbiting particles */}
        {[0, 120, 240].map((angle) => (
          <motion.div
            key={angle}
            className="absolute w-1 h-1 bg-[#7fb07f]"
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            style={{
              borderRadius: "50%",
              top: "50%",
              left: "50%",
              originX: "10px",
              originY: 0,
              transform: `rotate(${angle}deg) translateY(-28px)`,
              boxShadow: "0 0 8px rgba(127, 176, 127, 0.6)"
            }}
          />
        ))}
      </div>

      <motion.p
        key={msgIndex}
        className="font-mono text-sm text-[#777]"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        {messages[msgIndex]}
      </motion.p>

      {/* Progress line */}
      <div className="mt-8 w-48 h-px bg-[#222]">
        <motion.div
          className="h-full bg-[#7fb07f]"
          animate={{ width: `${((msgIndex + 1) / messages.length) * 100}%` }}
          transition={{ duration: 0.3 }}
          style={{ boxShadow: "0 0 10px rgba(127, 176, 127, 0.5)" }}
        />
      </div>
    </motion.div>
  )
}
