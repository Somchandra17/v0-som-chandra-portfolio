"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

const roles = [
  "Cybersecurity Engineer",
  "Photographer",
  "Sketch Artist",
  "CTF Player",
  "Bug Hunter",
]

function FloatingShape({ delay, x, y, size, type }: { delay: number; x: string; y: string; size: number; type: "circle" | "line" }) {
  return (
    <motion.div
      className="absolute"
      style={{ left: x, top: y }}
      initial={{ opacity: 0 }}
      animate={{
        opacity: [0, 0.15, 0.15, 0],
        y: [0, -30, -60, -90],
        x: [0, 10, -10, 0],
      }}
      transition={{
        duration: 12,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {type === "circle" ? (
        <div
          className="rounded-full border border-[#333333]"
          style={{ width: size, height: size }}
        />
      ) : (
        <div
          className="bg-[#333333]"
          style={{ width: size, height: 1, transform: `rotate(${delay * 45}deg)` }}
        />
      )}
    </motion.div>
  )
}

export function HeroSection() {
  const [roleIndex, setRoleIndex] = useState(0)
  const [displayText, setDisplayText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const currentRole = roles[roleIndex]
    let timeout: ReturnType<typeof setTimeout>

    if (!isDeleting && displayText === currentRole) {
      timeout = setTimeout(() => setIsDeleting(true), 2000)
    } else if (isDeleting && displayText === "") {
      setIsDeleting(false)
      setRoleIndex((prev) => (prev + 1) % roles.length)
    } else if (isDeleting) {
      timeout = setTimeout(() => {
        setDisplayText((prev) => prev.slice(0, -1))
      }, 40)
    } else {
      timeout = setTimeout(() => {
        setDisplayText(currentRole.slice(0, displayText.length + 1))
      }, 80)
    }

    return () => clearTimeout(timeout)
  }, [displayText, isDeleting, roleIndex])

  const nameLetters = "Som Chandra".split("")

  return (
    <section id="hero" className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#000000]">
      {/* Grid background */}
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: `linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)`,
        backgroundSize: "60px 60px",
      }} />

      {/* Radial glow */}
      <motion.div
        className="absolute inset-0"
        animate={{ opacity: [0.03, 0.06, 0.03] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        style={{
          background: "radial-gradient(circle at 50% 50%, #333333 0%, transparent 70%)",
        }}
      />

      {/* Floating shapes */}
      <FloatingShape delay={0} x="15%" y="20%" size={60} type="circle" />
      <FloatingShape delay={2} x="80%" y="30%" size={40} type="circle" />
      <FloatingShape delay={4} x="25%" y="70%" size={80} type="line" />
      <FloatingShape delay={1} x="70%" y="60%" size={30} type="circle" />
      <FloatingShape delay={3} x="50%" y="80%" size={60} type="line" />
      <FloatingShape delay={5} x="85%" y="15%" size={50} type="line" />

      <div className="relative z-10 flex flex-col items-center gap-8 px-6 text-center">
        {/* Name */}
        <h1 className="text-5xl font-bold tracking-tighter sm:text-7xl md:text-8xl lg:text-9xl">
          {nameLetters.map((letter, i) => (
            <motion.span
              key={i}
              className="inline-block text-[#ffffff]"
              initial={{ opacity: 0, y: 50, rotateX: -90 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{
                duration: 0.6,
                delay: i * 0.06,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              {letter === " " ? "\u00A0" : letter}
            </motion.span>
          ))}
        </h1>

        {/* Typewriter role */}
        <motion.div
          className="h-8 font-mono text-lg text-[#999999] sm:text-xl md:text-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <span>{displayText}</span>
          <span className="ml-0.5 inline-block w-[2px] h-[1.2em] bg-[#999999] align-middle animate-pulse" />
        </motion.div>

        {/* CTA buttons */}
        <motion.div
          className="flex flex-col gap-4 sm:flex-row"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
        >
          <a
            href="#work"
            className="group relative overflow-hidden border border-[#ffffff] px-8 py-3 text-sm font-medium uppercase tracking-widest text-[#ffffff] transition-colors hover:text-[#000000]"
            data-hover
          >
            <span className="relative z-10">Explore Work</span>
            <span className="absolute inset-0 translate-y-full bg-[#ffffff] transition-transform duration-300 group-hover:translate-y-0" />
          </a>
          <a
            href="#contact"
            className="group relative overflow-hidden border border-[#666666] px-8 py-3 text-sm font-medium uppercase tracking-widest text-[#999999] transition-colors hover:text-[#000000]"
            data-hover
          >
            <span className="relative z-10">Say Hello</span>
            <span className="absolute inset-0 translate-y-full bg-[#cccccc] transition-transform duration-300 group-hover:translate-y-0" />
          </a>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs uppercase tracking-[0.3em] text-[#666666]">Scroll</span>
            <div className="h-12 w-[1px] bg-gradient-to-b from-[#666666] to-transparent" />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
