"use client"

import { useRef, useEffect, useState } from "react"
import { motion, useInView } from "framer-motion"

function CountUp({ target, label, suffix }: { target: number; label: string; suffix?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!isInView) return
    let start = 0
    const duration = 2000
    const increment = target / (duration / 16)
    const timer = setInterval(() => {
      start += increment
      if (start >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 16)
    return () => clearInterval(timer)
  }, [isInView, target])

  return (
    <div ref={ref} className="flex flex-col items-center">
      <span className="text-3xl font-bold text-[#ffffff] sm:text-4xl md:text-5xl">
        {count}{suffix || ""}
      </span>
      <span className="mt-2 text-xs uppercase tracking-[0.2em] text-[#666666]">{label}</span>
    </div>
  )
}

function DrawBorder() {
  const ref = useRef<SVGSVGElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <svg ref={ref} className="absolute inset-0 h-full w-full" viewBox="0 0 400 500" fill="none">
      <motion.rect
        x="5" y="5" width="390" height="490" rx="8"
        stroke="#333333"
        strokeWidth="1"
        initial={{ pathLength: 0 }}
        animate={isInView ? { pathLength: 1 } : { pathLength: 0 }}
        transition={{ duration: 2, ease: "easeInOut", delay: 0.3 }}
      />
    </svg>
  )
}

const fadeUpVariant = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] },
  }),
}

export function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" })

  return (
    <section id="about" ref={sectionRef} className="relative bg-[#0a0a0a] py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        {/* Section heading */}
        <motion.h2
          className="mb-16 text-3xl font-bold tracking-tighter text-[#ffffff] sm:text-4xl md:text-5xl"
          initial={{ opacity: 0, x: -40 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          About
        </motion.h2>

        <div className="flex flex-col gap-16 lg:flex-row lg:gap-20">
          {/* Left: Text */}
          <div className="flex flex-1 flex-col gap-6">
            {[
              "I live between two worlds. One where I bypass SSL pinning and write exploit tools that tear through defenses. Another where I frame the perfect shot or lose hours sketching from life.",
              "As a Cybersecurity Engineer at MoveInSync, I conduct end-to-end VAPT, build internal security tools, and harden mobile applications against rooted device exploitation and runtime attacks. I secured their Android app against Frida-based attacks by integrating Google Play Integrity API.",
              "But security is only half the story. Between breaking systems and building frames, I find the space where discipline meets art. Photography and sketching aren't hobbies -- they're how I stay human in a world of packet captures and shell codes.",
              "B.Tech in CSE (Cybersecurity & Blockchain) from Lovely Professional University. CompTIA Security+ and eWPTXv2 certified. Top 1% on TryHackMe. Hall of Fame at Mastercard, Rakuten, and Chaturbate.",
            ].map((text, i) => (
              <motion.p
                key={i}
                className="text-base leading-relaxed text-[#999999] sm:text-lg"
                custom={i}
                variants={fadeUpVariant}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
              >
                {text}
              </motion.p>
            ))}
          </div>

          {/* Right: Portrait placeholder with draw-border */}
          <motion.div
            className="relative mx-auto aspect-[4/5] w-full max-w-[400px] flex-shrink-0 lg:w-[380px]"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <DrawBorder />
            <div className="absolute inset-3 flex items-center justify-center bg-[#111111]">
              <div className="flex flex-col items-center gap-3">
                <div className="h-20 w-20 rounded-full border border-[#333333] bg-[#1a1a1a]" />
                <span className="text-xs uppercase tracking-[0.3em] text-[#666666]">Portrait</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Stats */}
        <motion.div
          className="mt-20 grid grid-cols-2 gap-8 border-t border-[#1a1a1a] pt-16 md:grid-cols-4"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <CountUp target={1} label="TryHackMe (Top %)" suffix="%" />
          <CountUp target={20} label="NCIIPC Acknowledgements" suffix="+" />
          <CountUp target={3} label="Hall of Fame(s)" />
          <CountUp target={5} label="CTF Competitions" suffix="+" />
        </motion.div>
      </div>
    </section>
  )
}
