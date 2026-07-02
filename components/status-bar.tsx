"use client"

import { useEffect, useState } from "react"
import useSWR from "swr"
import { fetcher, type NowPlayingData } from "@/lib/creative-data"

/**
 * The nerdy world's tmux-style status strip: a thin mono bar under the page header.
 * Segments fail soft — whatever data is missing simply doesn't render.
 */
export function StatusBar() {
  const { data: nowPlaying } = useSWR<NowPlayingData>("/api/spotify/now-playing", fetcher, {
    refreshInterval: 60000,
  })
  const [clock, setClock] = useState<string | null>(null)

  useEffect(() => {
    const tick = () =>
      setClock(
        new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })
      )
    tick()
    const id = setInterval(tick, 30_000)
    return () => clearInterval(id)
  }, [])

  const track =
    nowPlaying && (nowPlaying.isPlaying || nowPlaying.mode === "last_played") && nowPlaying.title
      ? `${nowPlaying.isPlaying && nowPlaying.isCurrentlyPlaying !== false ? "♪" : "⏸"} ${nowPlaying.title}`
      : null

  return (
    <div
      aria-hidden
      className="sticky top-[57px] z-30 hidden border-b border-ink-700 bg-ink-900/92 backdrop-blur-sm sm:block"
    >
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-6 py-1">
        <div className="flex min-w-0 items-center gap-4 font-mono text-[0.6rem] tracking-[0.14em] text-ink-400">
          <span className="text-world-dim">[0]</span>
          <span className="text-world">0xs0m@somm.tf</span>
          <span className="hidden md:inline">~/nerdy</span>
          {track && <span className="min-w-0 truncate text-ink-400">{track}</span>}
        </div>
        <div className="flex shrink-0 items-center gap-4 font-mono text-[0.6rem] tracking-[0.14em] text-ink-400">
          <span className="hidden md:inline">bash 5.2</span>
          {clock && <span className="text-ink-300">{clock}</span>}
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-1.5 w-1.5 animate-pulse bg-world" />
            <span className="text-world-dim">online</span>
          </span>
        </div>
      </div>
    </div>
  )
}
