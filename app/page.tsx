"use client"

import { useState, useEffect, useRef, type MouseEvent } from "react"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import { MusicDCTF } from "@/components/musicd-ctf"
import { TextMorph } from "@/components/text-morph"
import { PretextHighlight } from "@/components/pretext-highlight"
import { SpotifyNowPlayingContent } from "@/components/now-playing"
import { SpotifyArtwork } from "@/components/spotify-artwork"
import { ParticleField } from "@/components/cosmic/particle-field"
import { ParallaxLayer } from "@/components/cosmic/parallax-layer"
import { SakuraAsset } from "@/components/cosmic/sakura-asset"
import { fonts, measureTextWidth, usePretextReady } from "@/lib/pretext"
import { fetcher, type Artist, type NowPlayingData, type RecentTrack, type Track } from "@/lib/creative-data"
import {
  Terminal, Pen, Github, Linkedin, Mail, ExternalLink,
  ArrowRight, ArrowDown, Music, Headphones, Users, Clock,
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
  "refactoring code I wrote 2 weeks ago like it's someone else's",
  "explaining to friends what I do for a living",
  "git blame: it was me all along",
  "spent an hour on my hyprland",
  "dark mode everything. my eyes thank me.",
  "i speak broken grammar",
  "my rubber duck deserves a raise",
  "drawing things no one asked for since 2002",
  "i photograph things instead of experiencing them",
  "arguing with a yaml file"
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
  const heroInnerRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()

  const { data: nowPlaying } = useSWR<NowPlayingData>("/api/spotify/now-playing", fetcher, { refreshInterval: 30000 })
  const { data: topTracksData } = useSWR<{ tracks: Track[] }>("/api/spotify/top-tracks", fetcher)
  const { data: topArtistsData } = useSWR<{ artists: Artist[] }>("/api/spotify/top-artists", fetcher)
  const { data: recentData } = useSWR<{ tracks: RecentTrack[] }>("/api/spotify/recently-played", fetcher)
  const pretextReady = usePretextReady()
  const [isCompactSpotify, setIsCompactSpotify] = useState(false)

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

  // Hero scroll-exit. One GSAP scrub = the sole scroll-position reader, so it
  // never fights Lenis (which now owns the scroll value). Replaces the old
  // Framer useScroll/useTransform binding.
  useEffect(() => {
    if (reducedMotion) return
    const section = heroRef.current
    const inner = heroInnerRef.current
    if (!section || !inner) return
    let revert: (() => void) | undefined
    void (async () => {
      const [gsapMod, stMod] = await Promise.all([import("gsap"), import("gsap/ScrollTrigger")])
      const gsap = gsapMod.gsap ?? gsapMod.default
      const ScrollTrigger = stMod.ScrollTrigger ?? stMod.default
      gsap.registerPlugin(ScrollTrigger)
      const ctx = gsap.context(() => {
        gsap.to(inner, {
          opacity: 0,
          y: -70,
          ease: "none",
          scrollTrigger: { trigger: section, start: "top top", end: "bottom top", scrub: 0.8 },
        })
      })
      revert = () => ctx.revert()
    })()
    return () => revert?.()
  }, [reducedMotion])

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
    <main className="relative min-h-screen">

      {/* Deep-space ground + ambient particles (homepage only). Both fixed,
          behind content. Gradient z-0, petals/stars/dust z-5, content z-10. */}
      <div className="cosmic-bg pointer-events-none fixed inset-0 z-0" aria-hidden />
      <ParticleField />

      {/* ---- HERO: fills viewport ---- */}
      <section ref={heroRef} className="relative min-h-screen overflow-hidden">
        {/* cosmic backdrop — galaxy (far, faint) + sakura branch (near), parallax + cursor depth */}
        <div className="cosmic-layer inset-0 z-[1]" aria-hidden>
          <ParallaxLayer
            speed={36}
            mouse={28}
            className="absolute left-1/2 top-[38%] w-[min(125vw,1500px)] -translate-x-1/2 -translate-y-1/2"
          >
            <SakuraAsset
              name="galaxy"
              priority
              sizes="125vw"
              className="h-auto w-full opacity-[0.45] animate-galaxy-spin drop-glow-violet mask-fade-radial"
            />
          </ParallaxLayer>
        </div>
        <div className="cosmic-layer inset-0 z-[2]" aria-hidden>
          <ParallaxLayer
            speed={88}
            mouse={34}
            className="absolute -right-12 -top-10 w-[min(62vw,440px)] origin-top-right rotate-[8deg]"
          >
            <SakuraAsset
              name="branch-a"
              sizes="(max-width: 768px) 62vw, 440px"
              className="h-auto w-full opacity-80 drop-glow-sakura"
            />
          </ParallaxLayer>
        </div>

        <motion.div
          ref={heroInnerRef}
          className="relative z-10 mx-auto max-w-5xl px-6 flex flex-col justify-center min-h-screen"
        >
          <motion.div
            className="mb-10 h-px bg-[#e8e8e8]"
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

            <h1 className="text-[clamp(2.75rem,9vw,5.5rem)] font-bold tracking-[-0.03em] text-[#e8e8e8] leading-[1.03]">
              <button
                type="button"
                className="block cursor-pointer border-0 bg-transparent p-0 text-left"
                onClick={cycleName}
                aria-label="Toggle between som and 0xs0m"
              >
                {"i'm "}
                <TextMorph
                  text={nameConfig[nameMode].text}
                  className={nameMode === "nerdy" ? "font-mono" : ""}
                  style={{
                    color: nameConfig[nameMode].color,
                    textShadow: nameConfig[nameMode].shadow,
                  }}
                />
                .
              </button>
            </h1>

            {/* Cycling hero tagline with pretext-measured highlight */}
            <div className="mt-3 h-10 md:h-12">
              <PretextHighlight
                lines={heroLines}
                currentIndex={heroIdx}
                fontSize={24}
                bgColor="#e8e8e8"
                textColor="#0a0a0a"
                paddingX={8}
                paddingY={2}
              />
            </div>

            {/* Auto-cycling fun fact */}
            <div className="mt-6 h-6 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.p
                  key={factIdx}
                  className="font-mono text-sm text-[#666]"
                  initial={{ opacity: 0, y: 14, x: -4 }}
                  animate={{ opacity: 1, y: 0, x: 0 }}
                  exit={{ opacity: 0, y: -10, x: 4 }}
                  transition={{ duration: 0.28, ease: "easeOut" }}
                >
                  {"// "}
                  {funFacts[factIdx]}
                </motion.p>
              </AnimatePresence>
            </div>
          </motion.div>

          <motion.div
            className="mt-10 h-px bg-[#333]"
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
            <p className="font-mono text-xs tracking-widest uppercase text-[#999] mb-6">
              pick a side
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
              {/* NERDY */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1 }}
                onHoverStart={() => { setHoverSide("nerdy"); if (!isHoverLocked) setNameMode("nerdy") }}
                onHoverEnd={() => { setHoverSide(null); if (!isHoverLocked) setNameMode("default") }}
                className="group"
              >
                <Link href="/nerdy" onClick={handleNerdyOpen}>
                  <motion.div
                    whileHover={{ y: -6 }}
                    className="cosmic-card crt-scanlines isolate relative p-7 md:p-9 min-h-[220px] flex flex-col justify-between overflow-hidden"
                    animate={nameMode === "nerdy" ? {
                      borderColor: "#7fb07f",
                      boxShadow: "0 0 34px rgba(127, 176, 127, 0.36)"
                    } : {
                      borderColor: "#2a2a2a",
                      boxShadow: "none"
                    }}
                    transition={{ duration: 0.5 }}
                    style={{ border: "1px solid" }}
                  >
                    <div className="tape-top" />
                    {/* CRT terminal backdrop — faint code fragments, intensifies on hover */}
                    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
                      <pre className="absolute right-1 top-1 m-0 select-none whitespace-pre font-mono text-[9px] leading-[1.6] text-accent-nerdy/15 transition-colors duration-500 group-hover:text-accent-nerdy/30">{`$ whoami
0xs0m
$ nmap -sV 10.0.0.1
[+] 22/tcp  open  ssh
[+] 443/tcp open  https
$ ./exploit --pwn
[*] shell acquired
while (true) { hack(); }`}</pre>
                      <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ background: "radial-gradient(130% 100% at 50% 125%, rgba(127,176,127,0.18), transparent 70%)" }} />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <motion.div
                          className="flex h-9 w-9 items-center justify-center border"
                          animate={nameMode === "nerdy" ? {
                            borderColor: "#7fb07f",
                            color: "#7fb07f"
                          } : {
                            borderColor: "#333",
                            color: "#e8e8e8"
                          }}
                          transition={{ duration: 0.5 }}
                          style={{ border: "1px solid" }}
                        >
                          <Terminal className="h-4 w-4" />
                        </motion.div>
                        <motion.span
                          className="font-mono text-xs"
                          animate={nameMode === "nerdy" ? { color: "#7fb07f" } : { color: "#666" }}
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
                        {"resume, hacking stuff, certs, all that serious jazz."}
                      </p>
                      <p className="mt-3 text-xs font-mono text-[#666] group-hover:text-[#e8e8e8] transition-colors italic">
                        {"psst -- wanna hire me?"}
                      </p>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-sm font-mono text-[#666] group-hover:text-[#e8e8e8] transition-colors">
                      <span>go there</span>
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </div>
                    <motion.div
                      className="absolute bottom-0 left-0 h-[2px] bg-[#e8e8e8] group-hover:w-full transition-all duration-500"
                      animate={nameMode === "nerdy" ? {
                        width: "100%",
                        backgroundColor: "#7fb07f"
                      } : {
                        width: "0%",
                        backgroundColor: "#e8e8e8"
                      }}
                      transition={{ duration: 0.5 }}
                    />
                  </motion.div>
                </Link>
              </motion.div>

              {/* CREATIVE */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.15 }}
                onHoverStart={() => { setHoverSide("creative") }}
                onHoverEnd={() => { setHoverSide(null) }}
                className="group"
              >
                <Link href="/creative">
                  <motion.div
                    whileHover={{ y: -6 }}
                    className="cosmic-card isolate relative p-7 md:p-9 min-h-[220px] flex flex-col justify-between overflow-hidden"
                    animate={hoverSide === "creative" ? {
                      borderColor: "#f0c6cf",
                      boxShadow: "0 0 34px rgba(240, 198, 207, 0.36)"
                    } : {
                      borderColor: "#2a2a2a",
                      boxShadow: "none"
                    }}
                    transition={{ duration: 0.5 }}
                    style={{ border: "1px solid" }}
                  >
                    <div className="tape-top" />
                    {/* cosmic darkroom backdrop — peony blooms from the corner on hover */}
                    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
                      <SakuraAsset
                        name="peony"
                        sizes="220px"
                        className="absolute -bottom-12 -right-10 h-auto w-[200px] opacity-25 drop-glow-sakura transition-all duration-700 ease-out group-hover:opacity-55 group-hover:-translate-y-2 group-hover:-rotate-[4deg]"
                      />
                      <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ background: "radial-gradient(130% 100% at 78% 122%, rgba(240,198,207,0.18), transparent 70%)" }} />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <motion.div
                          className="flex h-9 w-9 items-center justify-center border"
                          animate={hoverSide === "creative" ? {
                            borderColor: "#f0c6cf",
                            color: "#f0c6cf"
                          } : {
                            borderColor: "#333",
                            color: "#e8e8e8"
                          }}
                          transition={{ duration: 0.5 }}
                          style={{ border: "1px solid" }}
                        >
                          <Pen className="h-4 w-4" />
                        </motion.div>
                        <motion.span
                          className="font-mono text-xs"
                          animate={hoverSide === "creative" ? { color: "#f0c6cf" } : { color: "#666" }}
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
                        {"photos, sketches, late-night scribbles. the fun stuff."}
                      </p>
                      <p className="mt-3 text-xs font-mono text-[#666] group-hover:text-[#e8e8e8] transition-colors italic">
                        {"aka the fun one"}
                      </p>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-sm font-mono text-[#666] group-hover:text-[#e8e8e8] transition-colors">
                      <span>go there</span>
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </div>
                    <motion.div
                      className="absolute bottom-0 left-0 h-[2px] bg-[#e8e8e8] group-hover:w-full transition-all duration-500"
                      animate={hoverSide === "creative" ? {
                        width: "100%",
                        backgroundColor: "#f0c6cf"
                      } : {
                        width: "0%",
                        backgroundColor: "#e8e8e8"
                      }}
                      transition={{ duration: 0.5 }}
                    />
                  </motion.div>
                </Link>
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

          {/* Scroll hint */}
          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.6, ease: "easeOut" }}
          >
            <p className="font-mono text-xs text-[#666]">scroll for vibes</p>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: [0.45, 0, 0.55, 1] }}
            >
              <ArrowDown className="h-4 w-4 text-[#666]" />
            </motion.div>
          </motion.div>
        </motion.div>
      </section>


      {/* ==== BELOW THE FOLD ==== */}

      {/* hero → music transition: a river of petals descends, carrying you down
          into the soundtrack. The river asset used as a structural connective spine. */}
      <motion.div
        className="pointer-events-none relative z-[3] flex justify-center overflow-hidden"
        style={{ height: "clamp(8rem, 20vh, 14rem)" }}
        aria-hidden
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-10%" }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="absolute left-1/2 top-[-45%] h-[210%] w-[230px] -translate-x-1/2">
          <SakuraAsset name="river" sizes="230px" className="h-full w-full object-cover opacity-75 blend-screen mask-fade-y" />
        </div>
      </motion.div>

      {/* ===== MUSIC ZONE: one cohesive nebula atmosphere behind the soundtrack ===== */}
      <div className="relative">
        <div className="pointer-events-none absolute inset-0 z-[1] overflow-hidden" aria-hidden>
          <SakuraAsset
            name="nebula"
            sizes="120vw"
            className="absolute inset-0 h-full w-full object-cover opacity-40 blend-screen animate-cosmic-drift [mask-image:linear-gradient(to_bottom,transparent,#000_9%,#000_95%,transparent)] [-webkit-mask-image:linear-gradient(to_bottom,transparent,#000_9%,#000_95%,transparent)] [filter:sepia(0.5)_hue-rotate(252deg)_saturate(1.5)_brightness(1.05)]"
          />
        </div>

      {/* ---- NOW PLAYING ---- */}
      {nowPlaying?.isPlaying && (
        <section className="relative z-10 mx-auto max-w-5xl px-6 pb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5 }}
          >
            <div className="border-t border-[#333] pt-10">
              <SpotifyNowPlayingContent nowPlaying={nowPlaying} />
            </div>
          </motion.div>
        </section>
      )}

      {/* ---- TOP ARTISTS ---- */}
      {topArtists.length > 0 && (
        <section className="relative z-10 mx-auto max-w-5xl px-6 pb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5 }}
          >
            <div className="border-t border-[#333] pt-10">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-[#ccc]" />
                <p className="font-mono text-xs tracking-widest uppercase text-[#ccc]">top artists</p>
              </div>
              <p className="text-sm text-[#888] mb-8">{"the people responsible for my personality"}</p>

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
            </div>
          </motion.div>
        </section>
      )}

      {/* ---- TOP TRACKS ---- */}
      {topTracks.length > 0 && (
        <section className="relative z-10 mx-auto max-w-5xl px-6 pb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5 }}
          >
            <div className="border-t border-[#333] pt-10">
              <div className="flex items-center gap-2 mb-2">
                <Headphones className="h-4 w-4 text-[#ccc]" />
                <p className="font-mono text-xs tracking-widest uppercase text-[#ccc]">all-time faves</p>
              </div>
              <p className="text-sm text-[#888] mb-6">{"the songs i've played to death"}</p>

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
            </div>
          </motion.div>
        </section>
      )}

      {/* ---- RECENTLY PLAYED ---- */}
      {recentTracks.length > 0 && (
        <section className="relative z-10 mx-auto max-w-5xl px-6 pb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5 }}
          >
            <div className="border-t border-[#333] pt-10">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-[#ccc]" />
                <p className="font-mono text-xs tracking-widest uppercase text-[#ccc]">recently played</p>
              </div>
              <p className="text-sm text-[#888] mb-6">{"what was in my ears a minute ago"}</p>

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
            </div>
          </motion.div>
        </section>
      )}

      </div>
      {/* ===== /MUSIC ZONE ===== */}

      {/* music → experiments: a sakura branch arcs across — a structural threshold */}
      <motion.div
        className="pointer-events-none relative z-[3] mx-auto flex max-w-6xl items-center justify-center overflow-hidden"
        style={{ height: "clamp(7rem, 16vh, 11rem)" }}
        aria-hidden
        initial={{ opacity: 0, y: 26 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-15%" }}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
      >
        <SakuraAsset name="branch-b" sizes="92vw" className="h-auto w-[min(92vw,1100px)] -rotate-2 opacity-60 mask-fade-x drop-glow-sakura" />
      </motion.div>

      {/* ---- PLAYLIST / the engineer's playground — the galaxy emerges behind the terminal ---- */}
      <section className="relative isolate z-10 mx-auto max-w-5xl px-6 pb-10">
        {/* the galaxy emerges; the terminal floats in space */}
        <div className="cosmic-layer inset-0 -z-10 flex items-center justify-center" aria-hidden>
          <ParallaxLayer speed={70} mouse={10} className="w-[min(135vw,1150px)]">
            <SakuraAsset
              name="galaxy"
              sizes="(max-width: 768px) 135vw, 1150px"
              className="h-auto w-full opacity-50 animate-galaxy-spin drop-glow-violet mask-fade-radial"
            />
          </ParallaxLayer>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          <div className="border-t border-[#333] pt-10">
            <MusicDCTF />
          </div>
        </motion.div>
      </section>

      {/* ---- CONVERGENCE: socials + the final bloom ---- */}
      <section className="relative isolate z-10 mx-auto max-w-5xl px-6 pb-14 pt-12 md:pt-24">
        {/* the universe converges — a single blossom blooms */}
        <motion.div
          className="cosmic-layer inset-x-0 -bottom-28 -z-10 flex justify-center"
          aria-hidden
          initial={{ opacity: 0, scale: 0.6, rotate: -8 }}
          whileInView={{ opacity: 0.55, scale: 1, rotate: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 1.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <SakuraAsset
            name="peony"
            sizes="(max-width: 768px) 92vw, 600px"
            className="h-auto w-[min(92vw,600px)] drop-glow-sakura"
          />
        </motion.div>
        <motion.div
          className="border-t border-[#333] pt-10"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5 }}
        >
          <p className="font-mono text-xs tracking-widest uppercase text-[#ccc] mb-2">
            find me elsewhere
          </p>
          <p className="text-sm text-[#888] mb-6">
            {"(i sometimes reply)"}
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
      <footer className="relative z-10 border-t border-[#333]">
        <div className="mx-auto max-w-5xl px-6 py-7 flex items-center justify-between">
          <p className="font-mono text-xs text-[#888]">som chandra, 2025</p>
          <p className="font-mono text-xs text-[#666]">made with monster and bunch of tokens</p>
        </div>
      </footer>
    </main>
  )
}
