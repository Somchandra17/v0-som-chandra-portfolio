"use client"

import { useState, useEffect, useRef, type MouseEvent } from "react"
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import { MusicDCTF } from "@/components/musicd-ctf"
import { TextMorph } from "@/components/text-morph"
import { PretextHighlight } from "@/components/pretext-highlight"
import {
  Terminal, Pen, Github, Linkedin, Mail, ExternalLink,
  ArrowRight, ArrowDown, Music, Disc3, Headphones, Users, Clock,
} from "lucide-react"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

function getRelativePlayedText(playedAt?: string): string | null {
  if (!playedAt) return null
  const playedDate = new Date(playedAt)
  if (Number.isNaN(playedDate.getTime())) return null

  const diffSeconds = Math.round((playedDate.getTime() - Date.now()) / 1000)
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" })

  const diffMinutes = Math.round(diffSeconds / 60)
  if (Math.abs(diffMinutes) < 60) return rtf.format(diffMinutes, "minute")

  const diffHours = Math.round(diffMinutes / 60)
  if (Math.abs(diffHours) < 24) return rtf.format(diffHours, "hour")

  const diffDays = Math.round(diffHours / 24)
  return rtf.format(diffDays, "day")
}

const socials = [
  { label: "GitHub", href: "https://github.com/somchandra17", icon: Github },
  { label: "LinkedIn", href: "https://linkedin.com/in/somchandra17", icon: Linkedin },
  { label: "Email", href: "mailto:somchandra.infosec@gmail.com", icon: Mail },
  { label: "somm.tf", href: "https://www.somm.tf", icon: ExternalLink },
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

type NowPlayingData = {
  isPlaying: boolean
  isCurrentlyPlaying?: boolean
  mode?: "now_playing" | "last_played"
  playedAt?: string
  title?: string
  artist?: string
  album?: string
  albumImageUrl?: string
  songUrl?: string
}

type Track = {
  title: string
  artist: string
  album: string
  albumImageUrl?: string
  songUrl: string
}

type PlaylistTrack = Track & { addedAt: string }
type RecentTrack = Track & { playedAt: string }

type Artist = {
  name: string
  genres: string[]
  imageUrl?: string
  url: string
}

export default function Home() {
  const router = useRouter()
  const [hoverSide, setHoverSide] = useState<"nerdy" | "creative" | null>(null)
  const [nameMode, setNameMode] = useState<"default" | "nerdy" | "creative">("default")
  const [isHoverLocked, setIsHoverLocked] = useState(false)
  const [isNerdyRouting, setIsNerdyRouting] = useState(false)
  const [factIdx, setFactIdx] = useState(0)

  const cycleName = () => {
    sessionStorage.setItem("som-name-clicked", "1")
    setIsHoverLocked(true)
    setNameMode((prev) => prev === "default" ? "nerdy" : prev === "nerdy" ? "default" : "default")
  }

  const handleNerdyOpen = (event: MouseEvent<HTMLAnchorElement>) => {
    if (isNerdyRouting) {
      event.preventDefault()
      return
    }

    const hasClickedName = sessionStorage.getItem("som-name-clicked") === "1"
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

  const { data: nowPlaying } = useSWR<NowPlayingData>("/api/spotify/now-playing", fetcher, { refreshInterval: 30000 })
  const { data: topTracksData } = useSWR<{ tracks: Track[] }>("/api/spotify/top-tracks", fetcher)
  const { data: topArtistsData } = useSWR<{ artists: Artist[] }>("/api/spotify/top-artists", fetcher)
  const { data: recentData } = useSWR<{ tracks: RecentTrack[] }>("/api/spotify/recently-played", fetcher)
  const { data: playlistData } = useSWR<{ tracks: PlaylistTrack[] }>("/api/spotify/playlist", fetcher)

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

  const topTracks = topTracksData?.tracks || []
  const topArtists = topArtistsData?.artists || []
  const recentTracks = recentData?.tracks || []
  const playlistTracks = playlistData?.tracks || []
  const isNowPlaying = nowPlaying?.mode === "now_playing"
  const relativePlayed = getRelativePlayedText(nowPlaying?.playedAt)

  return (
    <main className="relative min-h-screen">

      {/* ---- HERO: fills viewport ---- */}
      <section ref={heroRef} className="relative">
        <motion.div
          className="relative z-10 mx-auto max-w-5xl px-6 flex flex-col justify-center min-h-screen"
          style={{ opacity: heroOpacity, y: heroY }}
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

            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[#e8e8e8] leading-[1.15]">
              <span className="block cursor-pointer" onClick={cycleName}>
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
              </span>
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
                    className="paper-card relative p-7 md:p-9 min-h-[220px] flex flex-col justify-between overflow-hidden hover-wiggle"
                    animate={nameMode === "nerdy" ? {
                      borderColor: "#7fb07f",
                      boxShadow: "0 0 20px rgba(127, 176, 127, 0.3)"
                    } : {
                      borderColor: "#2a2a2a",
                      boxShadow: "none"
                    }}
                    transition={{ duration: 0.5 }}
                    style={{ border: "1px solid" }}
                  >
                    <div className="tape-top" />
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
                    className="paper-card relative p-7 md:p-9 min-h-[220px] flex flex-col justify-between overflow-hidden hover-wiggle"
                    animate={hoverSide === "creative" ? {
                      borderColor: "#f0c6cf",
                      boxShadow: "0 0 20px rgba(240, 198, 207, 0.3)"
                    } : {
                      borderColor: "#2a2a2a",
                      boxShadow: "none"
                    }}
                    transition={{ duration: 0.5 }}
                    style={{ border: "1px solid" }}
                  >
                    <div className="tape-top" />
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
              <div className="flex items-center gap-2 mb-4">
                <Disc3
                  className={`h-4 w-4 ${isNowPlaying ? "animate-spin text-[#1DB954]" : "text-[#767676]"}`}
                  style={{ animationDuration: "3s" }}
                />
                <p className={`font-mono text-xs tracking-widest uppercase ${isNowPlaying ? "text-[#1DB954]" : "text-[#8a8a8a]"}`}>
                  {isNowPlaying ? "now playing" : "last played song"}
                </p>
                {!isNowPlaying && (
                  <span className="border border-[#3a3a3a] bg-[#141414] px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-[#8b8b8b]">
                    afk
                  </span>
                )}
                {!isNowPlaying && relativePlayed && (
                  <span className="font-mono text-[10px] text-[#6f6f6f]">({relativePlayed})</span>
                )}
              </div>
              <a
                href={nowPlaying.songUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="paper-card p-5 flex items-center gap-5 hover-bounce group"
              >
                {nowPlaying.albumImageUrl && (
                  <img
                    src={nowPlaying.albumImageUrl}
                    alt={nowPlaying.album}
                    className="w-16 h-16 object-cover border border-[#333] shrink-0"
                    crossOrigin="anonymous"
                  />
                )}
                <div className="min-w-0">
                  <p className="text-base font-bold text-[#e8e8e8] truncate group-hover:underline">{nowPlaying.title}</p>
                  <p className="text-sm text-[#aaa] truncate">{nowPlaying.artist}</p>
                  <p className="text-xs text-[#666] truncate mt-0.5">{nowPlaying.album}</p>
                </div>
              </a>
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

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                {topArtists.slice(0, 5).map((artist, i) => (
                  <motion.a
                    key={artist.url}
                    href={artist.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="paper-card p-5 flex flex-col items-center text-center hover-bounce group"
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06, duration: 0.35 }}
                  >
                    <div
                      className="w-20 h-20 border-2 border-[#333] bg-[#1a1a1a] mb-3 flex items-center justify-center overflow-hidden group-hover:border-[#e8e8e8] transition-colors"
                      style={{ borderRadius: "50%" }}
                    >
                      {artist.imageUrl ? (
                        <img
                          src={artist.imageUrl}
                          alt={artist.name}
                          className="w-full h-full object-cover"
                          crossOrigin="anonymous"
                          loading="lazy"
                          onError={(e) => { e.currentTarget.style.display = 'none' }}
                        />
                      ) : (
                        <Users className="h-8 w-8 text-[#444]" />
                      )}
                    </div>
                    <p className="text-sm font-bold text-[#e8e8e8] group-hover:underline truncate w-full">{artist.name}</p>
                    {artist.genres.length > 0 && (
                      <p className="text-xs text-[#888] truncate w-full mt-1">{artist.genres.join(", ")}</p>
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {topTracks.slice(0, 5).map((track, i) => (
                  <motion.a
                    key={track.songUrl + i}
                    href={track.songUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="paper-card p-4 flex items-center gap-4 hover-bounce group"
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.04, duration: 0.3 }}
                  >
                    <span className="font-mono text-xs text-[#666] w-5 shrink-0">{String(i + 1).padStart(2, "0")}</span>
                    <div className="w-10 h-10 shrink-0 border border-[#333] bg-[#1a1a1a] flex items-center justify-center overflow-hidden">
                      {track.albumImageUrl ? (
                        <img 
                          src={track.albumImageUrl} 
                          alt={track.album} 
                          className="w-full h-full object-cover" 
                          crossOrigin="anonymous"
                          loading="lazy"
                          onError={(e) => { e.currentTarget.style.display = 'none' }}
                        />
                      ) : (
                        <span className="text-[#444] text-xs">♪</span>
                      )}
                    </div>
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

              <div className="space-y-2">
                {recentTracks.slice(0, 5).map((track, i) => (
                  <motion.a
                    key={track.songUrl + track.playedAt}
                    href={track.songUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="paper-card p-3 flex items-center gap-4 hover-bounce group"
                    initial={{ opacity: 0, x: -8 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.03, duration: 0.25 }}
                  >
                    <div className="w-8 h-8 shrink-0 border border-[#333] bg-[#1a1a1a] flex items-center justify-center overflow-hidden">
                      {track.albumImageUrl ? (
                        <img 
                          src={track.albumImageUrl} 
                          alt={track.album} 
                          className="w-full h-full object-cover" 
                          crossOrigin="anonymous"
                          loading="lazy"
                          onError={(e) => { e.currentTarget.style.display = 'none' }}
                        />
                      ) : (
                        <span className="text-[#444] text-xs">♪</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-[#e8e8e8] truncate group-hover:underline">{track.title}</p>
                      <p className="text-xs text-[#aaa] truncate">{track.artist}</p>
                    </div>
                    <p className="font-mono text-xs text-[#666] shrink-0">
                      {new Date(track.playedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.div>
        </section>
      )}

      {/* ---- PLAYLIST (from API, sorted recently added) ---- */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 pb-10">
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

      {/* ---- SOCIALS ---- */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 pb-14">
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
