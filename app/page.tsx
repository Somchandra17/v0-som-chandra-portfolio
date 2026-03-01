"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion"
import Link from "next/link"
import useSWR from "swr"
import { MusicDCTF } from "@/components/musicd-ctf"
import {
  Terminal, Pen, Github, Linkedin, Mail, ExternalLink,
  ArrowRight, ArrowDown, Music, Disc3, Headphones, Users, Clock,
} from "lucide-react"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

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
  "has mass tabs open. no regrets.",
  "talking to rubber duck again",
  "googling error for the 47th time",
  "accidentally rm -rf'd something important",
  "forgot to push before leaving",
  "arguing with a yaml file",
  "broke prod on a friday. again.",
  "pretending to understand kubernetes",
  "ctrl+z is my best friend",
  "alt-tabbing between terminal and spotify",
  "wrote a script to automate a 2-min task. took 3 hours.",
  "sudo make me a sandwich",
  "the bug was a missing semicolon. always is.",
  "stack overflow is down. panic mode.",
  "renaming variables for the 5th time today",
  "coffee machine broken. code red.",
  "found a bug. turns out it was a feature.",
  "accidentally opened vim. send help.",
  "my code works. I have no idea why.",
  "refactoring code I wrote 2 weeks ago like it's someone else's",
  "the wifi dropped mid-deploy. classic.",
  "explaining to friends what I do for a living",
  "git blame: it was me all along",
  "wrote tests. they passed. now I'm suspicious.",
  "copy-pasted from stack overflow. it worked first try. terrifying.",
  "spent an hour on a bug. it was a typo.",
  "dark mode everything. my eyes thank me.",
  "sleep is just a variable I never initialize",
  "i speak fluent python and broken hindi",
  "my rubber duck deserves a raise",
  "404: social life not found",
  "i hack things legally. mostly.",
  "drawing things no one asked for since 2005",
  "i photograph things instead of experiencing them",
]

const heroLines = [
  "i break things for a living.",
  "i draw things nobody asked for.",
  "i hack stuff. legally. mostly.",
  "i take photos of random things.",
  "half nerd, half artist, fully caffeinated.",
  "cybersecurity by day, doodling by night.",
  "i have two personalities and one website.",
]

type NowPlayingData = {
  isPlaying: boolean
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
  const [hoverSide, setHoverSide] = useState<"nerdy" | "creative" | null>(null)
  const [factIdx, setFactIdx] = useState(0)
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

  return (
    <main className="relative min-h-screen">

      {/* ---- HERO: fills viewport ---- */}
      <motion.section
        ref={heroRef}
        className="relative z-10 mx-auto max-w-5xl px-6 flex flex-col justify-center min-h-screen"
        style={{ opacity: heroOpacity, y: heroY }}
      >
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
          <p className="font-mono text-xs tracking-widest uppercase text-[#999] mb-6">
            oh hey, you found this page
          </p>

          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[#e8e8e8] leading-[1.15]">
            <span className="block">{"i'm som."}</span>
          </h1>

          {/* Cycling hero tagline */}
          <div className="mt-3 h-10 md:h-12 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.p
                key={heroIdx}
                className="text-xl md:text-2xl lg:text-3xl font-bold text-[#777]"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.35 }}
              >
                {heroLines[heroIdx]}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Auto-cycling fun fact */}
          <div className="mt-6 h-6 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.p
                key={factIdx}
                className="font-mono text-sm text-[#666]"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
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
              onHoverStart={() => setHoverSide("nerdy")}
              onHoverEnd={() => setHoverSide(null)}
              className="group"
            >
              <Link href="/nerdy">
                <div className="paper-card relative p-7 md:p-9 min-h-[220px] flex flex-col justify-between overflow-hidden hover-wiggle">
                  <div className="tape-top" />
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex h-9 w-9 items-center justify-center border border-[#333]">
                        <Terminal className="h-4 w-4 text-[#e8e8e8]" />
                      </div>
                      <span className="font-mono text-xs text-[#666]">{"> whoami"}</span>
                    </div>
                    <h2 className="text-xl md:text-2xl font-bold text-[#e8e8e8] tracking-tight mb-2">
                      the nerdy side
                    </h2>
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
              <Link href="/creative">
                <div className="paper-card relative p-7 md:p-9 min-h-[220px] flex flex-col justify-between overflow-hidden hover-wiggle">
                  <div className="tape-top" />
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex h-9 w-9 items-center justify-center border border-[#333]">
                        <Pen className="h-4 w-4 text-[#e8e8e8]" />
                      </div>
                      <span className="font-mono text-xs text-[#666]">~</span>
                    </div>
                    <h2 className="text-xl md:text-2xl font-bold text-[#e8e8e8] tracking-tight mb-2">
                      the unhinged side
                    </h2>
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
                  <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-[#e8e8e8] group-hover:w-full transition-all duration-500" />
                </div>
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
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <p className="font-mono text-xs text-[#666]">scroll for vibes</p>
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
            <ArrowDown className="h-4 w-4 text-[#666]" />
          </motion.div>
        </motion.div>
      </motion.section>


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
                <Disc3 className="h-4 w-4 text-[#1DB954] animate-spin" style={{ animationDuration: "3s" }} />
                <p className="font-mono text-xs tracking-widest uppercase text-[#1DB954]">now playing</p>
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

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {topArtists.map((artist, i) => (
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
                    {artist.imageUrl ? (
                      <img
                        src={artist.imageUrl}
                        alt={artist.name}
                        className="w-20 h-20 object-cover border-2 border-[#333] mb-3 group-hover:border-[#e8e8e8] transition-colors"
                        style={{ borderRadius: "50%" }}
                        crossOrigin="anonymous"
                      />
                    ) : (
                      <div
                        className="w-20 h-20 border-2 border-[#333] bg-[#1a1a1a] mb-3 flex items-center justify-center"
                        style={{ borderRadius: "50%" }}
                      >
                        <Users className="h-8 w-8 text-[#444]" />
                      </div>
                    )}
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
                {topTracks.slice(0, 10).map((track, i) => (
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
                    {track.albumImageUrl && (
                      <img src={track.albumImageUrl} alt={track.album} className="w-10 h-10 object-cover border border-[#333] shrink-0" crossOrigin="anonymous" />
                    )}
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
                {recentTracks.slice(0, 8).map((track, i) => (
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
                    {track.albumImageUrl && (
                      <img src={track.albumImageUrl} alt={track.album} className="w-8 h-8 object-cover border border-[#333] shrink-0" crossOrigin="anonymous" />
                    )}
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
          <p className="font-mono text-xs text-[#888]">som chandra -- 2025</p>
          <p className="font-mono text-xs text-[#666]">made with mass of coffee</p>
        </div>
      </footer>
    </main>
  )
}
