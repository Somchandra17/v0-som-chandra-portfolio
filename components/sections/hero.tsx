"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

const vibes = [
  "breaks stuff for a living",
  "spills coffee on keyboards",
  "draws things sometimes",
  "clicks photos nobody asked for",
  "plays CTFs at 3am",
  "professional overthinker",
]

function StickyNote({ children, color, rotate, top, left, delay }: {
  children: React.ReactNode
  color: string
  rotate: number
  top: string
  left: string
  delay: number
}) {
  return (
    <motion.div
      className="absolute hidden md:block w-32 p-3 text-sm shadow-md"
      style={{
        fontFamily: "'Caveat', cursive",
        background: color,
        color: '#3c3836',
        top,
        left,
        transform: `rotate(${rotate}deg)`,
        fontSize: '15px',
      }}
      initial={{ opacity: 0, scale: 0, rotate: rotate - 15 }}
      animate={{ opacity: 1, scale: 1, rotate }}
      transition={{ delay, duration: 0.5, type: "spring", stiffness: 200 }}
    >
      {children}
    </motion.div>
  )
}

function DoodleArrow() {
  return (
    <motion.svg
      width="80" height="60" viewBox="0 0 80 60"
      className="absolute bottom-28 left-1/2 -translate-x-1/2 hidden md:block"
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.3 }}
      transition={{ delay: 2 }}
    >
      <motion.path
        d="M40,5 Q35,25 40,45 M35,38 L40,48 L45,38"
        fill="none"
        stroke="#7c6f64"
        strokeWidth="2"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 2, duration: 1 }}
      />
    </motion.svg>
  )
}

export function HeroSection() {
  const [vibeIndex, setVibeIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setVibeIndex((prev) => (prev + 1) % vibes.length)
    }, 2200)
    return () => clearInterval(interval)
  }, [])

  return (
    <section id="hero" className="relative flex min-h-screen items-center justify-center overflow-hidden"
      style={{ background: '#fbf1c7' }}>
      
      {/* Ruled lines background */}
      <div className="absolute inset-0 ruled-lines opacity-30" />

      {/* Red margin line */}
      <div className="absolute top-0 bottom-0 left-[12%] w-[2px] opacity-20"
        style={{ background: '#cc241d' }} />

      {/* Coffee ring stain */}
      <motion.div
        className="absolute top-16 right-24 w-36 h-36 rounded-full"
        style={{ background: 'radial-gradient(ellipse at center, transparent 40%, #a0845025 50%, #a0845018 58%, transparent 65%)' }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
      />

      {/* Sticky notes scattered around */}
      <StickyNote color="#fabd2f44" rotate={-5} top="18%" left="8%" delay={0.8}>
        todo: fix that bug
      </StickyNote>
      <StickyNote color="#8ec07c33" rotate={3} top="25%" left="78%" delay={1.1}>
        buy more coffee
      </StickyNote>
      <StickyNote color="#fb493422" rotate={-2} top="68%" left="82%" delay={1.4}>
        remember to sleep
      </StickyNote>
      <StickyNote color="#83a59844" rotate={4} top="72%" left="5%" delay={1.7}>
        call mom back
      </StickyNote>

      <div className="relative z-10 flex flex-col items-center gap-6 px-6 text-center">
        {/* Fun intro instead of big name */}
        <motion.div
          initial={{ opacity: 0, y: 30, rotate: -2 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <span
            className="text-lg sm:text-xl inline-block px-4 py-1 -rotate-1"
            style={{
              fontFamily: "'Caveat', cursive",
              color: '#7c6f64',
              background: '#ebdbb2',
              borderRadius: '2px',
            }}
          >
            oh hey, you found this page
          </span>
        </motion.div>

        <motion.h1
          className="text-5xl sm:text-6xl md:text-8xl font-bold tracking-tight leading-none"
          style={{ fontFamily: "'Caveat', cursive", color: '#3c3836' }}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <motion.span
            className="inline-block"
            animate={{ rotate: [-1, 1, -1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            {"i'm som."}
          </motion.span>
        </motion.h1>

        {/* Scribble underline */}
        <motion.svg
          width="200" height="12" viewBox="0 0 200 12"
          className="mx-auto -mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <motion.path
            d="M5,8 Q30,2 55,8 T105,8 T155,8 T200,6"
            fill="none"
            stroke="#cc241d"
            strokeWidth="2.5"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.8, duration: 0.8, ease: "easeOut" }}
          />
        </motion.svg>

        {/* Cycling vibes */}
        <motion.div
          className="h-8 flex items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <motion.p
            key={vibeIndex}
            className="text-lg sm:text-xl"
            style={{ color: '#7c6f64' }}
            initial={{ opacity: 0, y: 10, rotate: -1 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {vibes[vibeIndex]}
          </motion.p>
        </motion.div>

        {/* Casual CTAs */}
        <motion.div
          className="flex flex-col gap-3 sm:flex-row mt-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3, duration: 0.6 }}
        >
          <a
            href="#work"
            className="group relative px-6 py-2.5 text-sm font-medium transition-all hover:-rotate-1"
            style={{
              background: '#3c3836',
              color: '#fbf1c7',
              borderRadius: '2px',
            }}
            data-hover
          >
            see what I do
          </a>
          <a
            href="#contact"
            className="group relative px-6 py-2.5 text-sm font-medium border-2 border-dashed transition-all hover:rotate-1"
            style={{
              borderColor: '#bdae93',
              color: '#7c6f64',
              borderRadius: '2px',
            }}
            data-hover
          >
            say hello maybe?
          </a>
        </motion.div>
      </div>

      <DoodleArrow />

      {/* Scroll hint */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        style={{ fontFamily: "'Caveat', cursive", color: '#bdae93' }}
      >
        <span className="text-sm">psst... scroll down</span>
      </motion.div>
    </section>
  )
}
