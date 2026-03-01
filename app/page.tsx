"use client"

import { useState, useCallback } from "react"
import { AnimatePresence, motion } from "framer-motion"
import Link from "next/link"
import { CustomCursor } from "@/components/custom-cursor"
import { PaperOverlay } from "@/components/grain-overlay"
import { Loader } from "@/components/loader"
import { Terminal, Pen, Github, Linkedin, Mail, ExternalLink } from "lucide-react"

const socials = [
  { label: "GitHub", href: "https://github.com/0xs0m", icon: Github },
  { label: "LinkedIn", href: "https://linkedin.com/in/somchandra", icon: Linkedin },
  { label: "Email", href: "mailto:hello@0xs0m.live", icon: Mail },
  { label: "0xs0m.live", href: "https://0xs0m.live", icon: ExternalLink },
]

const tracks = [
  { title: "Starboy", artist: "The Weeknd", album: "Starboy" },
  { title: "Blinding Lights", artist: "The Weeknd", album: "After Hours" },
  { title: "Bohemian Rhapsody", artist: "Queen", album: "A Night at the Opera" },
  { title: "Numb", artist: "Linkin Park", album: "Meteora" },
  { title: "Stairway to Heaven", artist: "Led Zeppelin", album: "Led Zeppelin IV" },
  { title: "Under Pressure", artist: "Queen & Bowie", album: "Hot Space" },
  { title: "Comfortably Numb", artist: "Pink Floyd", album: "The Wall" },
  { title: "Paint It Black", artist: "The Rolling Stones", album: "Aftermath" },
]

export default function Home() {
  const [loading, setLoading] = useState(true)
  const [exitSide, setExitSide] = useState<"nerdy" | "creative" | null>(null)

  const handleLoadComplete = useCallback(() => {
    setLoading(false)
  }, [])

  return (
    <>
      <CustomCursor />
      <PaperOverlay />

      <AnimatePresence>
        {loading && <Loader onComplete={handleLoadComplete} />}
      </AnimatePresence>

      {!loading && (
        <motion.main
          className="relative min-h-screen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          {/* Ruled lines background */}
          <div className="ruled-lines fixed inset-0 pointer-events-none opacity-30 z-0" aria-hidden />

          {/* ---- HERO / INTRO ---- */}
          <section className="relative z-10 mx-auto max-w-5xl px-6 pt-20 pb-16 md:pt-32 md:pb-24">
            {/* Top line decoration */}
            <motion.div
              className="mb-12 h-px bg-[#e8e8e8]"
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
            />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
            >
              <p className="font-mono text-xs tracking-widest uppercase text-[#555] mb-4">
                est. somewhere in cyberspace
              </p>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-[#e8e8e8] leading-[1.1]">
                <span className="block">Two sides.</span>
                <span className="block mt-1">One person.</span>
              </h1>
              <p className="mt-6 max-w-lg text-base md:text-lg text-[#888] leading-relaxed">
                I break into systems by day and build frames by night.
                Cybersecurity engineer, photographer, sketch artist --
                pick a side and see what happens.
              </p>
            </motion.div>

            {/* Decorative line */}
            <motion.div
              className="mt-12 h-px bg-[#2a2a2a]"
              initial={{ width: 0 }}
              animate={{ width: "60%" }}
              transition={{ duration: 0.8, delay: 0.8 }}
            />
          </section>

          {/* ---- THE BIG CHOICE ---- */}
          <section className="relative z-10 mx-auto max-w-5xl px-6 pb-20">
            <motion.p
              className="font-mono text-xs tracking-widest uppercase text-[#555] mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              choose your side
            </motion.p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {/* NERDY SIDE */}
              <motion.div
                initial={{ opacity: 0, y: 30, rotate: -0.5 }}
                animate={{ opacity: 1, y: 0, rotate: -0.5 }}
                transition={{ duration: 0.6, delay: 1.1 }}
                whileHover={{ rotate: 0, y: -4, boxShadow: "4px 4px 0px #222" }}
                className="group relative"
              >
                <Link href={exitSide ? "#" : "/nerdy"} onClick={() => setExitSide("nerdy")} data-hover>
                  <div className="paper-card relative p-8 md:p-10 tape-top overflow-hidden min-h-[280px] flex flex-col justify-between">
                    {/* Faint stain */}
                    <div
                      className="absolute -top-4 -right-4 w-[100px] h-[100px] pointer-events-none opacity-60"
                      aria-hidden
                      style={{
                        borderRadius: "50%",
                        background: "radial-gradient(ellipse, transparent 40%, rgba(255,255,255,0.03) 50%, transparent 62%)",
                      }}
                    />

                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex h-10 w-10 items-center justify-center border border-[#2a2a2a]">
                          <Terminal className="h-5 w-5 text-[#e8e8e8]" />
                        </div>
                        <span className="font-mono text-xs text-[#555]">{">_"}</span>
                      </div>

                      <h2 className="text-2xl md:text-3xl font-bold text-[#e8e8e8] tracking-tight mb-3">
                        The Nerdy Side
                      </h2>
                      <p className="text-sm text-[#888] leading-relaxed max-w-xs">
                        Resume, hacking tools, security research,
                        certifications, and everything that runs on logic.
                      </p>
                    </div>

                    <div className="mt-8 flex items-center gap-2 text-sm font-mono text-[#555] group-hover:text-[#e8e8e8] transition-colors">
                      <span>explore</span>
                      <motion.span
                        className="inline-block"
                        animate={{ x: [0, 4, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                      >
                        {" ->"}
                      </motion.span>
                    </div>

                    {/* Bottom border accent */}
                    <div className="absolute bottom-0 left-0 h-[3px] w-0 bg-[#e8e8e8] group-hover:w-full transition-all duration-500" />
                  </div>
                </Link>
              </motion.div>

              {/* CREATIVE SIDE */}
              <motion.div
                initial={{ opacity: 0, y: 30, rotate: 0.5 }}
                animate={{ opacity: 1, y: 0, rotate: 0.5 }}
                transition={{ duration: 0.6, delay: 1.3 }}
                whileHover={{ rotate: 0, y: -4, boxShadow: "4px 4px 0px #222" }}
                className="group relative"
              >
                <Link href={exitSide ? "#" : "/creative"} onClick={() => setExitSide("creative")} data-hover>
                  <div className="paper-card relative p-8 md:p-10 tape-top overflow-hidden min-h-[280px] flex flex-col justify-between">
                    {/* Ink splatter */}
                    <div
                      className="absolute bottom-6 left-6 w-[30px] h-[30px] pointer-events-none"
                      aria-hidden
                      style={{
                        borderRadius: "50%",
                        background: "radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%)",
                      }}
                    />

                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex h-10 w-10 items-center justify-center border border-[#2a2a2a]">
                          <Pen className="h-5 w-5 text-[#e8e8e8]" />
                        </div>
                        <span className="font-mono text-xs text-[#555]">~</span>
                      </div>

                      <h2 className="text-2xl md:text-3xl font-bold text-[#e8e8e8] tracking-tight mb-3">
                        The Creative Side
                      </h2>
                      <p className="text-sm text-[#888] leading-relaxed max-w-xs">
                        Photography, sketches, visual experiments,
                        and everything that runs on caffeine and feeling.
                      </p>
                    </div>

                    <div className="mt-8 flex items-center gap-2 text-sm font-mono text-[#555] group-hover:text-[#e8e8e8] transition-colors">
                      <span>explore</span>
                      <motion.span
                        className="inline-block"
                        animate={{ x: [0, 4, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                      >
                        {" ->"}
                      </motion.span>
                    </div>

                    <div className="absolute bottom-0 left-0 h-[3px] w-0 bg-[#e8e8e8] group-hover:w-full transition-all duration-500" />
                  </div>
                </Link>
              </motion.div>
            </div>
          </section>

          {/* ---- SPOTIFY / NOW PLAYING ---- */}
          <section className="relative z-10 mx-auto max-w-5xl px-6 pb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6 }}
            >
              <div className="border-t border-[#2a2a2a] pt-12">
                <div className="flex items-center gap-3 mb-8">
                  <p className="font-mono text-xs tracking-widest uppercase text-[#555]">
                    currently vibing to
                  </p>
                  {/* Spinning vinyl */}
                  <div className="relative h-6 w-6">
                    <div
                      className="absolute inset-0 border border-[#2a2a2a]"
                      style={{
                        borderRadius: "50%",
                        animation: "spin-vinyl 3s linear infinite",
                      }}
                    >
                      <div
                        className="absolute top-1/2 left-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 bg-[#e8e8e8]"
                        style={{ borderRadius: "50%" }}
                      />
                    </div>
                  </div>
                </div>

                {/* Scrollable track list */}
                <div className="overflow-x-auto pb-4 -mx-6 px-6">
                  <div className="flex gap-4" style={{ minWidth: "max-content" }}>
                    {tracks.map((track, i) => (
                      <motion.div
                        key={track.title}
                        className="paper-card flex-shrink-0 w-52 p-5"
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.08, duration: 0.4 }}
                        style={{ rotate: i % 2 === 0 ? "-0.4deg" : "0.4deg" }}
                        whileHover={{ rotate: 0, y: -3 }}
                      >
                        {/* Album art placeholder */}
                        <div className="mb-3 aspect-square w-full border border-[#2a2a2a] bg-[#1a1a1a] flex items-center justify-center">
                          <div className="h-8 w-8 border border-[#2a2a2a]" style={{ borderRadius: "50%" }}>
                            <div className="h-full w-full flex items-center justify-center">
                              <div className="h-2 w-2 bg-[#e8e8e8]" style={{ borderRadius: "50%" }} />
                            </div>
                          </div>
                        </div>
                        <p className="text-sm font-bold text-[#e8e8e8] truncate">{track.title}</p>
                        <p className="text-xs text-[#666] truncate mt-0.5">{track.artist}</p>
                        <p className="text-xs text-[#444] truncate mt-0.5 font-mono">{track.album}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </section>

          {/* ---- SOCIALS ---- */}
          <section className="relative z-10 mx-auto max-w-5xl px-6 pb-16">
            <motion.div
              className="border-t border-[#2a2a2a] pt-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6 }}
            >
              <p className="font-mono text-xs tracking-widest uppercase text-[#555] mb-8">
                find me elsewhere
              </p>

              <div className="flex flex-wrap gap-4">
                {socials.map((s, i) => (
                  <motion.a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="paper-card flex items-center gap-3 px-5 py-3 text-sm text-[#888] hover:text-[#e8e8e8] transition-colors"
                    data-hover
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.4 }}
                    whileHover={{ y: -2, boxShadow: "3px 3px 0px #222" }}
                    style={{ rotate: i % 2 === 0 ? "-0.3deg" : "0.3deg" }}
                  >
                    <s.icon className="h-4 w-4" />
                    <span className="draw-underline">{s.label}</span>
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </section>

          {/* ---- FOOTER ---- */}
          <footer className="relative z-10 border-t border-[#2a2a2a]">
            <div className="mx-auto max-w-5xl px-6 py-8 flex items-center justify-between">
              <p className="font-mono text-xs text-[#555]">
                som chandra -- 2025
              </p>
              <p className="font-mono text-xs text-[#333]">
                built with paper and ink
              </p>
            </div>
          </footer>
        </motion.main>
      )}
    </>
  )
}
