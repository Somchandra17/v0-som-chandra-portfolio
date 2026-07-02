"use client"

import { motion } from "framer-motion"
import { Github } from "lucide-react"
import useSWR from "swr"
import { fetcher } from "@/lib/creative-data"
import { GithubGraph, type Contributions } from "@/components/github-graph"

type GitHubStatsData = {
  commitsThisYear: number | null
  publicRepos: number | null
  followers: number | null
  contributions: Contributions | null
  year: number
}

export function GitHubStats() {
  const { data, error } = useSWR<GitHubStatsData>("/api/github", fetcher)
  const year = data?.year ?? new Date().getFullYear()

  const stats = [
    { value: data?.commitsThisYear, label: `commits in ${year}` },
    { value: data?.publicRepos, label: "public repos" },
    { value: data?.followers, label: "followers" },
  ]

  // True fetch failure (network/server down) — the API itself fails soft with nulls, so this
  // only fires when the endpoint is unreachable. Show a quiet, theme-matched note.
  if (error) {
    return (
      <div className="mt-8">
        <div className="mb-4 flex items-center gap-2">
          <Github className="h-3.5 w-3.5 text-ink-300" aria-hidden="true" />
          <p className="font-mono text-xs tracking-widest uppercase text-ink-300">github, lately</p>
        </div>
        <p className="paper-card px-4 py-3 text-sm text-ink-300">couldn&apos;t reach github right now</p>
      </div>
    )
  }

  // Until the stats load (or if the API fails) render nothing — no broken/empty cards.
  if (!stats.some((s) => typeof s.value === "number")) return null

  return (
    <motion.div
      className="mt-8"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
    >
      <div className="mb-4 flex items-center gap-2">
        <Github className="h-3.5 w-3.5 text-ink-300" aria-hidden="true" />
        <p className="font-mono text-xs tracking-widest uppercase text-ink-300">github, lately</p>
      </div>
      <div className="flex flex-wrap gap-4">
        {stats.map((s) => (
          <div key={s.label} className="paper-card px-4 py-3 hover-bounce">
            <p className="text-lg md:text-xl font-bold text-ink-100 tabular-nums">
              {typeof s.value === "number" ? s.value.toLocaleString() : "—"}
            </p>
            <p className="mt-0.5 text-xs font-mono text-ink-300">{s.label}</p>
          </div>
        ))}
      </div>
      {data?.contributions && <GithubGraph data={data.contributions} />}
    </motion.div>
  )
}
