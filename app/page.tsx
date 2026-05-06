"use client"

import { useState, useEffect, useRef, type MouseEvent } from "react"
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import { MusicDCTF } from "@/components/musicd-ctf"
import { LegalLinks } from "@/components/legal-links"
import { TextMorph } from "@/components/text-morph"
import { PretextHighlight } from "@/components/pretext-highlight"
import { SpotifyNowPlayingContent, SpotifyNowPlayingSkeleton } from "@/components/now-playing"
import { SpotifyArtwork } from "@/components/spotify-artwork"
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
  { label: "GitHub", href: "https://github.com/somchandra17", icon: Github, note: "tools, experiments, and the occasional cleanup sprint" },
  { label: "LinkedIn", href: "https://linkedin.com/in/somchandra17", icon: Linkedin, note: "career-friendly version of the same person" },
  { label: "Email", href: "mailto:somchandra.infosec@gmail.com", icon: Mail, note: "best route for work, collabs, and serious replies" },
  { label: "somm.tf", href: "https://www.somm.tf", icon: ExternalLink, note: "where the security writing and labs spill over" },
]

const quickNotes = [
  { label: "based in", value: "bengaluru / kolkata" },
  { label: "day job", value: "application security" },
  { label: "after hours", value: "photos, sketches, bad ideas" },
]

const SPOTIFY_SECTION_LIMIT = 6

const terminalNotes = [
  "click the starter actions if the prompt feels unfamiliar",
  "type `guide` for the soft version of the walkthrough",
  "type `hint` if you get the idea but not the next step",
]

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

function SpotifyRowsSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="grid gap-3">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="data-skeleton grid gap-4 p-4 md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center">
          <div className="h-8 w-8 bg-[#12151b]" />
          <div className="space-y-2">
            <div className="h-4 w-36 bg-[#12151b]" />
            <div className="h-3 w-24 bg-[#12151b]" />
          </div>
          <div className="hidden h-3 w-16 bg-[#12151b] md:block" />
        </div>
      ))}
    </div>
  )
}

function SpotifyArtistsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:flex sm:flex-wrap">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="data-skeleton flex flex-col items-center p-5 text-center sm:w-[160px]">
          <div className="mb-3 h-20 w-20 bg-[#12151b]" />
          <div className="h-4 w-24 bg-[#12151b]" />
          <div className="mt-2 h-3 w-20 bg-[#12151b]" />
        </div>
      ))}
    </div>
  )
}

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
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] })
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])
  const heroY = useTransform(scrollYProgress, [0, 1], [0, -60])

  const { data: nowPlaying, error: nowPlayingError, isLoading: nowPlayingLoading } = useSWR<NowPlayingData>("/api/spotify/now-playing", fetcher, { refreshInterval: 30000 })
  const { data: topTracksData, error: topTracksError, isLoading: topTracksLoading } = useSWR<{ tracks: Track[] }>("/api/spotify/top-tracks", fetcher)
  const { data: topArtistsData, error: topArtistsError, isLoading: topArtistsLoading } = useSWR<{ artists: Artist[] }>("/api/spotify/top-artists", fetcher)
  const { data: recentData, error: recentError, isLoading: recentLoading } = useSWR<{ tracks: RecentTrack[] }>("/api/spotify/recently-played", fetcher)
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

  const topTracks = topTracksData?.tracks || []
  const topArtists = topArtistsData?.artists || []
  const recentTracks = recentData?.tracks || []
  const spotifyErrors = [nowPlayingError, topTracksError, topArtistsError, recentError].filter(Boolean)
  const isSpotifyLoading = nowPlayingLoading || topTracksLoading || topArtistsLoading || recentLoading
  const hasSpotifyShowcase = Boolean(nowPlaying?.title || topArtists.length > 0 || topTracks.length > 0 || recentTracks.length > 0)
  const shouldRenderSpotifyShowcase = isSpotifyLoading || spotifyErrors.length > 0 || hasSpotifyShowcase
  const measure = (text: string, font: string, fontSize: number) => (
    pretextReady ? measureTextWidth(text, font) : fallbackWidth(text, fontSize)
  )
  const routePreview = hoverSide === "nerdy" || nameMode === "nerdy"
    ? {
        tone: "#7fb07f",
        rail: "resume / tools / labs",
        heading: "the technical lane is live.",
        body: "work history, offensive security projects, and the terminal corner for people who like poking around.",
      }
    : hoverSide === "creative"
      ? {
          tone: "#f0c6cf",
          rail: "photos / sketches / notes",
          heading: "the messy lane is live.",
          body: "camera roll fragments, rough sketches, and the low-stakes side of the same brain.",
        }
      : {
          tone: "#d7dbe2",
          rail: "resume / photos / terminal / notes",
          heading: "two tabs, same person.",
          body: "hover either side to preview the tone before you commit to it.",
        }

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
    <main id="main-content" className="relative min-h-screen">

      {/* ---- HERO: fills viewport ---- */}
      <section ref={heroRef} className="relative">
        <motion.div
          className="relative z-10 mx-auto flex min-h-[100dvh] max-w-6xl flex-col justify-center px-6"
          style={{ opacity: heroOpacity, y: heroY }}
        >
          <motion.div
            className="mb-10 h-px bg-[#e8e8e8]"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "100%", opacity: 1 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          />

          <div className="grid gap-12 lg:grid-cols-[minmax(0,1.08fr)_minmax(280px,0.72fr)] lg:items-end">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <p className="mb-6 font-mono text-xs tracking-widest uppercase text-[#999]">
                  oh hey, you found this page
                </p>

                <h1 className="text-3xl font-bold leading-[1.1] tracking-tight text-[#e8e8e8] md:text-5xl lg:text-6xl">
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

              <motion.div
                className="mt-14"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
              >
                <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <p className="eyebrow mb-3">pick a side</p>
                    <p className="max-w-xl text-sm leading-relaxed text-[#8f95a0]">
                      the site splits in two on purpose. one half is resumes, tools, and security work. the other is the stuff
                      that leaks out when the terminal closes.
                    </p>
                  </div>
                  <div className="note-frame max-w-sm px-4 py-3">
                    <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-[#727985]">house rule</p>
                    <p className="mt-2 text-sm leading-relaxed text-[#cad0d8]">
                      hover a lane before you open it. click the name if you want the terminal alias first.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 items-start gap-5 md:grid-cols-12 md:gap-6">
                  <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 1 }}
                    onHoverStart={() => { setHoverSide("nerdy"); if (!isHoverLocked) setNameMode("nerdy") }}
                    onHoverEnd={() => { setHoverSide(null); if (!isHoverLocked) setNameMode("default") }}
                    className="group md:col-span-7"
                  >
                    <Link href="/nerdy" onClick={handleNerdyOpen}>
                      <motion.div
                        className="paper-card relative flex min-h-[266px] flex-col justify-between overflow-hidden p-7 md:p-9 hover-wiggle"
                        animate={nameMode === "nerdy" ? {
                          borderColor: "#7fb07f",
                          boxShadow: "0 18px 44px rgba(9, 20, 12, 0.38)"
                        } : {
                          borderColor: "#2a2a2a",
                          boxShadow: "none"
                        }}
                        transition={{ duration: 0.5 }}
                        style={{ border: "1px solid" }}
                      >
                        <div className="tape-top" />
                        <div>
                          <div className="mb-3 flex items-center gap-3">
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
                            className="mb-2 text-xl font-bold tracking-tight md:text-2xl"
                            animate={nameMode === "nerdy" ? { color: "#7fb07f" } : { color: "#e8e8e8" }}
                            transition={{ duration: 0.5 }}
                          >
                            the nerdy side
                          </motion.h2>
                          <p className="max-w-sm text-sm leading-relaxed text-[#aaa]">
                            {"resume, hacking stuff, certs, all that serious jazz."}
                          </p>
                          <div className="mt-5 flex flex-wrap gap-2">
                            {["resume", "projects", "terminal corner"].map((item) => (
                              <span key={item} className="data-chip px-2.5 py-1 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-[#8fa58f]">
                                {item}
                              </span>
                            ))}
                          </div>
                          <p className="mt-4 text-xs font-mono italic text-[#666] transition-colors group-hover:text-[#e8e8e8]">
                            {"psst -- yes, this is the one to open if hiring is involved."}
                          </p>
                        </div>
                        <div className="mt-4 flex items-center gap-2 text-sm font-mono text-[#666] transition-colors group-hover:text-[#e8e8e8]">
                          <span>go there</span>
                          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                        </div>
                        <motion.div
                          className="absolute bottom-0 left-0 h-[2px] bg-[#e8e8e8] transition-all duration-500 group-hover:w-full"
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

                  <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 1.15 }}
                    onHoverStart={() => { setHoverSide("creative") }}
                    onHoverEnd={() => { setHoverSide(null) }}
                    className="group md:col-span-5 md:pt-12"
                  >
                    <Link href="/creative">
                      <motion.div
                        className="paper-card relative flex min-h-[240px] flex-col justify-between overflow-hidden p-7 md:p-9 hover-wiggle"
                        animate={hoverSide === "creative" ? {
                          borderColor: "#f0c6cf",
                          boxShadow: "0 18px 44px rgba(31, 15, 22, 0.36)"
                        } : {
                          borderColor: "#2a2a2a",
                          boxShadow: "none"
                        }}
                        transition={{ duration: 0.5 }}
                        style={{ border: "1px solid" }}
                      >
                        <div className="tape-top" />
                        <div>
                          <div className="mb-3 flex items-center gap-3">
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
                            className="mb-2 text-xl font-bold tracking-tight md:text-2xl"
                            animate={hoverSide === "creative" ? { color: "#f0c6cf" } : { color: "#e8e8e8" }}
                            transition={{ duration: 0.5 }}
                          >
                            the unhinged side
                          </motion.h2>
                          <p className="max-w-sm text-sm leading-relaxed text-[#aaa]">
                            {"photos, sketches, late-night scribbles. the fun stuff."}
                          </p>
                          <div className="mt-5 flex flex-wrap gap-2">
                            {["photos", "doodles", "questionable notes"].map((item) => (
                              <span key={item} className="data-chip px-2.5 py-1 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-[#caa8b0]">
                                {item}
                              </span>
                            ))}
                          </div>
                          <p className="mt-4 text-xs font-mono italic text-[#666] transition-colors group-hover:text-[#e8e8e8]">
                            {"aka the side that proves i do leave the terminal sometimes."}
                          </p>
                        </div>
                        <div className="mt-4 flex items-center gap-2 text-sm font-mono text-[#666] transition-colors group-hover:text-[#e8e8e8]">
                          <span>go there</span>
                          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                        </div>
                        <motion.div
                          className="absolute bottom-0 left-0 h-[2px] bg-[#e8e8e8] transition-all duration-500 group-hover:w-full"
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

                <motion.p
                  className="mt-5 h-5 font-mono text-xs text-[#666]"
                  animate={{ opacity: hoverSide ? 1 : 0 }}
                >
                  {hoverSide === "nerdy"
                    ? "yes there's a resume in there. yes you can hire me."
                    : hoverSide === "creative"
                      ? "warning: the unhinged side may contain bad sketches and worse opinions"
                      : ""}
                </motion.p>
              </motion.div>
            </div>

            <motion.aside
              className="section-stack lg:pb-10"
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.45, delay: 0.95 }}
            >
              <div className="signal-panel px-5 py-5 md:px-6">
                <p className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-[#7d8592]">dispatch</p>
                <p className="mt-2 font-mono text-[0.68rem] uppercase tracking-[0.16em]" style={{ color: routePreview.tone }}>
                  {routePreview.rail}
                </p>
                <h2 className="mt-4 text-2xl font-semibold tracking-[-0.05em] text-[#eef1f5]">
                  {routePreview.heading}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-[#a2aab6]">
                  {routePreview.body}
                </p>
              </div>

              <div className="note-frame px-5 py-5 md:px-6">
                <p className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-[#7d8592]">field notes</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                  {quickNotes.map((item) => (
                    <div key={item.label} className="border-t border-[#232830] pt-2 first:border-t-0 first:pt-0">
                      <p className="font-mono text-[0.58rem] uppercase tracking-[0.16em] text-[#636a77]">{item.label}</p>
                      <p className="mt-1 text-sm text-[#d4d8df]">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.aside>
          </div>

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

      {shouldRenderSpotifyShowcase && (
        <section className="relative z-10 mx-auto max-w-6xl px-6 pb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5 }}
          >
            <div className="section-rule mb-10" />
            {spotifyErrors.length > 0 && (
              <div className="note-frame mb-6 px-5 py-4 md:px-6">
                <p className="eyebrow mb-2">spotify status</p>
                <p className="text-sm leading-relaxed text-[#d2d7de]">
                  one of the music feeds failed to load. the section will show whatever still came through.
                </p>
              </div>
            )}

            {isSpotifyLoading && !hasSpotifyShowcase ? (
              <div className="grid gap-10 lg:grid-cols-[0.84fr_1.16fr]">
                <div className="space-y-8">
                  <div className="note-frame px-5 py-5 md:px-6">
                    <p className="eyebrow mb-3">soundtrack lately</p>
                    <h2 className="section-title text-2xl font-semibold text-[#eef1f5] md:text-3xl">
                      what has been leaking out of my headphones.
                    </h2>
                    <p className="section-lede mt-3 text-sm">
                      enough signal to understand the mood, not enough to diagnose me properly.
                    </p>
                  </div>
                  <SpotifyNowPlayingSkeleton />
                  <SpotifyRowsSkeleton rows={3} />
                </div>
                <div className="space-y-10">
                  <SpotifyArtistsSkeleton count={4} />
                  <SpotifyRowsSkeleton rows={4} />
                </div>
              </div>
            ) : hasSpotifyShowcase ? (
            <div className="grid gap-10 lg:grid-cols-[0.84fr_1.16fr]">
              <div className="space-y-8">
                <div className="note-frame px-5 py-5 md:px-6">
                  <p className="eyebrow mb-3">soundtrack lately</p>
                  <h2 className="section-title text-2xl font-semibold text-[#eef1f5] md:text-3xl">
                    what has been leaking out of my headphones.
                  </h2>
                  <p className="section-lede mt-3 text-sm">
                    enough signal to understand the mood, not enough to diagnose me properly.
                  </p>
                </div>

                {nowPlaying?.title && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Music className="h-4 w-4 text-[#cfcfcf]" />
                      <p className="eyebrow">live feed</p>
                    </div>
                    <SpotifyNowPlayingContent nowPlaying={nowPlaying} />
                  </div>
                )}

                {recentTracks.length > 0 && (
                  <div>
                    <div className="mb-4 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-[#cfcfcf]" />
                      <p className="eyebrow">recently played</p>
                    </div>
                    <p className="mb-5 max-w-md text-sm leading-relaxed text-[#8d94a0]">what was in my ears a minute ago.</p>
                    <div className="grid gap-3">
                      {recentTrackRows.map((track, i) => (
                        <motion.a
                          key={track.songUrl ?? `${track.title}-${track.playedAt}-${i}`}
                          href={track.songUrl ?? "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(event) => {
                            if (!track.songUrl) event.preventDefault()
                          }}
                          className="paper-card group flex w-full items-center gap-4 p-3.5"
                          initial={{ opacity: 0, x: -8 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.03, duration: 0.25 }}
                        >
                          <SpotifyArtwork
                            src={track.albumImageUrl}
                            alt={track.album}
                            loading="lazy"
                            className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden border border-[#333] bg-[#1a1a1a]"
                            imgClassName="h-full w-full object-cover"
                            fallback={<span className="text-xs text-[#444]">♪</span>}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm text-[#e8e8e8] group-hover:underline">{track.title}</p>
                            <p className="truncate text-xs text-[#8e96a2]">{track.artist}</p>
                          </div>
                          <p className="tabular shrink-0 font-mono text-[0.7rem] text-[#6d7582]">{track.playedLabel}</p>
                        </motion.a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-10">
                {topArtists.length > 0 && (
                  <div>
                    <div className="mb-4 flex items-center gap-2">
                      <Users className="h-4 w-4 text-[#cfcfcf]" />
                      <p className="eyebrow">top artists</p>
                    </div>
                    <p className="mb-5 max-w-md text-sm leading-relaxed text-[#8d94a0]">the people responsible for my personality.</p>
                    <div className="grid grid-cols-2 gap-4 sm:flex sm:flex-wrap">
                      {topArtistCards.map((artist, i) => (
                        <motion.a
                          key={artist.url ?? `${artist.name}-${i}`}
                          href={artist.url ?? "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(event) => {
                            if (!artist.url) event.preventDefault()
                          }}
                          className={`group paper-card flex w-full flex-col items-center p-5 text-center hover-bounce sm:w-auto ${
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
                            className="mb-3 flex h-20 w-20 items-center justify-center overflow-hidden border-2 border-[#333] bg-[#1a1a1a] transition-colors group-hover:border-[#e8e8e8]"
                            imgClassName="h-full w-full object-cover"
                            fallback={<Users className="h-8 w-8 text-[#444]" />}
                          />
                          <p className="w-full truncate text-sm font-semibold text-[#eef1f5] group-hover:underline">{artist.name}</p>
                          {artist.genreLabel && (
                            <p className="mt-1 w-full truncate text-xs text-[#88909c]">{artist.genreLabel}</p>
                          )}
                        </motion.a>
                      ))}
                    </div>
                  </div>
                )}

                {topTracks.length > 0 && (
                  <div>
                    <div className="mb-4 flex items-center gap-2">
                      <Headphones className="h-4 w-4 text-[#cfcfcf]" />
                      <p className="eyebrow">all-time faves</p>
                    </div>
                    <p className="mb-5 max-w-md text-sm leading-relaxed text-[#8d94a0]">the songs i have played to death.</p>
                    <div className="grid gap-3 xl:grid-cols-2">
                      {topTrackRows.map((track, i) => (
                        <motion.a
                          key={track.songUrl ?? `${track.title}-${track.artist}-${i}`}
                          href={track.songUrl ?? "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(event) => {
                            if (!track.songUrl) event.preventDefault()
                          }}
                          className="paper-card group flex w-full items-center gap-4 p-4"
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.04, duration: 0.3 }}
                        >
                          <span className="tabular w-5 shrink-0 font-mono text-xs text-[#666]">{track.rankLabel}</span>
                          <SpotifyArtwork
                            src={track.albumImageUrl}
                            alt={track.album}
                            loading="lazy"
                            className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden border border-[#333] bg-[#1a1a1a]"
                            imgClassName="h-full w-full object-cover"
                            fallback={<span className="text-xs text-[#444]">♪</span>}
                          />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-[#eef1f5] group-hover:underline">{track.title}</p>
                            <p className="truncate text-xs text-[#8e96a2]">{track.artist}</p>
                          </div>
                        </motion.a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            ) : (
              <div className="note-frame px-5 py-5 md:px-6">
                <p className="eyebrow mb-3">soundtrack lately</p>
                <h2 className="section-title text-2xl font-semibold text-[#eef1f5] md:text-3xl">
                  the music shelf is quiet right now.
                </h2>
                <p className="section-lede mt-3 text-sm">
                  spotify answered, but there is nothing worth pinning to the page at the moment.
                </p>
              </div>
            )}
          </motion.div>
        </section>
      )}

      {/* ---- TERMINAL ---- */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 pb-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          <div className="section-rule mb-10" />
          <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div className="section-stack lg:sticky lg:top-24">
              <div className="note-frame px-5 py-5 md:px-6">
                <p className="eyebrow mb-3">terminal corner</p>
                <h2 className="section-title text-2xl font-semibold text-[#eef1f5] md:text-3xl">
                  a small puzzle for people who click the blinking thing.
                </h2>
                <p className="section-lede mt-3 text-sm">
                  you do not need terminal muscle memory for this. it reads more like a tiny investigation than a full-on CTF.
                </p>
              </div>

              <div className="signal-panel px-5 py-5 md:px-6">
                <p className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-[#7d8592]">getting started</p>
                <div className="mt-4 space-y-3">
                  {terminalNotes.map((note) => (
                    <div key={note} className="flex gap-3 border-t border-[#232830] pt-3 first:border-t-0 first:pt-0">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 bg-[#d7dbe2]" />
                      <p className="text-sm leading-relaxed text-[#cbd0d8]">{note}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:pl-2">
              <MusicDCTF />
            </div>
          </div>
        </motion.div>
      </section>

      {/* ---- SOCIALS ---- */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 pb-14">
        <motion.div
          className="pt-2"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5 }}
        >
          <div className="section-rule mb-10" />
          <div className="grid gap-5 lg:grid-cols-[0.82fr_1.18fr]">
            <div className="note-frame px-5 py-5 md:px-6">
              <p className="eyebrow mb-3">elsewhere</p>
              <h2 className="section-title text-2xl font-semibold text-[#eef1f5] md:text-3xl">
                other corners of the internet.
              </h2>
              <p className="section-lede mt-3 text-sm">
                the cleaner routes if you want code, contact, or the more professional version of this whole thing.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {socials.map((s, i) => (
                <motion.a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="paper-card flex min-h-[148px] flex-col justify-between p-5 text-sm text-[#bbb] transition-colors hover-bounce hover:text-[#e8e8e8]"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.35 }}
                >
                  <div>
                    <div className="mb-3 flex items-center gap-2.5">
                      <s.icon className="h-4 w-4" />
                      <span className="draw-underline font-mono text-xs uppercase tracking-[0.14em]">{s.label}</span>
                    </div>
                    <p className="text-sm leading-relaxed text-[#9ea5b0]">{s.note}</p>
                  </div>
                  <div className="mt-5 flex items-center gap-2 font-mono text-[0.72rem] text-[#727985]">
                    <span>open link</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </motion.a>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* ---- FOOTER ---- */}
      <footer className="relative z-10 border-t border-[#333]">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-7 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <p className="font-mono text-xs text-[#888]">som chandra, 2025</p>
            <LegalLinks />
          </div>
          <p className="font-mono text-xs text-[#666]">made with monster and bunch of tokens</p>
        </div>
      </footer>
    </main>
  )
}
