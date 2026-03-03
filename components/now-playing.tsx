"use client"

import { motion } from "framer-motion"
import { Disc3 } from "lucide-react"
import useSWR from "swr"
import { fetcher, getRelativePlayedText, type NowPlayingData } from "@/lib/creative-data"

export function NowPlaying() {
  const { data: nowPlaying } = useSWR<NowPlayingData>("/api/spotify/now-playing", fetcher, { refreshInterval: 30000 })
  const isNowPlaying = nowPlaying?.mode === "now_playing"
  const relativePlayed = getRelativePlayedText(nowPlaying?.playedAt)

  if (!nowPlaying?.isPlaying) return null

  return (
    <section className="relative z-10 mx-auto max-w-4xl px-6 pt-6 pb-2">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.5 }}
      >
        <div className="border-t border-[#333] pt-8">
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
  )
}
