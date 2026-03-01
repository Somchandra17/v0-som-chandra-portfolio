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

function CassettePlayer() {
  return (
    <motion.div
      className="relative mx-auto w-52 h-32 p-3 shadow-md"
      style={{ background: '#3c3836', borderRadius: '4px', border: '2px solid #504945' }}
      animate={{ rotate: [-0.5, 0.5, -0.5] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* Tape label */}
      <div className="absolute inset-2 flex items-center justify-center gap-4"
        style={{ background: '#ebdbb2', borderRadius: '2px' }}>
        {/* Spools */}
        <motion.div
          className="w-8 h-8 rounded-full border-2 flex items-center justify-center"
          style={{ borderColor: '#7c6f64' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        >
          <div className="w-3 h-3 rounded-full" style={{ background: '#7c6f64' }} />
        </motion.div>
        <motion.div
          className="w-8 h-8 rounded-full border-2 flex items-center justify-center"
          style={{ borderColor: '#7c6f64' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        >
          <div className="w-3 h-3 rounded-full" style={{ background: '#7c6f64' }} />
        </motion.div>
      </div>
      {/* Label text */}
      <div className="absolute bottom-1 left-0 right-0 text-center">
        <span className="text-[10px]" style={{ fontFamily: "'Caveat', cursive", color: '#ebdbb2' }}>
          vibes mixtape vol.3
        </span>
      </div>
    </motion.div>
  )
}

export function SpotifySection() {
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" })

  return (
    <section id="music" ref={sectionRef} className="relative overflow-hidden py-24 md:py-32" style={{ background: '#f9f5d7' }}>
      {/* Ink stain */}
      <div className="absolute bottom-10 left-10 w-24 h-24 rounded-full opacity-[0.04]"
        style={{ background: 'radial-gradient(circle, #3c3836, transparent 65%)' }} />

      <div className="relative z-10 mx-auto max-w-5xl px-6">
        <motion.h2
          className="mb-4 text-4xl sm:text-5xl md:text-6xl"
          style={{ fontFamily: "'Caveat', cursive", color: '#3c3836' }}
          initial={{ opacity: 0, x: -30 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          currently vibing to
        </motion.h2>
        <motion.svg width="160" height="8" viewBox="0 0 160 8" className="mb-2">
          <motion.path
            d="M2,5 Q30,1 60,5 T120,5 T160,4"
            fill="none" stroke="#689d6a" strokeWidth="2" strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={isInView ? { pathLength: 1 } : { pathLength: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          />
        </motion.svg>
        <motion.p
          className="mb-12 text-sm"
          style={{ fontFamily: "'Caveat', cursive", color: '#bdae93' }}
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.3 }}
        >
          (on repeat, always)
        </motion.p>

        <div className="flex flex-col items-center gap-10 md:flex-row md:gap-14">
          {/* Cassette */}
          <motion.div
            initial={{ opacity: 0, rotate: -10 }}
            animate={isInView ? { opacity: 1, rotate: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <CassettePlayer />
          </motion.div>

          {/* Now Playing card */}
          <motion.div
            className="flex-1"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="p-5 shadow-sm" style={{ background: '#f2e5bc', border: '1px dashed #bdae93', borderRadius: '2px' }}>
              <div className="text-sm" style={{ fontFamily: "'Caveat', cursive", color: '#d65d0e' }}>now playing ~</div>
              <div className="mt-3 flex gap-4">
                <div className="h-14 w-14 flex-shrink-0" style={{ background: '#ebdbb2', borderRadius: '2px' }} />
                <div className="flex flex-col justify-center">
                  <div className="text-lg font-bold" style={{ color: '#3c3836' }}>Track Title</div>
                  <div className="text-sm" style={{ color: '#7c6f64' }}>Artist Name</div>
                </div>
              </div>
              {/* Progress bar */}
              <div className="mt-4 h-1.5 w-full rounded-full" style={{ background: '#ebdbb2' }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: '#d65d0e' }}
                  animate={{ width: ["0%", "100%"] }}
                  transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                />
              </div>
            </div>

            {/* Playlist */}
            <div className="mt-4 p-5 shadow-sm" style={{ background: '#f2e5bc', border: '1px dashed #bdae93', borderRadius: '2px' }}>
              <div className="text-sm" style={{ fontFamily: "'Caveat', cursive", color: '#689d6a' }}>playlist vibes</div>
              <div className="mt-3 flex flex-col gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs font-mono" style={{ color: '#bdae93' }}>{String(i).padStart(2, "0")}</span>
                    <div className="h-2.5 flex-1 rounded-full" style={{ background: '#ebdbb2', maxWidth: `${55 + i * 10}%` }} />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Fav Artists */}
        <motion.div
          className="mt-14"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6 }}
        >
          <div className="mb-3 text-lg" style={{ fontFamily: "'Caveat', cursive", color: '#7c6f64' }}>
            people I keep on repeat:
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {favArtists.map((artist, i) => (
              <motion.div
                key={i}
                className="flex flex-shrink-0 flex-col items-center gap-2"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 0.7 + i * 0.08 }}
              >
                <div className="h-14 w-14 rounded-full" style={{ background: '#ebdbb2', border: '2px dashed #bdae93' }} />
                <span className="text-xs" style={{ color: '#7c6f64' }}>{artist}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
