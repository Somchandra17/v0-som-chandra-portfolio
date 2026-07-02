"use client"

import { useWorld } from "@/components/world-context"

/**
 * The one section divider. Nerdy: a terminal rule with an end tick (like a shell
 * separator). Creative: film-strip notches. Neutral surfaces get a plain hairline.
 */
export function SectionRule({ className = "" }: { className?: string }) {
  const world = useWorld()

  if (world === "creative") {
    return (
      <div aria-hidden className={`mx-auto max-w-5xl px-6 ${className}`}>
        <div className="flex items-center gap-1.5">
          <div className="h-px flex-1 bg-ink-600" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-1.5 w-2.5 border border-ink-600 bg-ink-800" />
          ))}
          <div className="h-px flex-1 bg-ink-600" />
        </div>
      </div>
    )
  }

  if (world === "nerdy") {
    return (
      <div aria-hidden className={`mx-auto max-w-4xl px-6 ${className}`}>
        <div className="flex items-center gap-2 font-mono text-[0.6rem] text-ink-500">
          <span className="text-world-dim">──</span>
          <div className="h-px flex-1 bg-ink-600" />
          <span className="tracking-[0.2em] text-ink-500">EOF</span>
        </div>
      </div>
    )
  }

  return (
    <div aria-hidden className={`mx-auto max-w-5xl px-6 ${className}`}>
      <div className="h-px bg-ink-600" />
    </div>
  )
}
