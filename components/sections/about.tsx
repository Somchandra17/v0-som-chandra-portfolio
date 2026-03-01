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
    <div ref={ref} className="flex flex-col items-center p-4" style={{ background: '#f2e5bc', borderRadius: '2px' }}>
      <span className="text-3xl font-bold sm:text-4xl" style={{ fontFamily: "'Caveat', cursive", color: '#cc241d' }}>
        {count}{suffix || ""}
      </span>
      <span className="mt-1 text-xs" style={{ color: '#7c6f64' }}>{label}</span>
    </div>
  )
}

const fadeUpVariant = {
  hidden: { opacity: 0, y: 30 },
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
    <section id="about" ref={sectionRef} className="relative py-24 md:py-32" style={{ background: '#f9f5d7' }}>
      {/* Tape at the top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-7 -translate-y-1/2"
        style={{
          background: 'linear-gradient(135deg, #d5c4a166 0%, #ebdbb288 100%)',
          border: '1px solid #bdae9333',
          transform: 'translateX(-50%) translateY(-50%) rotate(-3deg)',
        }}
      />

      <div className="mx-auto max-w-5xl px-6">
        {/* Section heading */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, x: -30 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl sm:text-5xl md:text-6xl" style={{ fontFamily: "'Caveat', cursive", color: '#3c3836' }}>
            about me
          </h2>
          <motion.svg width="120" height="8" viewBox="0 0 120 8" className="mt-1">
            <motion.path
              d="M2,5 Q20,1 40,5 T80,5 T120,4"
              fill="none" stroke="#d65d0e" strokeWidth="2" strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={isInView ? { pathLength: 1 } : { pathLength: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            />
          </motion.svg>
          <p className="mt-2 text-sm italic" style={{ fontFamily: "'Caveat', cursive", color: '#bdae93' }}>
            (the short version, I promise)
          </p>
        </motion.div>

        <div className="flex flex-col gap-12 lg:flex-row lg:gap-16">
          {/* Left: Text with margin line */}
          <div className="flex-1 margin-line">
            {[
              "So I live between two very different worlds. In one, I'm bypassing SSL pinning and writing tools that poke holes in things. In the other, I'm trying to frame the perfect shot or losing track of time sketching from life. It's a weird combo but I kinda love it.",
              "Right now I'm a Cybersecurity Engineer at MoveInSync where I do end-to-end VAPT, build internal security tools, and make sure the Android app doesn't fall apart when someone tries to mess with it. I once secured their whole app against Frida-based attacks which was honestly pretty fun.",
              "But security is only half the story. Between breaking systems and building frames, I find the space where discipline meets art. Photography and sketching aren't hobbies -- they're how I stay human in a world of packet captures.",
              "Oh and I have a B.Tech in CSE (Cybersecurity & Blockchain), CompTIA Security+ and eWPTXv2 certs, Top 1% on TryHackMe, and Hall of Fame at Mastercard, Rakuten, and a few other places. Not bad for someone who can't remember to water their plants.",
            ].map((text, i) => (
              <motion.p
                key={i}
                className="mb-4 text-base leading-relaxed"
                style={{ color: '#504945' }}
                custom={i}
                variants={fadeUpVariant}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
              >
                {text}
              </motion.p>
            ))}
          </div>

          {/* Right: Polaroid-style portrait placeholder */}
          <motion.div
            className="relative mx-auto w-full max-w-[300px] flex-shrink-0 lg:w-[280px]"
            initial={{ opacity: 0, rotate: 3, scale: 0.9 }}
            animate={isInView ? { opacity: 1, rotate: 2, scale: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="p-3 pb-12 shadow-lg" style={{ background: '#f2e5bc' }}>
              <div className="aspect-square w-full flex items-center justify-center" style={{ background: '#ebdbb2' }}>
                <span className="text-3xl" style={{ fontFamily: "'Caveat', cursive", color: '#bdae93' }}>
                  (photo goes here)
                </span>
              </div>
              <p className="mt-3 text-center text-lg" style={{ fontFamily: "'Caveat', cursive", color: '#7c6f64' }}>
                that's me! I think.
              </p>
            </div>
            {/* Tape on top corner */}
            <div className="absolute -top-3 -right-2 w-16 h-6"
              style={{
                background: 'linear-gradient(135deg, #d5c4a155 0%, #ebdbb255 100%)',
                border: '1px solid #bdae9322',
                transform: 'rotate(15deg)',
              }}
            />
          </motion.div>
        </div>

        {/* Stats */}
        <motion.div
          className="mt-16 grid grid-cols-2 gap-4 md:grid-cols-4"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <CountUp target={1} label="TryHackMe (Top %)" suffix="%" />
          <CountUp target={20} label="NCIIPC Acks" suffix="+" />
          <CountUp target={3} label="Hall of Fame(s)" />
          <CountUp target={5} label="CTF Competitions" suffix="+" />
        </motion.div>
      </div>
    </section>
  )
}
