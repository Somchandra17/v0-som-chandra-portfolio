"use client"

import { motion } from "framer-motion"
import { Disc3 } from "lucide-react"
import useSWR from "swr"
import { SpotifyArtwork } from "@/components/spotify-artwork"
import { fetcher, getRelativePlayedText, type NowPlayingData } from "@/lib/creative-data"

export function SpotifyNowPlayingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="data-skeleton h-8 w-8" />
        <div className="data-skeleton h-8 w-32" />
        <div className="data-skeleton h-8 w-14" />
        <div className="data-skeleton h-8 w-24" />
      </div>
      <div className="data-skeleton grid gap-4 p-4 md:grid-cols-[auto_minmax(0,1fr)] md:items-center">
        <div className="h-16 w-16 bg-[#12151b]" />
        <div className="space-y-2">
          <div className="h-4 w-40 bg-[#12151b]" />
          <div className="h-3 w-28 bg-[#12151b]" />
          <div className="h-3 w-52 bg-[#12151b]" />
        </div>
      </div>
    </div>
  )
}

export function SpotifyNowPlayingContent({ nowPlaying }: { nowPlaying: NowPlayingData }) {
  const isNowPlaying = nowPlaying?.mode === "now_playing"
  const relativePlayed = getRelativePlayedText(nowPlaying?.playedAt)
  const title = nowPlaying.title ?? "Unknown track"
  const artist = nowPlaying.artist ?? "Unknown artist"
  const album = nowPlaying.album ?? "Unknown album"
  const statusTone = isNowPlaying ? "#1DB954" : "#8d94a0"
  const content = (
    <>
      <SpotifyArtwork
        src={nowPlaying.albumImageUrl}
        alt={album || title}
        loading="eager"
        className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden border border-[#333] bg-[#111]"
        imgClassName="w-full h-full object-cover"
        fallback={<span className="text-[#444] text-xs">♪</span>}
      />
      <div className="min-w-0 space-y-1">
        <p className="truncate text-base font-bold text-[#e8e8e8] group-hover:underline">{title}</p>
        <p className="truncate text-sm text-[#aaa]">{artist}</p>
        <p className="truncate text-xs text-[#666]">{album}</p>
      </div>
    </>
  )

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center border border-[#2b3039] bg-[#0f1318]">
          <Disc3
            className={`h-4 w-4 ${isNowPlaying ? "animate-spin text-[#1DB954]" : "text-[#767676]"}`}
            style={{ animationDuration: "3s" }}
          />
        </span>
        <span
          className="data-chip px-3 py-1.5 font-mono text-[0.66rem] uppercase tracking-[0.18em]"
          style={{ color: statusTone }}
        >
          {isNowPlaying ? "now playing" : "last played song"}
        </span>
        {!isNowPlaying && (
          <span className="data-chip px-2.5 py-1.5 font-mono text-[0.64rem] uppercase tracking-[0.18em] text-[#8b929e]">
            afk
          </span>
        )}
        {!isNowPlaying && relativePlayed && (
          <span className="data-chip tabular px-2.5 py-1.5 font-mono text-[0.64rem] text-[#737b88]">
            {relativePlayed}
          </span>
        )}
      </div>
      {nowPlaying.songUrl ? (
        <a
          href={nowPlaying.songUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="paper-card group grid gap-4 p-4 transition-colors md:grid-cols-[auto_minmax(0,1fr)] md:items-center md:p-5"
          style={isNowPlaying ? { borderColor: "rgba(29, 185, 84, 0.35)" } : undefined}
        >
          {content}
        </a>
      ) : (
        <div
          className="paper-card grid gap-4 p-4 md:grid-cols-[auto_minmax(0,1fr)] md:items-center md:p-5"
          style={isNowPlaying ? { borderColor: "rgba(29, 185, 84, 0.35)" } : undefined}
        >
          {content}
        </div>
      )}
    </>
  )
}

export function NowPlaying() {
  const { data: nowPlaying } = useSWR<NowPlayingData>("/api/spotify/now-playing", fetcher, { refreshInterval: 30000 })

  if (!nowPlaying?.title) return null

  return (
    <section className="relative z-10 mx-auto max-w-4xl px-6 pt-6 pb-2">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.5 }}
      >
        <div className="border-t border-[#333] pt-8">
          <SpotifyNowPlayingContent nowPlaying={nowPlaying} />
        </div>
      </motion.div>
    </section>
  )
}
