"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import useSWR from "swr"
import { Terminal, Pen, Github, Linkedin, Mail, ExternalLink, ArrowRight, ArrowDown, Music, Disc3, Headphones, Users } from "lucide-react"

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
  "has mass tabs open",
  "talking to rubber duck",
  "googling error for the 47th time",
  "accidentally rm -rf'd something important",
  "forgot to push before leaving",
  "arguing with a yaml file",
  "broke prod on a friday. again.",
  "pretending to understand kubernetes",
  "ctrl+z is my best friend",
  "alt-tabbing between terminal and spotify",
  "wrote a script to automate a 2-minute task. took 3 hours.",
  "sudo make me a sandwich",
  "the bug was a missing semicolon. always is.",
  "stack overflow is down. panic.",
  "renaming variables for the 5th time today",
  "coffee machine broken. this is a crisis.",
  "found a bug. it was a feature.",
  "accidentally opened vim. send help.",
  "my code works. I have no idea why.",
  "refactoring code I wrote 2 weeks ago like it's someone else's",
  "the wifi dropped mid-deploy",
  "explaining to non-tech friends what I do for a living",
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

  const { data: nowPlaying } = useSWR<NowPlayingData>("/api/spotify/now-playing", fetcher, { refreshInterval: 30000 })
  const { data: topTracksData } = useSWR<{ tracks: Track[] }>("/api/spotify/top-tracks", fetcher)
  const { data: topArtistsData } = useSWR<{ artists: Artist[] }>("/api/spotify/top-artists", fetcher)
  const { data: recentData } = useSWR<{ tracks: RecentTrack[] }>("/api/spotify/recently-played", fetcher)

  useEffect(() => {
    const interval = setInterval(() => {
      setFactIdx((p) => (p + 1) % funFacts.length)
    }, 2200)
    return () => clearInterval(interval)
  }, [])

  const topTracks = topTracksData?.tracks || []
  const topArtists = topArtistsData?.artists || []
  const recentTracks = recentData?.tracks || []

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
          <p className="font-mono text-xs tracking-widest uppercase text-[#999] mb-6">
            oh hey, you found this page
          </p>

          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[#e8e8e8] leading-[1.15]">
            <span className="block">{"i'm som."}</span>
            <span className="block mt-2 text-[#999]">
              {"i break things "}
              <span className="text-[#e8e8e8] scribble-underline">{"for work"}</span>
            </span>
            <span className="block mt-1 text-[#999]">
              {"& make things "}
              <span className="text-[#e8e8e8] scribble-underline">{"for fun"}</span>
              {"."}
            </span>
          </h1>

          {/* Auto-cycling fun fact */}
          <div className="mt-6 h-6 overflow-hidden">
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
            className="mt-5 font-mono text-xs text-[#555] h-5"
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
      </section>

      {/* ---- NOW PLAYING (below the fold) ---- */}
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

      {/* ---- SPOTIFY PLAYLIST EMBED ---- */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 pb-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          <div className="border-t border-[#333] pt-10">
            <div className="flex items-center gap-3 mb-2">
              <Music className="h-4 w-4 text-[#999]" />
              <p className="font-mono text-xs tracking-widest uppercase text-[#999]">
                the playlist
              </p>
            </div>
            <p className="text-sm text-[#666] mb-6">
              {"judge me by my music taste. i dare you."}
            </p>

            <div className="paper-card p-0 overflow-hidden">
              <iframe
                style={{ border: "none", display: "block" }}
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
                <Headphones className="h-4 w-4 text-[#999]" />
                <p className="font-mono text-xs tracking-widest uppercase text-[#999]">all-time faves</p>
              </div>
              <p className="text-sm text-[#666] mb-6">{"the songs i've worn out completely"}</p>

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
                    <span className="font-mono text-xs text-[#555] w-5 shrink-0">{String(i + 1).padStart(2, "0")}</span>
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
                <Users className="h-4 w-4 text-[#999]" />
                <p className="font-mono text-xs tracking-widest uppercase text-[#999]">top artists</p>
              </div>
              <p className="text-sm text-[#666] mb-6">{"the people responsible for my personality"}</p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {topArtists.map((artist, i) => (
                  <motion.a
                    key={artist.url}
                    href={artist.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="paper-card p-4 flex flex-col items-center text-center hover-bounce group"
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05, duration: 0.3 }}
                  >
                    {artist.imageUrl ? (
                      <img src={artist.imageUrl} alt={artist.name} className="w-16 h-16 object-cover border border-[#333] mb-3" style={{ borderRadius: "50%" }} crossOrigin="anonymous" />
                    ) : (
                      <div className="w-16 h-16 border border-[#333] bg-[#1a1a1a] mb-3 flex items-center justify-center" style={{ borderRadius: "50%" }}>
                        <Users className="h-6 w-6 text-[#444]" />
                      </div>
                    )}
                    <p className="text-sm font-bold text-[#e8e8e8] group-hover:underline truncate w-full">{artist.name}</p>
                    <p className="text-xs text-[#666] truncate w-full mt-0.5">{artist.genres.join(", ")}</p>
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
                <Disc3 className="h-4 w-4 text-[#999]" />
                <p className="font-mono text-xs tracking-widest uppercase text-[#999]">recently played</p>
              </div>
              <p className="text-sm text-[#666] mb-6">{"what was in my ears a minute ago"}</p>

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
                    <p className="font-mono text-xs text-[#555] shrink-0">
                      {new Date(track.playedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.div>
        </section>
      )}

      {/* ---- SOCIALS ---- */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 pb-14">
        <motion.div
          className="border-t border-[#333] pt-10"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5 }}
        >
          <p className="font-mono text-xs tracking-widest uppercase text-[#999] mb-2">
            find me elsewhere
          </p>
          <p className="text-sm text-[#666] mb-6">
            {"(i sometimes reply)"}
          </p>

          <div className="flex flex-wrap gap-3">
            {socials.map((s, i) => (
              <motion.a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="paper-card flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#aaa] hover:text-[#e8e8e8] transition-colors hover-bounce"
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
          <p className="font-mono text-xs text-[#666]">som chandra -- 2025</p>
          <p className="font-mono text-xs text-[#555]">made with mass of coffee</p>
        </div>
      </footer>
    </main>
  )
}
