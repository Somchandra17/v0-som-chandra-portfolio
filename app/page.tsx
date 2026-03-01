"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Terminal, Pen, Github, Linkedin, Mail, ExternalLink, ArrowRight, ArrowDown, Music } from "lucide-react"

const socials = [
  { label: "GitHub", href: "https://github.com/somchandra17", icon: Github },
  { label: "LinkedIn", href: "https://linkedin.com/in/somchandra17", icon: Linkedin },
  { label: "Email", href: "mailto:somchandra.infosec@gmail.com", icon: Mail },
  { label: "0xs0m.live", href: "https://0xs0m.live", icon: ExternalLink },
]

const funFacts = [
  "probably debugging something rn",
  "or doodling in a notebook",
  "or both at the same time",
  "definitely needs more coffee",
  "has mass tabs open",
  "talking to rubber duck",
  "googling error for the 47th time",
]

export default function Home() {
  const [hoverSide, setHoverSide] = useState<"nerdy" | "creative" | null>(null)
  const [factIdx, setFactIdx] = useState(0)

  // auto-cycle fun facts
  useEffect(() => {
    const interval = setInterval(() => {
      setFactIdx((p) => (p + 1) % funFacts.length)
    }, 2500)
    return () => clearInterval(interval)
  }, [])

  return (
    <main className="relative min-h-screen">

      {/* ---- HERO: fills viewport ---- */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 flex flex-col justify-center min-h-screen">
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
            oh hey, you found this page
          </p>

          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[#e8e8e8] leading-[1.15]">
            <span className="block">{"i'm som."}</span>
            <span className="block mt-2 text-[#777]">
              {"i break things "}
              <span className="text-[#e8e8e8] scribble-underline">{"for work"}</span>
            </span>
            <span className="block mt-1 text-[#777]">
              {"& make things "}
              <span className="text-[#e8e8e8] scribble-underline">{"for fun"}</span>
              {"."}
            </span>
          </h1>

          {/* Auto-cycling fun fact */}
          <div className="mt-6 h-6 overflow-hidden">
            <motion.p
              key={factIdx}
              className="font-mono text-sm text-[#555]"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
            >
              {"( "}
              {funFacts[factIdx]}
              {" )"}
            </motion.p>
          </div>
        </motion.div>

        <motion.div
          className="mt-10 h-px bg-[#2a2a2a]"
          initial={{ width: 0 }}
          animate={{ width: "50%" }}
          transition={{ duration: 0.7, delay: 0.7 }}
        />

        {/* ---- THE CHOICE ---- */}
        <motion.div
          className="mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          <p className="font-mono text-xs tracking-widest uppercase text-[#777] mb-6">
            pick a side
          </p>

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
                <div className="paper-card relative p-7 md:p-9 min-h-[220px] flex flex-col justify-between overflow-hidden hover-wiggle">
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
                      {"resume, hacking stuff, certs, all that serious jazz."}
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
                <div className="paper-card relative p-7 md:p-9 min-h-[220px] flex flex-col justify-between overflow-hidden hover-wiggle">
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
                      {"photos, sketches, late-night scribbles. the fun stuff."}
                    </p>
                    <p className="mt-3 text-xs font-mono text-[#555] group-hover:text-[#e8e8e8] transition-colors italic">
                      {"aka the fun one"}
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
          </div>

          {/* Hover indicator */}
          <motion.p
            className="mt-5 font-mono text-xs text-[#444] h-5"
            animate={{ opacity: hoverSide ? 1 : 0 }}
          >
            {hoverSide === "nerdy"
              ? "yes there's a resume. yes you can hire me. yes I'm great."
              : hoverSide === "creative"
              ? "warning: may contain bad sketches and worse opinions"
              : ""}
          </motion.p>
        </motion.div>

        {/* Scroll hint at bottom of viewport */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <p className="font-mono text-xs text-[#555]">scroll for more</p>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <ArrowDown className="h-4 w-4 text-[#555]" />
          </motion.div>
        </motion.div>
      </section>

      {/* ---- SPOTIFY (below the fold) ---- */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          <div className="border-t border-[#2a2a2a] pt-12">
            <div className="flex items-center gap-3 mb-2">
              <Music className="h-4 w-4 text-[#777]" />
              <p className="font-mono text-xs tracking-widest uppercase text-[#777]">
                what i listen to
              </p>
            </div>
            <p className="text-sm text-[#555] mb-8">
              {"judge me by my playlist, i dare you"}
            </p>

            {/* Actual Spotify embed */}
            <div className="paper-card overflow-hidden">
              <iframe
                style={{ borderRadius: 0, border: "none" }}
                src="https://open.spotify.com/embed/playlist/7fOEf8vDsrfgMMjU9fNiP1?utm_source=generator&theme=0"
                width="100%"
                height="352"
                allowFullScreen
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                title="Spotify Playlist"
              />
            </div>
          </div>
        </motion.div>
      </section>

      {/* ---- SOCIALS (below the fold) ---- */}
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
