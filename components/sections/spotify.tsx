"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"

const favArtists = [
  "Artist One",
  "Artist Two",
  "Artist Three",
  "Artist Four",
  "Artist Five",
  "Artist Six",
]

function VinylRecord() {
  return (
    <div className="relative mx-auto h-48 w-48 sm:h-64 sm:w-64">
      {/* Outer ring */}
      <div
        className="absolute inset-0 rounded-full border border-[#333333] bg-[#0a0a0a]"
        style={{ animation: "spin-slow 8s linear infinite" }}
      >
        {/* Grooves */}
        {[20, 30, 40, 50, 60, 70, 80].map((pct) => (
          <div
            key={pct}
            className="absolute rounded-full border border-[#1a1a1a]"
            style={{
              inset: `${pct / 2}%`,
              width: `${100 - pct}%`,
              height: `${100 - pct}%`,
              left: `${pct / 2}%`,
              top: `${pct / 2}%`,
            }}
          />
        ))}
        {/* Center label */}
        <div className="absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#333333] bg-[#111111]">
          <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#333333]" />
        </div>
      </div>
    </div>
  )
}

export function SpotifySection() {
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" })

  return (
    <section id="music" ref={sectionRef} className="relative overflow-hidden bg-[#0a0a0a] py-24 md:py-32">
      {/* Ambient glow */}
      <motion.div
        className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        animate={{ opacity: [0.02, 0.05, 0.02], scale: [0.9, 1.1, 0.9] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        style={{ background: "radial-gradient(circle, #333333 0%, transparent 70%)" }}
      />

      <div className="relative z-10 mx-auto max-w-6xl px-6">
        <motion.h2
          className="mb-4 text-3xl font-bold tracking-tighter text-[#ffffff] sm:text-4xl md:text-5xl"
          initial={{ opacity: 0, x: -40 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          Currently Vibing
        </motion.h2>
        <motion.p
          className="mb-16 font-mono text-sm text-[#666666]"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.3 }}
        >
          {"// on repeat"}
        </motion.p>

        <div className="flex flex-col items-center gap-12 md:flex-row md:gap-16">
          {/* Vinyl */}
          <motion.div
            initial={{ opacity: 0, rotate: -20 }}
            animate={isInView ? { opacity: 1, rotate: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <VinylRecord />
          </motion.div>

          {/* Now Playing */}
          <motion.div
            className="flex-1"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="border border-[#333333] bg-[#111111] p-6">
              <div className="text-xs uppercase tracking-[0.3em] text-[#666666]">Now Playing</div>
              <div className="mt-4 flex gap-4">
                <div className="h-16 w-16 flex-shrink-0 bg-[#1a1a1a]" />
                <div className="flex flex-col justify-center">
                  <div className="text-lg font-bold text-[#ffffff]">Track Title</div>
                  <div className="text-sm text-[#999999]">Artist Name</div>
                  <div className="text-xs text-[#666666]">Album Name</div>
                </div>
              </div>
              {/* Progress bar */}
              <div className="mt-4 h-[2px] w-full bg-[#1a1a1a]">
                <motion.div
                  className="h-full bg-[#666666]"
                  animate={{ width: ["0%", "100%"] }}
                  transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                />
              </div>
            </div>

            {/* Playlist embed placeholder */}
            <div className="mt-4 border border-[#333333] bg-[#111111] p-6">
              <div className="text-xs uppercase tracking-[0.3em] text-[#666666]">Featured Playlist</div>
              <div className="mt-4 flex flex-col gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="font-mono text-xs text-[#666666]">{String(i).padStart(2, "0")}</span>
                    <div className="h-3 flex-1 bg-[#1a1a1a]" style={{ maxWidth: `${60 + i * 8}%` }} />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Fav Artists strip */}
        <motion.div
          className="mt-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6 }}
        >
          <div className="mb-4 text-xs uppercase tracking-[0.3em] text-[#666666]">Fav Artists</div>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none">
            {favArtists.map((artist, i) => (
              <motion.div
                key={i}
                className="flex flex-shrink-0 flex-col items-center gap-2"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 0.7 + i * 0.08 }}
              >
                <div className="h-16 w-16 rounded-full bg-[#1a1a1a] border border-[#333333]" />
                <span className="text-xs text-[#999999]">{artist}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
