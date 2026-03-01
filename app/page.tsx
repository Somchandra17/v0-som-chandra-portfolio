"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Terminal, Pen, Github, Linkedin, Mail, ExternalLink, Music, ArrowRight } from "lucide-react"

const socials = [
  { label: "GitHub", href: "https://github.com/0xs0m", icon: Github },
  { label: "LinkedIn", href: "https://linkedin.com/in/somchandra", icon: Linkedin },
  { label: "Email", href: "mailto:hello@0xs0m.live", icon: Mail },
  { label: "0xs0m.live", href: "https://0xs0m.live", icon: ExternalLink },
]

const tracks = [
  { title: "Starboy", artist: "The Weeknd", color: "#e8e8e8" },
  { title: "Blinding Lights", artist: "The Weeknd", color: "#ccc" },
  { title: "Bohemian Rhapsody", artist: "Queen", color: "#e8e8e8" },
  { title: "Numb", artist: "Linkin Park", color: "#ccc" },
  { title: "Stairway to Heaven", artist: "Led Zeppelin", color: "#e8e8e8" },
  { title: "Under Pressure", artist: "Queen & Bowie", color: "#ccc" },
  { title: "Comfortably Numb", artist: "Pink Floyd", color: "#e8e8e8" },
  { title: "Paint It Black", artist: "Rolling Stones", color: "#ccc" },
]

const doodles = [
  "( probably debugging something rn )",
  "( or doodling in a notebook )",
  "( or both at the same time )",
  "( definitely needs more coffee )",
]

export default function Home() {
  const [hoverSide, setHoverSide] = useState<"nerdy" | "creative" | null>(null)
  const [doodleIdx, setDoodleIdx] = useState(0)
  const [clickCount, setClickCount] = useState(0)

  const cycleDoodle = () => {
    setDoodleIdx((p) => (p + 1) % doodles.length)
    setClickCount((p) => p + 1)
  }

  return (
    <main className="relative min-h-screen">

      {/* ---- HERO ---- */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 pt-16 pb-12 md:pt-28 md:pb-20">
        <motion.div
          className="mb-10 h-px bg-[#e8e8e8]"
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.1 }}
        />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <p className="font-mono text-xs tracking-widest uppercase text-[#777] mb-6">
            oh hey, welcome to my corner of the internet
          </p>

          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[#e8e8e8] leading-[1.15]">
            <span className="block">{"i'm som."}</span>
            <span className="block mt-1 text-[#777]">
              {"i do "}
              <span className="text-[#e8e8e8] scribble-underline">two very different things</span>
              {"."}
            </span>
          </h1>

          {/* Clickable doodle */}
          <motion.button
            onClick={cycleDoodle}
            className="mt-6 font-mono text-sm text-[#555] hover:text-[#999] transition-colors cursor-pointer"
            data-hover
            whileTap={{ scale: 0.97 }}
            key={doodleIdx}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {doodles[doodleIdx]}
            {clickCount > 3 && (
              <span className="ml-2 text-[#444]">{"(stop clicking this)"}</span>
            )}
          </motion.button>
        </motion.div>

        <motion.div
          className="mt-10 h-px bg-[#2a2a2a]"
          initial={{ width: 0 }}
          animate={{ width: "50%" }}
          transition={{ duration: 0.7, delay: 0.7 }}
        />
      </section>

      {/* ---- THE CHOICE ---- */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 pb-16">
        <motion.p
          className="font-mono text-xs tracking-widest uppercase text-[#777] mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          pick a door
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
          {/* NERDY */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1 }}
            onHoverStart={() => setHoverSide("nerdy")}
            onHoverEnd={() => setHoverSide(null)}
            className="group"
          >
            <Link href="/nerdy" data-hover>
              <div className="paper-card relative p-7 md:p-9 min-h-[240px] flex flex-col justify-between overflow-hidden hover-wiggle">
                <div className="tape-top" />

                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-9 w-9 items-center justify-center border border-[#2a2a2a]">
                      <Terminal className="h-4 w-4 text-[#e8e8e8]" />
                    </div>
                    <span className="font-mono text-xs text-[#555]">{"> whoami"}</span>
                  </div>

                  <h2 className="text-xl md:text-2xl font-bold text-[#e8e8e8] tracking-tight mb-2">
                    the nerdy side
                  </h2>
                  <p className="text-sm text-[#999] leading-relaxed max-w-xs">
                    {"resume, hacking stuff, security things. the professional act."}
                  </p>
                  <p className="mt-3 text-xs font-mono text-[#555] group-hover:text-[#e8e8e8] transition-colors italic">
                    {"psst -- wanna hire me?"}
                  </p>
                </div>

                <div className="mt-4 flex items-center gap-2 text-sm font-mono text-[#555] group-hover:text-[#e8e8e8] transition-colors">
                  <span>go there</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </div>

                <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-[#e8e8e8] group-hover:w-full transition-all duration-500" />
              </div>
            </Link>
          </motion.div>

          {/* CREATIVE */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.15 }}
            onHoverStart={() => setHoverSide("creative")}
            onHoverEnd={() => setHoverSide(null)}
            className="group"
          >
            <Link href="/creative" data-hover>
              <div className="paper-card relative p-7 md:p-9 min-h-[240px] flex flex-col justify-between overflow-hidden hover-wiggle">
                <div className="tape-top" />

                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-9 w-9 items-center justify-center border border-[#2a2a2a]">
                      <Pen className="h-4 w-4 text-[#e8e8e8]" />
                    </div>
                    <span className="font-mono text-xs text-[#555]">~</span>
                  </div>

                  <h2 className="text-xl md:text-2xl font-bold text-[#e8e8e8] tracking-tight mb-2">
                    the unhinged side
                  </h2>
                  <p className="text-sm text-[#999] leading-relaxed max-w-xs">
                    {"photos, sketches, late-night thoughts. the stuff that doesn't go on a resume."}
                  </p>
                  <p className="mt-3 text-xs font-mono text-[#555] group-hover:text-[#e8e8e8] transition-colors italic">
                    {"aka the fun one"}
                  </p>
                </div>

                <div className="mt-6 flex items-center gap-2 text-sm font-mono text-[#555] group-hover:text-[#e8e8e8] transition-colors">
                  <span>go there</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </div>

                <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-[#e8e8e8] group-hover:w-full transition-all duration-500" />
              </div>
            </Link>
          </motion.div>
        </div>

        {/* Hover indicator */}
        <motion.p
          className="mt-5 font-mono text-xs text-[#444] h-5"
          animate={{ opacity: hoverSide ? 1 : 0 }}
        >
          {hoverSide === "nerdy"
            ? "yes there's a resume in there. yes you can hire me."
            : hoverSide === "creative"
            ? "warning: the unhinged side may contain bad sketches and worse opinions"
            : ""}
        </motion.p>
      </section>

      {/* ---- SPOTIFY ---- */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
        >
          <div className="border-t border-[#2a2a2a] pt-10">
            {/* Header */}
            <div className="flex items-center gap-3 mb-2">
              <Music className="h-4 w-4 text-[#777]" />
              <p className="font-mono text-xs tracking-widest uppercase text-[#777]">
                what i listen to
              </p>
            </div>
            <p className="text-sm text-[#555] mb-8">
              {"(my taste is immaculate, don't @ me)"}
            </p>

            {/* Scrollable vinyl-style track strip */}
            <div className="overflow-x-auto pb-4 -mx-6 px-6 scrollbar-hide">
              <div className="flex gap-4" style={{ minWidth: "max-content" }}>
                {tracks.map((track, i) => (
                  <motion.div
                    key={track.title}
                    className="flex-shrink-0 group"
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06, duration: 0.35 }}
                  >
                    <div
                      className="paper-card w-44 overflow-hidden hover-bounce"
                      data-hover
                    >
                      {/* Vinyl disc visual */}
                      <div className="relative aspect-square w-full bg-[#0e0e0e] flex items-center justify-center overflow-hidden border-b border-[#2a2a2a]">
                        {/* Grooves */}
                        <div className="absolute inset-3 border border-[#1e1e1e] rounded-full" />
                        <div className="absolute inset-6 border border-[#1a1a1a] rounded-full" />
                        <div className="absolute inset-9 border border-[#1e1e1e] rounded-full" />
                        <div className="absolute inset-12 border border-[#1a1a1a] rounded-full" />
                        {/* Center label */}
                        <div
                          className="relative h-10 w-10 bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center group-hover:animate-[spin-vinyl_2s_linear_infinite]"
                          style={{ borderRadius: "50%" }}
                        >
                          <div className="h-2 w-2 bg-[#e8e8e8]" style={{ borderRadius: "50%" }} />
                        </div>
                      </div>

                      <div className="p-3">
                        <p className="text-sm font-bold text-[#e8e8e8] truncate">{track.title}</p>
                        <p className="text-xs text-[#777] truncate mt-0.5">{track.artist}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ---- SOCIALS ---- */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 pb-14">
        <motion.div
          className="border-t border-[#2a2a2a] pt-10"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5 }}
        >
          <p className="font-mono text-xs tracking-widest uppercase text-[#777] mb-2">
            find me elsewhere
          </p>
          <p className="text-sm text-[#555] mb-6">
            {"(i sometimes reply)"}
          </p>

          <div className="flex flex-wrap gap-3">
            {socials.map((s, i) => (
              <motion.a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="paper-card flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#999] hover:text-[#e8e8e8] transition-colors hover-bounce"
                data-hover
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.35 }}
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
        <div className="mx-auto max-w-5xl px-6 py-7 flex items-center justify-between">
          <p className="font-mono text-xs text-[#555]">
            som chandra -- 2025
          </p>
          <p className="font-mono text-xs text-[#444]">
            made with mass of coffee
          </p>
        </div>
      </footer>
    </main>
  )
}
