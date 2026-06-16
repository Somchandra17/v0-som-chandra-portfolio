"use client"

import { useState, useEffect, useRef, type MouseEvent } from "react"
import { motion, AnimatePresence, useReducedMotion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import { MusicDCTF } from "@/components/musicd-ctf"
import { TextMorph } from "@/components/text-morph"
import { PretextHighlight } from "@/components/pretext-highlight"
import { SpotifyNowPlayingContent } from "@/components/now-playing"
import { SpotifyArtwork } from "@/components/spotify-artwork"
import { ParticleField } from "@/components/cosmic/particle-field"
import { FloatingSvgs } from "@/components/cosmic/floating-svgs"
import { fonts, measureTextWidth, usePretextReady } from "@/lib/pretext"
import { fetcher, type Artist, type NowPlayingData, type RecentTrack, type Track } from "@/lib/creative-data"
import {
  Terminal, Pen, Github, Linkedin, Mail, ExternalLink,
  ArrowRight, ArrowDown, Music, Headphones, Users, Clock,
  Briefcase
} from "lucide-react"

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function fallbackWidth(text: string, fontSize: number) {
  return Math.ceil(text.length * fontSize * 0.58)
}

function setSessionFlag(key: string, value: string) {
  if (typeof window === "undefined") return
  try {
    window.sessionStorage.setItem(key, value)
  } catch {}
}

function getSessionFlag(key: string) {
  if (typeof window === "undefined") return null
  try {
    return window.sessionStorage.getItem(key)
  } catch {
    return null
  }
}

function formatPlayedLabel(playedAt: string) {
  const playedDate = new Date(playedAt)
  if (Number.isNaN(playedDate.getTime())) return "recent"
  return playedDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

const socials = [
  { label: "GitHub", href: "https://github.com/somchandra17", icon: Github },
  { label: "LinkedIn", href: "https://linkedin.com/in/somchandra17", icon: Linkedin },
  { label: "Email", href: "mailto:somchandra.infosec@gmail.com", icon: Mail },
  { label: "somm.tf", href: "https://www.somm.tf", icon: ExternalLink },
]

const SPOTIFY_SECTION_LIMIT = 6

const funFacts = [
  "i break things for a living.",
  "i draw things nobody asked for.",
  "i take photos of random things.",
  "cybersecurity by day, doodling by night.",
  "i have two personalities and one website.",
  "a can of white monster would be helpfull"
]

const heroLines = [
  "probably debugging something rn",
  "or doodling in a notebook",
  "or both at the same time",
  "probably missing her rn",
  "sleep is just a variable I never initialize",
  "talking to rubber duck again",
  "accidentally rm -rf'd something important",
  "pretending to understand kubernetes",
  "ctrl+z is my best friend",
  "alt-tabbing between terminal and spotify",
  "wrote a script to automate a 2-min task. took 3 hours.",
  "sudo make me a sandwich",
  "renaming variables for the 5th time today",
  "accidentally opened vim. send help.",
  "refactoring code I wrote 2 weeks ago like it's someone else's"
]

export default function Home() {
  const router = useRouter()
  const [hoverSide, setHoverSide] = useState<"nerdy" | "creative" | null>(null)
  const [nameMode, setNameMode] = useState<"default" | "nerdy" | "creative">("default")
  const [isHoverLocked, setIsHoverLocked] = useState(false)
  const [isNerdyRouting, setIsNerdyRouting] = useState(false)
  const [factIdx, setFactIdx] = useState(0)

  const cycleName = () => {
    setSessionFlag("som-name-clicked", "1")
    setIsHoverLocked(true)
    setNameMode((prev) => prev === "default" ? "nerdy" : prev === "nerdy" ? "default" : "default")
  }

  const handleNerdyOpen = (event: MouseEvent<HTMLAnchorElement>) => {
    if (isNerdyRouting) {
      event.preventDefault()
      return
    }

    const hasClickedName = getSessionFlag("som-name-clicked") === "1"
    if (hasClickedName) return

    event.preventDefault()
    setIsNerdyRouting(true)
    setHoverSide("nerdy")
    setIsHoverLocked(true)
    setNameMode("nerdy")

    window.setTimeout(() => {
      router.push("/nerdy")
    }, 420)
  }

  const nameConfig = {
    default: { text: "som", color: "#f0c6cf", shadow: "0 0 6px rgba(240, 198, 207, 0.25)" },
    nerdy: { text: "0xs0m", color: "#7fb07f", shadow: "0 0 8px rgba(127, 176, 127, 0.4)" },
    creative: { text: "som", color: "#f0c6cf", shadow: "0 0 6px rgba(240, 198, 207, 0.25)" },
  }
  const [heroIdx, setHeroIdx] = useState(0)

  const heroRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 1], [0, -100]);

  const { data: nowPlaying } = useSWR<NowPlayingData>("/api/spotify/now-playing", fetcher, { refreshInterval: 30000 })
  const { data: topTracksData } = useSWR<{ tracks: Track[] }>("/api/spotify/top-tracks", fetcher)
  const { data: topArtistsData } = useSWR<{ artists: Artist[] }>("/api/spotify/top-artists", fetcher)
  const { data: recentData } = useSWR<{ tracks: RecentTrack[] }>("/api/spotify/recently-played", fetcher)
  const pretextReady = usePretextReady()
  const [isCompactSpotify, setIsCompactSpotify] = useState(false)

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const prefersReduced = useReducedMotion()

  // Spring animations for smooth parallax
  const springConfig = { damping: 30, stiffness: 100 }
  const parallaxX = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), springConfig)
  const parallaxY = useSpring(useTransform(mouseY, [-0.5, 0.5], [-10, 10]), springConfig)
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [4, -4]), springConfig)
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-4, 4]), springConfig)

  useEffect(() => {
    // Card tilt only on fine pointers, and never under reduced motion.
    if (prefersReduced || !window.matchMedia("(pointer: fine)").matches) return
    let rafId = 0
    let pending = false
    let lastX = 0
    let lastY = 0
    const flush = () => {
      pending = false
      mouseX.set(lastX)
      mouseY.set(lastY)
    }
    const handleMouseMove = (e: globalThis.MouseEvent) => {
      // Normalize to -0.5 -> 0.5
      lastX = e.clientX / window.innerWidth - 0.5
      lastY = e.clientY / window.innerHeight - 0.5
      if (!pending) {
        pending = true
        rafId = requestAnimationFrame(flush)
      }
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      cancelAnimationFrame(rafId)
    }
  }, [mouseX, mouseY, prefersReduced])

  useEffect(() => {
    const interval = setInterval(() => {
      setFactIdx((p) => (p + 1) % funFacts.length)
    }, 2200)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setHeroIdx((p) => (p + 1) % heroLines.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    const media = window.matchMedia("(max-width: 767px)")
    const update = () => setIsCompactSpotify(media.matches)
    update()
    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", update)
      return () => media.removeEventListener("change", update)
    }
    media.addListener(update)
    return () => media.removeListener(update)
  }, [])

  const topTracks = topTracksData?.tracks || []
  const topArtists = topArtistsData?.artists || []
  const recentTracks = recentData?.tracks || []
  const measure = (text: string, font: string, fontSize: number) => (
    pretextReady ? measureTextWidth(text, font) : fallbackWidth(text, fontSize)
  )

  const topArtistCards = topArtists.slice(0, SPOTIFY_SECTION_LIMIT).map((artist) => {
    const genreLabel = artist.genres.join(", ")
    const nameWidth = measure(artist.name, fonts.bold(14), 14)
    const genreWidth = genreLabel ? measure(genreLabel, fonts.body(12), 12) : 0
    const cardWidth = clamp(Math.ceil(Math.max(nameWidth, genreWidth, 90) + 42), 140, 220)
    return { ...artist, cardWidth, genreLabel }
  })

  const topTrackRows = topTracks.slice(0, SPOTIFY_SECTION_LIMIT).map((track, i) => {
    const titleWidth = measure(track.title, fonts.bold(14), 14)
    const artistWidth = measure(track.artist, fonts.body(12), 12)
    const cardWidth = clamp(Math.ceil(Math.max(titleWidth, artistWidth) + 145), 260, 470)
    return { ...track, cardWidth, rankLabel: String(i + 1).padStart(2, "0") }
  })

  const recentTrackRows = recentTracks.slice(0, SPOTIFY_SECTION_LIMIT).map((track) => {
    const titleWidth = measure(track.title, fonts.body(14), 14)
    const artistWidth = measure(track.artist, fonts.body(12), 12)
    const playedLabel = formatPlayedLabel(track.playedAt)
    const playedWidth = measure(playedLabel, fonts.mono(12), 12)
    const cardWidth = clamp(Math.ceil(Math.max(titleWidth, artistWidth) + playedWidth + 130), 270, 560)
    return { ...track, cardWidth, playedLabel }
  })

  return (
    <main className="relative min-h-screen bg-[#07060d]">
      <ParticleField />
      <FloatingSvgs hoverSide={hoverSide} />

      {/* ---- HERO: fills viewport ---- */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center pt-10">
        <motion.div
          className="relative z-10 mx-auto w-full max-w-5xl px-6 flex flex-col justify-center"
          style={{ opacity: prefersReduced ? 1 : heroOpacity, y: prefersReduced ? 0 : heroY }}
        >
          <motion.div
            className="mb-10 h-px bg-[#2a2a2a]"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "100%", opacity: 1 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          />

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <p className="font-mono text-xs tracking-widest uppercase text-[#999] mb-6">
              oh hey, you found this page
            </p>

            <h1 className="text-[clamp(3.5rem,9vw,6.5rem)] font-bold tracking-[-0.03em] text-[#e8e8e8] leading-[1.03]">
              <button
                type="button"
                className="block cursor-pointer border-0 bg-transparent p-0 text-left flex items-baseline gap-3 relative z-20"
                onClick={cycleName}
                aria-label="Toggle between som and 0xs0m"
              >
                <span>{"i'm"}</span>
                <span className="flex items-baseline">
                  <TextMorph
                    text={nameConfig[nameMode].text}
                    className={nameMode === "nerdy" ? "font-mono" : ""}
                    style={{
                      color: nameConfig[nameMode].color,
                      textShadow: nameConfig[nameMode].shadow,
                    }}
                  />
                  <span style={{ color: nameConfig[nameMode].color, textShadow: nameConfig[nameMode].shadow }}>.</span>
                </span>
              </button>
            </h1>

            {/* Cycling hero tagline with pretext-measured highlight */}
            <div className="mt-4 h-10 md:h-12 relative z-20">
              <PretextHighlight
                lines={heroLines}
                currentIndex={heroIdx}
                fontSize={24}
                bgColor="#e2d2c1"
                textColor="#111"
                paddingX={8}
                paddingY={4}
              />
            </div>

            {/* Auto-cycling fun fact */}
            <div className="mt-8 h-6 overflow-hidden relative z-20">
              <AnimatePresence mode="wait">
                <motion.p
                  key={factIdx}
                  className="font-mono text-sm text-[#888]"
                  initial={{ opacity: 0, y: 14, x: -4 }}
                  animate={{ opacity: 1, y: 0, x: 0 }}
                  exit={{ opacity: 0, y: -10, x: 4 }}
                  transition={{ duration: 0.28, ease: "easeOut" }}
                >
                  {"/ "}
                  {funFacts[factIdx]}
                </motion.p>
              </AnimatePresence>
            </div>
          </motion.div>

          <motion.div
            className="mt-14 h-px bg-gradient-to-r from-transparent via-[#333] to-transparent"
            initial={{ width: 0 }}
            animate={{ width: "60%" }}
            transition={{ duration: 1.5, delay: 0.7, ease: "easeInOut" }}
          />

          {/* ---- THE CHOICE ---- */}
          <motion.div
            className="mt-12 relative z-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            <p className="font-mono text-xs tracking-widest uppercase text-[#999] mb-6">
              pick a side
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6 max-w-2xl">
              {/* NERDY */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1 }}
                onHoverStart={() => { setHoverSide("nerdy"); if (!isHoverLocked) setNameMode("nerdy") }}
                onHoverEnd={() => { setHoverSide(null); if (!isHoverLocked) setNameMode("default") }}
                className="group h-full"
              >
                <motion.div style={{ x: parallaxX, y: parallaxY, rotateX, rotateY, perspective: 1000 }} className="h-full">
                  <Link href="/nerdy" onClick={handleNerdyOpen} className="block h-full cursor-pointer">
                    <motion.div
                      whileHover={{ y: -8, scale: 1.02 }}
                      className="paper-card crt-scanlines isolate relative p-7 md:p-9 min-h-[220px] h-full flex flex-col justify-between overflow-hidden"
                      animate={nameMode === "nerdy" ? {
                      borderColor: "#7fb07f",
                      boxShadow: "0 0 34px rgba(127, 176, 127, 0.16)"
                    } : {
                      borderColor: "#2a2a2a",
                      boxShadow: "none"
                    }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="tape-top" />
                    {/* CRT terminal backdrop */}
                    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
                      <pre className="absolute right-1 top-1 m-0 select-none whitespace-pre font-mono text-[9px] leading-[1.6] text-[#7fb07f]/10 transition-colors duration-500 group-hover:text-[#7fb07f]/20">{`$ whoami
0xs0m
$ nmap -sV 10.0.0.1
[+] 22/tcp  open  ssh
[+] 443/tcp open  https
$ ./exploit --pwn`}</pre>
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <motion.div
                          className="flex h-9 w-9 items-center justify-center border"
                          animate={nameMode === "nerdy" ? {
                            borderColor: "#7fb07f",
                            color: "#7fb07f"
                          } : {
                            borderColor: "#444",
                            color: "#e8e8e8"
                          }}
                          transition={{ duration: 0.5 }}
                        >
                          <Terminal className="h-4 w-4" />
                        </motion.div>
                        <motion.span
                          className="font-mono text-xs"
                          animate={nameMode === "nerdy" ? { color: "#7fb07f" } : { color: "#888" }}
                          transition={{ duration: 0.5 }}
                        >
                          {"> whoami"}
                        </motion.span>
                      </div>
                      <motion.h2
                        className="text-xl md:text-2xl font-bold tracking-tight mb-2"
                        animate={nameMode === "nerdy" ? { color: "#7fb07f" } : { color: "#e8e8e8" }}
                        transition={{ duration: 0.5 }}
                      >
                        the nerdy side
                      </motion.h2>
                      <p className="text-sm text-[#aaa] leading-relaxed max-w-xs">
                        resume, hacking stuff, certs, all that serious jazz.
                      </p>
                      <p className="mt-3 text-xs font-mono text-[#666] group-hover:text-[#e8e8e8] transition-colors italic">
                        psst -- wanna hire me?
                      </p>
                    </div>
                    <div className="mt-6 flex items-center gap-2 text-sm font-mono text-[#666] group-hover:text-[#e8e8e8] transition-colors">
                      <span>go there</span>
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </div>
                  </motion.div>
                </Link>
                </motion.div>
              </motion.div>

              {/* CREATIVE */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.15 }}
                onHoverStart={() => setHoverSide("creative")}
                onHoverEnd={() => setHoverSide(null)}
                className="group h-full"
              >
                <motion.div style={{ x: parallaxX, y: parallaxY, rotateX, rotateY, perspective: 1000 }} className="h-full">
                  <Link href="/creative" className="block h-full cursor-pointer">
                    <motion.div
                      whileHover={{ y: -8, scale: 1.02 }}
                      className="paper-card isolate relative p-7 md:p-9 min-h-[220px] h-full flex flex-col justify-between overflow-hidden"
                      animate={hoverSide === "creative" ? {
                      borderColor: "#f0c6cf",
                      boxShadow: "0 0 34px rgba(240, 198, 207, 0.16)"
                    } : {
                      borderColor: "#2a2a2a",
                      boxShadow: "none"
                    }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="tape-top" />
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <motion.div
                          className="flex h-9 w-9 items-center justify-center border"
                          animate={hoverSide === "creative" ? {
                            borderColor: "#f0c6cf",
                            color: "#f0c6cf",
                          } : {
                            borderColor: "#444",
                            color: "#e8e8e8",
                          }}
                          transition={{ duration: 0.5 }}
                        >
                          <Pen className="h-4 w-4" />
                        </motion.div>
                        <motion.span
                          className="font-mono text-xs"
                          animate={hoverSide === "creative" ? { color: "#f0c6cf" } : { color: "#888" }}
                          transition={{ duration: 0.5 }}
                        >
                          ~
                        </motion.span>
                      </div>
                      <motion.h2
                        className="text-xl md:text-2xl font-bold tracking-tight mb-2"
                        animate={hoverSide === "creative" ? { color: "#f0c6cf" } : { color: "#e8e8e8" }}
                        transition={{ duration: 0.5 }}
                      >
                        the unhinged side
                      </motion.h2>
                      <p className="text-sm text-[#aaa] leading-relaxed max-w-xs">
                        photos, sketches, late-night scribbles. the fun stuff.
                      </p>
                      <p className="mt-3 text-xs font-mono text-[#666] group-hover:text-[#e8e8e8] transition-colors italic">
                        aka the fun one
                      </p>
                    </div>
                    <div className="mt-6 flex items-center gap-2 text-sm font-mono text-[#666] group-hover:text-[#e8e8e8] transition-colors">
                      <span>go there</span>
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </div>
                  </motion.div>
                </Link>
                </motion.div>
              </motion.div>
            </div>
            
            {/* Hover indicator */}
            <motion.p
              className="mt-5 font-mono text-xs text-[#666] h-5"
              animate={{ opacity: hoverSide ? 1 : 0 }}
            >
              {hoverSide === "nerdy"
                ? "yes there's a resume in there. yes you can hire me."
                : hoverSide === "creative"
                  ? "warning: the unhinged side may contain bad sketches and worse opinions"
                  : ""}
            </motion.p>
          </motion.div>

          <motion.div
            className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-20"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.6, ease: "easeOut" }}
          >
            <p className="font-mono text-xs text-[#666]">scroll for more</p>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: [0.45, 0, 0.55, 1] }}
            >
              <ArrowDown className="h-4 w-4 text-[#888]" />
            </motion.div>
          </motion.div>
        </motion.div>
      </section>



      {/* ===== MUSIC ZONE ===== */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 py-24">
        {/* ---- NOW PLAYING ---- */}
        {nowPlaying?.isPlaying && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5 }}
            className="mb-14"
          >
            <SpotifyNowPlayingContent nowPlaying={nowPlaying} />
          </motion.div>
        )}

        {/* ---- TOP ARTISTS ---- */}
        {topArtists.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5 }}
            className="mb-14"
          >
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-[#ccc]" />
              <p className="font-mono text-xs tracking-widest uppercase text-[#ccc]">top artists</p>
            </div>
            <p className="text-sm text-[#888] mb-8">the people responsible for my personality</p>

            <div className="flex flex-wrap gap-4">
              {topArtistCards.map((artist, i) => (
                <motion.a
                  key={artist.url ?? `${artist.name}-${i}`}
                  href={artist.url ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(event) => {
                    if (!artist.url) event.preventDefault()
                  }}
                  className={`group paper-card p-5 flex flex-col items-center text-center hover-bounce w-[calc(50%_-_0.5rem)] sm:w-auto ${
                    artist.url ? "" : "cursor-default"
                  }`}
                  style={!isCompactSpotify ? { width: `${artist.cardWidth}px` } : undefined}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06, duration: 0.35 }}
                >
                  <SpotifyArtwork
                    src={artist.imageUrl}
                    alt={artist.name}
                    loading="lazy"
                    className="w-20 h-20 border-2 border-[#333] bg-[#1a1a1a] mb-3 flex items-center justify-center overflow-hidden group-hover:border-[#e8e8e8] transition-colors"
                    imgClassName="w-full h-full object-cover"
                    fallback={<Users className="h-8 w-8 text-[#444]" />}
                  />
                  <p className="text-sm font-bold text-[#e8e8e8] group-hover:underline truncate w-full">{artist.name}</p>
                  {artist.genreLabel && (
                    <p className="text-xs text-[#888] truncate w-full mt-1">{artist.genreLabel}</p>
                  )}
                </motion.a>
              ))}
            </div>
          </motion.div>
        )}

        {/* ---- TOP TRACKS ---- */}
        {topTracks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5 }}
            className="mb-14"
          >
            <div className="flex items-center gap-2 mb-2">
              <Headphones className="h-4 w-4 text-[#ccc]" />
              <p className="font-mono text-xs tracking-widest uppercase text-[#ccc]">all-time faves</p>
            </div>
            <p className="text-sm text-[#888] mb-6">the songs i&apos;ve played to death</p>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              {topTrackRows.map((track, i) => (
                <motion.a
                  key={track.songUrl ?? `${track.title}-${track.artist}-${i}`}
                  href={track.songUrl ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(event) => {
                    if (!track.songUrl) event.preventDefault()
                  }}
                  className="paper-card w-full p-4 flex items-center gap-4 hover-bounce group sm:w-auto"
                  style={!isCompactSpotify ? { width: `${track.cardWidth}px` } : undefined}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04, duration: 0.3 }}
                >
                  <span className="font-mono text-xs text-[#666] w-5 shrink-0">{track.rankLabel}</span>
                  <SpotifyArtwork
                    src={track.albumImageUrl}
                    alt={track.album}
                    loading="lazy"
                    className="w-10 h-10 shrink-0 border border-[#333] bg-[#1a1a1a] flex items-center justify-center overflow-hidden"
                    imgClassName="w-full h-full object-cover"
                    fallback={<span className="text-[#444] text-xs">♪</span>}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[#e8e8e8] truncate group-hover:underline">{track.title}</p>
                    <p className="text-xs text-[#aaa] truncate">{track.artist}</p>
                  </div>
                </motion.a>
              ))}
            </div>
          </motion.div>
        )}

        {/* ---- RECENTLY PLAYED ---- */}
        {recentTracks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-[#ccc]" />
              <p className="font-mono text-xs tracking-widest uppercase text-[#ccc]">recently played</p>
            </div>
            <p className="text-sm text-[#888] mb-6">what was in my ears a minute ago</p>

            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              {recentTrackRows.map((track, i) => (
                <motion.a
                  key={track.songUrl ?? `${track.title}-${track.playedAt}-${i}`}
                  href={track.songUrl ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(event) => {
                    if (!track.songUrl) event.preventDefault()
                  }}
                  className="paper-card w-full p-3 flex items-center gap-4 hover-bounce group sm:w-auto"
                  style={!isCompactSpotify ? { width: `${track.cardWidth}px` } : undefined}
                  initial={{ opacity: 0, x: -8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.03, duration: 0.25 }}
                >
                  <SpotifyArtwork
                    src={track.albumImageUrl}
                    alt={track.album}
                    loading="lazy"
                    className="w-8 h-8 shrink-0 border border-[#333] bg-[#1a1a1a] flex items-center justify-center overflow-hidden"
                    imgClassName="w-full h-full object-cover"
                    fallback={<span className="text-[#444] text-xs">♪</span>}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-[#e8e8e8] truncate group-hover:underline">{track.title}</p>
                    <p className="text-xs text-[#aaa] truncate">{track.artist}</p>
                  </div>
                  <p className="font-mono text-xs text-[#666] shrink-0">{track.playedLabel}</p>
                </motion.a>
              ))}
            </div>
          </motion.div>
        )}
      </section>

      {/* ---- TERMINAL ---- */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          <MusicDCTF />
        </motion.div>
      </section>

      {/* ---- CONVERGENCE: socials ---- */}
      <section className="relative isolate z-10 mx-auto max-w-5xl px-6 pb-24 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5 }}
        >
          <p className="font-mono text-xs tracking-widest uppercase text-[#ccc] mb-2">
            find me elsewhere
          </p>
          <p className="text-sm text-[#888] mb-6">
            (i sometimes reply)
          </p>

          <div className="flex flex-wrap gap-3">
            {socials.map((s, i) => (
              <motion.a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="paper-card flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#bbb] hover:text-[#e8e8e8] transition-colors hover-bounce"
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
      <footer className="relative z-10 overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#2a2a2a] to-transparent opacity-50" />
        <div className="mx-auto max-w-5xl px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-mono text-xs text-[#888]">som chandra, 2025</p>
          <p className="font-mono text-xs text-[#666]">made with monster and bunch of tokens</p>
        </div>
      </footer>
    </main>
  )
}
